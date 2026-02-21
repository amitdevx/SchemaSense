from fastapi import APIRouter
from typing import Optional
from utils.activity import get_recent_activities
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["activity"])


@router.get("/activity/recent")
async def recent_activity(limit: Optional[int] = 20):
    """Get recent activity feed"""
    activities = get_recent_activities(limit=limit or 20)
    return {"activities": activities, "total": len(activities)}
