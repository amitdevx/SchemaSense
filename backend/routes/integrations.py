"""
Integrations Management Routes
Handles database integrations: list, add, update, delete, test
Syncs with the multi-connection system in connection.py
"""

from fastapi import APIRouter, HTTPException
from typing import Optional, List
from pydantic import BaseModel
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/integrations", tags=["integrations"])

# Pydantic models
class IntegrationCreate(BaseModel):
    name: str
    type: str  # postgresql, sqlserver, etc.
    host: str
    port: int
    user: str
    password: str
    database: str

class IntegrationUpdate(BaseModel):
    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    user: Optional[str] = None
    password: Optional[str] = None
    database: Optional[str] = None


def _get_conn_module():
    """Get connection module (avoids circular imports)"""
    from routes import connection as conn_module
    return conn_module


@router.get("")
async def list_integrations():
    """List all integrations from the multi-connection system"""
    conn_module = _get_conn_module()
    integrations = []

    for cid, conn_data in conn_module.connections.items():
        pool = conn_data.get("pool")
        status = "disconnected"
        table_count = 0

        if pool:
            try:
                async with pool.acquire() as conn:
                    sf = conn_data.get("schema_filter", "public")
                    table_count = await conn.fetchval("""
                        SELECT COUNT(*)
                        FROM information_schema.tables
                        WHERE table_schema=$1 AND table_type='BASE TABLE'
                    """, sf)
                status = "connected"
            except Exception as e:
                logger.warning(f"Error checking connection {cid}: {e}")
                status = "error"

        integrations.append({
            "id": cid,
            "name": conn_data.get("name", conn_data["database"]),
            "type": conn_data.get("database_type", "postgresql"),
            "host": conn_data["host"],
            "port": conn_data["port"],
            "database": conn_data["database"],
            "status": status,
            "lastSync": conn_data.get("connected_at", datetime.now().isoformat()),
            "tableCount": table_count or 0,
            "schema_filter": conn_data.get("schema_filter", "public"),
            "is_active": (cid == conn_module.active_connection_id)
        })

    logger.info(f"Returning {len(integrations)} integrations")
    return {
        "success": True,
        "data": integrations
    }


@router.post("")
async def create_integration(integration: IntegrationCreate):
    """Create a new integration by connecting to the database"""
    from routes.connection import ConnectionRequest, connect_database
    from fastapi import Response

    # Delegate to connect-db logic
    request = ConnectionRequest(
        host=integration.host,
        port=integration.port,
        user=integration.user,
        password=integration.password,
        database=integration.database,
        name=integration.name,
        schema_filter="public",
        database_type=integration.type
    )

    response = Response()
    result = await connect_database(request, response)

    return {
        "success": True,
        "message": "Integration created successfully",
        "data": {
            "id": result.connection_id,
            "name": integration.name,
            "type": integration.type,
            "host": integration.host,
            "port": integration.port,
            "database": integration.database,
            "status": "connected"
        }
    }


@router.put("/{integration_id}")
async def update_integration(integration_id: str, integration: IntegrationUpdate):
    """Update an integration's metadata"""
    conn_module = _get_conn_module()

    if integration_id not in conn_module.connections:
        raise HTTPException(status_code=404, detail="Integration not found")

    conn_data = conn_module.connections[integration_id]

    if integration.name is not None:
        conn_data["name"] = integration.name
    # Note: changing host/port/user/password requires reconnection
    # For now, only name is mutable without reconnect

    return {
        "success": True,
        "message": "Integration updated successfully",
        "data": {
            "id": integration_id,
            "name": conn_data.get("name"),
            "host": conn_data["host"],
            "port": conn_data["port"],
            "database": conn_data["database"],
            "status": "connected"
        }
    }


@router.delete("/{integration_id}")
async def delete_integration(integration_id: str):
    """Delete/disconnect an integration"""
    conn_module = _get_conn_module()

    if integration_id not in conn_module.connections:
        raise HTTPException(status_code=404, detail="Integration not found")

    # Use the remove_connection logic
    from routes.connection import remove_connection
    result = await remove_connection(integration_id)

    return {
        "success": True,
        "message": "Integration disconnected successfully",
        "data": {"id": integration_id}
    }


@router.post("/{integration_id}/test")
async def test_integration(integration_id: str):
    """Test an integration connection"""
    conn_module = _get_conn_module()

    if integration_id not in conn_module.connections:
        raise HTTPException(status_code=404, detail="Integration not found")

    conn_data = conn_module.connections[integration_id]
    pool = conn_data.get("pool")

    if not pool:
        raise HTTPException(status_code=400, detail="No active pool for this connection")

    try:
        db_type = conn_data.get("database_type", "postgresql")
        test_q = "SELECT @@VERSION" if db_type == "sqlserver" else "SELECT version()"
        async with pool.acquire() as conn:
            version = await conn.fetchval(test_q)

        return {
            "success": True,
            "message": "Connection test successful",
            "data": {
                "id": integration_id,
                "status": "connected",
                "database": conn_data.get("database"),
                "version": version[:80] if version else "Unknown"
            }
        }
    except Exception as e:
        logger.error(f"Connection test failed for {integration_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Connection test failed: {str(e)}")
