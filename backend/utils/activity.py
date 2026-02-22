"""
Activity tracking module for SchemaSense.
Tracks database connections, analyses, chats, and other user activities in-memory.
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional
from pydantic import BaseModel
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class ActivityType(str, Enum):
    DATABASE_CONNECTED = "database_connected"
    DATABASE_DISCONNECTED = "database_disconnected"
    DATABASE_ACTIVATED = "database_activated"
    ANALYSIS_RUN = "analysis_run"
    CHAT_QUERY = "chat_query"
    SCHEMA_VIEWED = "schema_viewed"
    EXPORT_GENERATED = "export_generated"
    TABLE_EXPLAINED = "table_explained"


class Activity(BaseModel):
    id: int
    type: ActivityType
    title: str
    description: str
    timestamp: str
    metadata: dict = {}


# In-memory activity store
_activities: List[dict] = []
_activity_counter: int = 0
_analyses_count: int = 0


def log_activity(
    activity_type: ActivityType,
    title: str,
    description: str,
    metadata: dict = {}
):
    """Log a new activity event"""
    global _activity_counter, _analyses_count
    _activity_counter += 1

    if activity_type in (
        ActivityType.ANALYSIS_RUN,
        ActivityType.TABLE_EXPLAINED,
        ActivityType.CHAT_QUERY,
    ):
        _analyses_count += 1

    activity = {
        "id": _activity_counter,
        "type": activity_type.value,
        "title": title,
        "description": description,
        "timestamp": datetime.now(timezone(timedelta(hours=5, minutes=30))).isoformat(),
        "metadata": metadata,
    }
    _activities.append(activity)

    # Keep only last 100 activities
    if len(_activities) > 100:
        _activities.pop(0)

    logger.info(f"Activity logged: [{activity_type.value}] {title}")


def get_recent_activities(limit: int = 20) -> List[dict]:
    """Get recent activities, newest first"""
    return list(reversed(_activities[-limit:]))


def get_analyses_count() -> int:
    """Get total number of analyses run"""
    return _analyses_count
