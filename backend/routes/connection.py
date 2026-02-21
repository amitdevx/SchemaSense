from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
import asyncpg
import logging
import uuid
from typing import Dict, Optional, List
from datetime import datetime
from utils.activity import log_activity, ActivityType

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["connection"])

# Multi-connection storage: {connection_id: {pool, host, db, ...}}
connections: Dict[str, dict] = {}

# Track the active connection ID
active_connection_id: Optional[str] = None

# Backward-compatible reference (points to active connection's data)
user_db_connection = {
    "host": None,
    "port": None,
    "user": None,
    "password": None,
    "database": None,
    "schema_filter": "public",
    "pool": None
}

def _sync_user_db_connection():
    """Sync the legacy user_db_connection dict with the active connection"""
    global active_connection_id
    if active_connection_id and active_connection_id in connections:
        conn_data = connections[active_connection_id]
        user_db_connection.clear()
        user_db_connection.update({
            "host": conn_data["host"],
            "port": conn_data["port"],
            "user": conn_data["user"],
            "password": conn_data["password"],
            "database": conn_data["database"],
            "schema_filter": conn_data.get("schema_filter", "public"),
            "pool": conn_data["pool"]
        })
    else:
        user_db_connection.clear()
        user_db_connection.update({
            "host": None, "port": None, "user": None,
            "password": None, "database": None,
            "schema_filter": "public", "pool": None
        })

class ConnectionRequest(BaseModel):
    host: str
    port: int = 5432
    user: str
    password: str
    database: str
    schema_filter: str = "public"
    name: Optional[str] = None
    database_type: str = "postgresql"

class ConnectionResponse(BaseModel):
    success: bool
    message: str
    database_info: dict = None
    connection_id: Optional[str] = None

class ConnectionInfo(BaseModel):
    id: str
    name: str
    host: str
    port: int
    database: str
    schema_filter: str
    is_active: bool
    connected_at: str
    database_type: str = "postgresql"

class ConnectionsList(BaseModel):
    connections: List[ConnectionInfo]
    active_id: Optional[str] = None
    total: int

def get_connection_by_id(connection_id: str) -> dict:
    """Get a specific connection by ID"""
    if connection_id not in connections:
        raise HTTPException(status_code=404, detail=f"Connection '{connection_id}' not found")
    return connections[connection_id]

def get_db_pool(connection_id: Optional[str] = None):
    """Get a database pool - by connection_id or the active connection"""
    global active_connection_id
    cid = connection_id or active_connection_id
    if not cid or cid not in connections:
        raise HTTPException(status_code=400, detail="No database connected. Please connect first.")
    conn_data = connections[cid]
    if not conn_data.get("pool"):
        raise HTTPException(status_code=400, detail="Connection pool is not available.")
    return conn_data["pool"]

def get_schema_filter_for(connection_id: Optional[str] = None) -> str:
    """Get schema filter for a connection"""
    global active_connection_id
    cid = connection_id or active_connection_id
    if cid and cid in connections:
        return connections[cid].get("schema_filter", "public")
    return user_db_connection.get("schema_filter", "public")

def get_db_type(connection_id: Optional[str] = None) -> str:
    """Get database type for a connection (postgresql or sqlserver)"""
    global active_connection_id
    cid = connection_id or active_connection_id
    if cid and cid in connections:
        return connections[cid].get("database_type", "postgresql")
    return "postgresql"

def get_user_db():
    """Get the active connection's database pool (backward compatible)"""
    if not user_db_connection.get("pool"):
        raise HTTPException(status_code=400, detail="No database connected. Please connect first.")
    return user_db_connection["pool"]

def get_connection_details(connection_id: Optional[str] = None) -> Optional[dict]:
    """Get connection metadata for cache key generation."""
    global active_connection_id
    cid = connection_id or active_connection_id
    if cid and cid in connections:
        c = connections[cid]
        return {
            "host": c["host"],
            "port": c["port"],
            "database": c["database"],
            "schema_filter": c.get("schema_filter", "public"),
            "user": c["user"],
        }
    return None

@router.post("/connect-db", response_model=ConnectionResponse)
async def connect_database(request: ConnectionRequest, response: Response):
    """Connect a new database and add to connections list"""
    global active_connection_id
    
    try:
        logger.info(f"Connection request received: {request.database_type} {request.host}:{request.port}/{request.database} schema_filter={request.schema_filter}")
        
        # Auto-fix schema_filter for SQL Server
        schema_filter = request.schema_filter
        if request.database_type == "sqlserver" and schema_filter == "public":
            schema_filter = "dbo"
        
        # Check for duplicate connection (same host, port, database, schema)
        for existing_id, existing in connections.items():
            if (existing["host"] == request.host and
                existing["port"] == request.port and
                existing["database"] == request.database and
                existing.get("schema_filter") == schema_filter):
                raise HTTPException(
                    status_code=409,
                    detail=f"Database '{request.database}' on {request.host}:{request.port} (schema: {schema_filter}) is already connected (ID: {existing_id})"
                )
        
        if request.database_type == "sqlserver":
            from utils.db_wrapper import MSSQLPoolWrapper
            pool = MSSQLPoolWrapper(
                host=request.host,
                port=request.port,
                user=request.user,
                password=request.password,
                database=request.database,
            )
            try:
                async with pool.acquire() as conn:
                    version = await conn.fetchval("SELECT @@VERSION")
            except Exception:
                await pool.close()
                raise
        else:
            pool = await asyncpg.create_pool(
                host=request.host,
                port=request.port,
                user=request.user,
                password=request.password,
                database=request.database,
                min_size=2,
                max_size=10,
                command_timeout=30
            )
            try:
                async with pool.acquire() as conn:
                    version = await conn.fetchval("SELECT version()")
            except Exception:
                await pool.close()
                raise
        
        # Generate unique ID
        conn_id = str(uuid.uuid4())[:8]
        conn_name = request.name or f"{request.database}@{request.host}"
        
        # Store in connections dict
        connections[conn_id] = {
            "host": request.host,
            "port": request.port,
            "user": request.user,
            "password": request.password,
            "database": request.database,
            "schema_filter": schema_filter,
            "pool": pool,
            "name": conn_name,
            "connected_at": datetime.utcnow().isoformat(),
            "version": version[:50] if version else "Unknown",
            "database_type": request.database_type,
        }
        
        # Set as active
        active_connection_id = conn_id
        _sync_user_db_connection()
        
        logger.info(f"Connected [{conn_id}] ({request.database_type}): {request.host}:{request.port}/{request.database}")
        
        log_activity(
            ActivityType.DATABASE_CONNECTED,
            f"Connected to {conn_name}",
            f"Database {request.database} on {request.host}:{request.port} ({request.database_type})",
            {"connection_id": conn_id, "database": request.database, "host": request.host}
        )
        
        # Set a cookie
        response.set_cookie(
            key="db_connected", value="true",
            max_age=3600, samesite="lax", secure=False
        )
        
        return ConnectionResponse(
            success=True,
            message="Connected successfully",
            connection_id=conn_id,
            database_info={
                "host": request.host,
                "database": request.database,
                "version": version[:50] if version else "Unknown",
                "database_type": request.database_type,
            }
        )
        
    except HTTPException:
        raise
    except asyncpg.InvalidPasswordError:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    except asyncpg.InvalidCatalogNameError:
        raise HTTPException(status_code=404, detail=f"Database '{request.database}' does not exist")
    except ImportError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        error_msg = str(e)
        # Handle SQL Server specific errors
        if "Login failed" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        if "Cannot open database" in error_msg:
            raise HTTPException(status_code=404, detail=f"Database '{request.database}' does not exist")
        logger.error(f"Connection error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Connection failed: {error_msg}")

@router.get("/connections", response_model=ConnectionsList)
async def list_connections():
    """List all active database connections"""
    global active_connection_id
    conn_list = []
    for cid, data in connections.items():
        conn_list.append(ConnectionInfo(
            id=cid,
            name=data.get("name", data["database"]),
            host=data["host"],
            port=data["port"],
            database=data["database"],
            schema_filter=data.get("schema_filter", "public"),
            is_active=(cid == active_connection_id),
            connected_at=data.get("connected_at", ""),
            database_type=data.get("database_type", "postgresql"),
        ))
    return ConnectionsList(
        connections=conn_list,
        active_id=active_connection_id,
        total=len(conn_list)
    )

@router.post("/connections/{connection_id}/activate")
async def activate_connection(connection_id: str):
    """Set a connection as the active one"""
    global active_connection_id
    if connection_id not in connections:
        raise HTTPException(status_code=404, detail=f"Connection '{connection_id}' not found")
    
    # Verify pool is alive
    conn_data = connections[connection_id]
    try:
        test_q = "SELECT @@VERSION" if conn_data.get("database_type") == "sqlserver" else "SELECT 1"
        async with conn_data["pool"].acquire() as conn:
            await conn.fetchval(test_q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection is not healthy: {str(e)}")
    
    active_connection_id = connection_id
    _sync_user_db_connection()
    logger.info(f"Activated connection: {connection_id}")
    log_activity(
        ActivityType.DATABASE_ACTIVATED,
        f"Activated {connections[connection_id].get('name', connection_id)}",
        f"Switched active database to {connections[connection_id]['database']}",
        {"connection_id": connection_id}
    )
    return {"success": True, "message": f"Connection '{connection_id}' is now active", "active_id": connection_id}

@router.delete("/connections/{connection_id}")
async def remove_connection(connection_id: str):
    """Remove a specific database connection"""
    global active_connection_id
    if connection_id not in connections:
        raise HTTPException(status_code=404, detail=f"Connection '{connection_id}' not found")
    
    try:
        pool = connections[connection_id].get("pool")
        if pool:
            await pool.close()
    except Exception as e:
        logger.warning(f"Error closing pool for {connection_id}: {e}")
    
    del connections[connection_id]
    
    # If we deleted the active one, switch to another or clear
    if active_connection_id == connection_id:
        if connections:
            active_connection_id = next(iter(connections))
        else:
            active_connection_id = None
        _sync_user_db_connection()
    
    logger.info(f"Removed connection: {connection_id}")
    log_activity(
        ActivityType.DATABASE_DISCONNECTED,
        f"Disconnected database",
        f"Removed database connection {connection_id}",
        {"connection_id": connection_id}
    )
    return {"success": True, "message": "Connection removed", "active_id": active_connection_id}

@router.post("/disconnect-db")
async def disconnect_database(response: Response):
    """Disconnect the active database connection"""
    global active_connection_id
    
    try:
        if active_connection_id and active_connection_id in connections:
            pool = connections[active_connection_id].get("pool")
            if pool:
                await pool.close()
            del connections[active_connection_id]
            
            # Switch to another connection or clear
            if connections:
                active_connection_id = next(iter(connections))
            else:
                active_connection_id = None
            _sync_user_db_connection()
        
        response.delete_cookie(key="db_connected")
        logger.info("Active database connection closed")
        
        return {"success": True, "message": "Disconnected successfully"}
    except Exception as e:
        logger.error(f"Disconnection error: {e}")
        raise HTTPException(status_code=500, detail=f"Disconnection failed: {str(e)}")

@router.get("/connection-status")
async def connection_status():
    """Check connection status"""
    global active_connection_id
    if not active_connection_id or active_connection_id not in connections:
        return {"connected": False, "message": "No database connected", "total_connections": len(connections)}
    
    conn_data = connections[active_connection_id]
    try:
        test_q = "SELECT @@VERSION" if conn_data.get("database_type") == "sqlserver" else "SELECT 1"
        async with conn_data["pool"].acquire() as conn:
            await conn.fetchval(test_q)
        return {
            "connected": True,
            "host": conn_data["host"],
            "database": conn_data["database"],
            "port": conn_data["port"],
            "active_connection_id": active_connection_id,
            "total_connections": len(connections)
        }
    except Exception as e:
        logger.error(f"Connection health check failed: {e}")
        return {"connected": False, "message": f"Connection error: {str(e)}", "total_connections": len(connections)}
