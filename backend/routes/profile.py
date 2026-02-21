"""
Profile Management Routes
Handles user profile operations: get, update
"""

from fastapi import APIRouter, HTTPException
from typing import Optional

router = APIRouter(prefix="/api/profile", tags=["profile"])

# In-memory storage for MVP (single user)
profile_store = {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "organization": "Acme Corp",
    "avatar": "JD"
}


@router.get("")
async def get_profile():
    """Get current user profile"""
    return {
        "success": True,
        "data": profile_store
    }


@router.put("")
async def update_profile(
    firstName: Optional[str] = None,
    lastName: Optional[str] = None,
    email: Optional[str] = None,
    organization: Optional[str] = None,
):
    """Update user profile"""
    if firstName:
        profile_store["firstName"] = firstName
    if lastName:
        profile_store["lastName"] = lastName
    if email:
        profile_store["email"] = email
    if organization:
        profile_store["organization"] = organization
    
    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": profile_store
    }
