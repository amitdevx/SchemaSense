"""
Settings Management Routes
Handles user settings operations: get, update
"""

from fastapi import APIRouter
from typing import Optional

router = APIRouter(prefix="/api/settings", tags=["settings"])

# In-memory storage for MVP (single user)
settings_store = {
    "emailNotifications": True,
    "slackNotifications": False,
    "theme": "dark",
    "language": "en",
    "privacyLevel": "private",
    "autoSync": True,
    "syncInterval": 3600,
}


@router.get("")
async def get_settings():
    """Get current user settings"""
    return {
        "success": True,
        "data": settings_store
    }


@router.put("")
async def update_settings(
    emailNotifications: Optional[bool] = None,
    slackNotifications: Optional[bool] = None,
    theme: Optional[str] = None,
    language: Optional[str] = None,
    privacyLevel: Optional[str] = None,
    autoSync: Optional[bool] = None,
    syncInterval: Optional[int] = None,
):
    """Update user settings"""
    if emailNotifications is not None:
        settings_store["emailNotifications"] = emailNotifications
    if slackNotifications is not None:
        settings_store["slackNotifications"] = slackNotifications
    if theme is not None:
        settings_store["theme"] = theme
    if language is not None:
        settings_store["language"] = language
    if privacyLevel is not None:
        settings_store["privacyLevel"] = privacyLevel
    if autoSync is not None:
        settings_store["autoSync"] = autoSync
    if syncInterval is not None:
        settings_store["syncInterval"] = syncInterval
    
    return {
        "success": True,
        "message": "Settings updated successfully",
        "data": settings_store
    }
