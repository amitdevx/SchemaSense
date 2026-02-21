"""Cache management API endpoints (uses SQLite — no interference with app or user DBs)."""
import logging
from fastapi import APIRouter, HTTPException
from utils.cache_db import get_cache_stats, clear_cache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/cache", tags=["cache"])


@router.get("/stats")
async def cache_stats():
    """Return cache hit/miss statistics."""
    try:
        return await get_cache_stats()
    except Exception as e:
        logger.error(f"Error getting cache stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/clear")
async def cache_clear():
    """Clear all cached AI explanations."""
    try:
        await clear_cache()
        return {"message": "Cache cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail=str(e))
