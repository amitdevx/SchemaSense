from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional
from datetime import datetime
from schemas import (
    UserRegisterRequest, UserLoginRequest, AuthTokenResponse, UserResponse
)
from utils.database import db
from utils.auth import auth_manager
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ===== Helper Functions =====

async def get_current_user(authorization: Optional[str] = Header(None)) -> UserResponse:
    """Dependency to get current user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    user_id = auth_manager.extract_user_id(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Fetch user from database
    query = "SELECT id, name, email, created_at FROM users WHERE id=$1"
    user = await db.fetchrow(query, user_id)
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return UserResponse(
        id=user['id'],
        name=user['name'],
        email=user['email'],
        created_at=user['created_at']
    )

# ===== Auth Endpoints =====

@router.post("/register", response_model=AuthTokenResponse)
async def register(request: UserRegisterRequest):
    """Register a new user"""
    try:
        # Check if user already exists
        existing = await db.fetchrow(
            "SELECT id FROM users WHERE email=$1",
            request.email.lower()
        )
        
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")
        
        # Hash password
        hashed_password = auth_manager.hash_password(request.password)
        
        # Create user
        query = """
            INSERT INTO users (name, email, password, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING id, name, email, created_at
        """
        user = await db.fetchrow(query, request.name, request.email.lower(), hashed_password)
        
        # Create JWT token
        token = auth_manager.create_token({
            "user_id": user['id'],
            "email": user['email']
        })
        
        user_response = UserResponse(
            id=user['id'],
            name=user['name'],
            email=user['email'],
            created_at=user['created_at']
        )
        
        return AuthTokenResponse(
            access_token=token,
            user=user_response
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/login", response_model=AuthTokenResponse)
async def login(request: UserLoginRequest):
    """Login user"""
    try:
        # Find user by email
        query = "SELECT id, name, email, password, created_at FROM users WHERE email=$1"
        user = await db.fetchrow(query, request.email.lower())
        
        if not user or not auth_manager.verify_password(request.password, user['password']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create JWT token
        token = auth_manager.create_token({
            "user_id": user['id'],
            "email": user['email']
        })
        
        user_response = UserResponse(
            id=user['id'],
            name=user['name'],
            email=user['email'],
            created_at=user['created_at']
        )
        
        return AuthTokenResponse(
            access_token=token,
            user=user_response
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: UserResponse = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "SchemaSense Backend"}
