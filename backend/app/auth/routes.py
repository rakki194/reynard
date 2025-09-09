"""
Authentication Routes

This module provides FastAPI routes for user authentication including
registration, login, logout, and token refresh.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from app.auth.user_models import UserCreate, UserLogin, UserResponse, Token, RefreshTokenRequest
from app.auth.user_service import (
    create_user, 
    authenticate_user, 
    refresh_user_token, 
    logout_user,
    get_current_active_user
)

# Create router
router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse)
async def register(request: Request, user: UserCreate, limiter: Limiter = Depends()):
    """Register a new user"""
    try:
        return create_user(user)
    except HTTPException:
        raise
    except Exception as e:
        # Log the actual error for debugging but don't expose it
        print(f"Registration error: {e}")  # In production, use proper logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=Token)
async def login(request: Request, user_credentials: UserLogin, limiter: Limiter = Depends()):
    """Login and get access token"""
    return authenticate_user(user_credentials)


@router.post("/refresh", response_model=Token)
async def refresh_token(request: Request, refresh_request: RefreshTokenRequest, limiter: Limiter = Depends()):
    """Refresh access token using refresh token"""
    return refresh_user_token(refresh_request.refresh_token)


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_active_user)):
    """Logout and invalidate refresh token"""
    return logout_user(current_user["username"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user["email"],
        is_active=current_user["is_active"],
        created_at=current_user["created_at"],
    )