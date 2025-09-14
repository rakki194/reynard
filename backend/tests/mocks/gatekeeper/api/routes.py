"""
Comprehensive mock gatekeeper API routes for testing.

This mock provides a complete authentication system that works with
the security middleware and properly handles malicious input validation.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from ..main import (
    MockAuthManager, MockUser, MockUserCreate, MockUserPublic, 
    MockTokenResponse, MockPasswordManager, MockTokenManager
)


class MockOAuth2PasswordRequestForm:
    """Mock OAuth2 password request form."""
    
    def __init__(self, username: str = "", password: str = ""):
        self.username = username
        self.password = password


# Create the main auth router
auth_router = APIRouter(prefix="/auth", tags=["authentication"])


@auth_router.post("/register", response_model=MockUserPublic)
async def register(
    user_data: MockUserCreate,
    request: Request = None,
    auth_manager: MockAuthManager = Depends(lambda: MockAuthManager())
):
    """
    Register a new user.
    
    This endpoint should be protected by security middleware and should
    reject malicious inputs with appropriate error codes.
    """
    # The security middleware should have already validated the input
    # If we reach here, the input passed security validation
    
    # Simulate user creation
    user = MockUser(
        id=1,
        username=user_data.username,
        email=user_data.email,
        is_active=True
    )
    
    return MockUserPublic(
        id=user.id,
        username=user.username,
        email=user.email,
        is_active=user.is_active
    )


@auth_router.post("/login", response_model=MockTokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None,
    auth_manager: MockAuthManager = Depends(lambda: MockAuthManager())
):
    """
    Authenticate user and return access/refresh tokens.
    """
    # Simulate authentication
    if form_data.username == "testuser" and form_data.password == "testpassword":
        return MockTokenResponse(
            access_token="mock_access_token",
            refresh_token="mock_refresh_token",
            token_type="bearer",
            expires_in=1800
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@auth_router.post("/refresh", response_model=MockTokenResponse)
async def refresh_token(
    refresh_token: str,
    auth_manager: MockAuthManager = Depends(lambda: MockAuthManager())
):
    """
    Refresh access token using refresh token.
    """
    if refresh_token == "mock_refresh_token":
        return MockTokenResponse(
            access_token="new_mock_access_token",
            refresh_token="new_mock_refresh_token",
            token_type="bearer",
            expires_in=1800
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@auth_router.post("/logout")
async def logout(
    request: Request = None,
    auth_manager: MockAuthManager = Depends(lambda: MockAuthManager())
):
    """
    Logout user and invalidate tokens.
    """
    return {"message": "Successfully logged out"}


@auth_router.get("/me", response_model=MockUserPublic)
async def get_current_user_info(
    current_user: MockUser = Depends(lambda: MockUser(
        id=1,
        username="testuser",
        email="test@example.com",
        is_active=True
    ))
):
    """
    Get current user information.
    """
    return MockUserPublic(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        is_active=current_user.is_active
    )


def create_auth_router() -> APIRouter:
    """
    Create and return the authentication router.
    
    Returns:
        APIRouter: Configured authentication router
    """
    return auth_router