from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from typing import List, Optional
from routes import connection as conn_module
from routes.connection import get_user_db, get_db_pool, get_schema_filter_for
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["dashboard"])

# ===== Models =====

class DatabaseInfo(BaseModel):
    id: str
    name: str
    type: str
    host: str
    port: int
    status: str
    tables: int
    lastSync: str
    lastAnalyzed: str
    schema_filter: str = "public"
    is_active: bool = False


class DashboardStats(BaseModel):
    totalDatabases: int
    totalTables: int
    analysesRun: int


class DatabaseList(BaseModel):
    databases: List[DatabaseInfo]
    total: int


# ===== Endpoints =====

@router.get("/databases", response_model=DatabaseList)
async def get_databases():
    """Get list of connected databases"""
    try:
        if not conn_module.connections:
            return DatabaseList(databases=[], total=0)

        db_list = []
        for cid, conn_data in conn_module.connections.items():
            table_count = 0
            status = "disconnected"
            try:
                pool = conn_data.get("pool")
                if pool:
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

            db_list.append(DatabaseInfo(
                id=cid,
                name=conn_data.get("name", conn_data["database"]),
                type=conn_data.get("database_type", "postgresql").upper(),
                host=conn_data["host"],
                port=conn_data["port"],
                status=status,
                tables=table_count or 0,
                lastSync="just now",
                lastAnalyzed="just now",
                schema_filter=conn_data.get("schema_filter", "public"),
                is_active=(cid == conn_module.active_connection_id)
            ))

        return DatabaseList(databases=db_list, total=len(db_list))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching databases: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/statistics")
async def get_statistics():
    """Get dashboard statistics"""
    try:
        if not conn_module.connections:
            return {
                "connectedDatabases": 0,
                "totalTables": 0,
                "analysesRun": 0
            }

        total_tables = 0
        for cid, conn_data in conn_module.connections.items():
            try:
                pool = conn_data.get("pool")
                if pool:
                    async with pool.acquire() as conn:
                        sf = conn_data.get("schema_filter", "public")
                        count = await conn.fetchval("""
                            SELECT COUNT(*) 
                            FROM information_schema.tables 
                            WHERE table_schema=$1 AND table_type='BASE TABLE'
                        """, sf)
                        total_tables += (count or 0)
            except Exception as e:
                logger.warning(f"Error counting tables for {cid}: {e}")

        return {
            "connectedDatabases": len(conn_module.connections),
            "totalTables": total_tables,
            "analysesRun": len(conn_module.connections)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/sync-status")
async def get_sync_status():
    """Get sync status for databases"""
    try:
        if not conn_module.connections:
            return {"status": "disconnected", "lastSync": None}

        return {
            "status": "healthy",
            "lastSync": "just now",
            "syncFrequency": "never",
            "total_connections": len(conn_module.connections)
        }
    except Exception as e:
        logger.error(f"Error fetching sync status: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/logout")
async def logout():
    """Logout user (clear server-side state if needed)"""
    try:
        # For MVP, just return success - client clears token
        return {"message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Error logging out: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
