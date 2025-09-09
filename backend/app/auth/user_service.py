"""
User Service

This module provides user management functionality including
authentication, user creation, and user data management.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.auth.user_models import UserCreate, UserLogin, UserResponse, Token, TokenData
from app.auth.password_utils import get_password_hash, verify_password
from app.auth.jwt_utils import create_access_token, create_refresh_token, verify_token
from app.config.jwt_config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS

# Security scheme
security = HTTPBearer()

# In-memory user storage (replace with database in production)
users_db: Dict[str, Dict[str, Any]] = {}
refresh_tokens_db: Dict[str, str] = {}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict[str, Any]:
    """Get the current authenticated user"""
    token = credentials.credentials
    token_data = verify_token(token, "access")

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username = token_data.get("sub") or token_data.get("username")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = users_db.get(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get the current active user"""
    if not current_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user


def create_user(user: UserCreate) -> UserResponse:
    """Create a new user"""
    if user.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email is already registered
    for existing_user in users_db.values():
        if existing_user["email"] == user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    # Create user
    user_id = len(users_db) + 1
    hashed_password = get_password_hash(user.password)

    users_db[user.username] = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "full_name": getattr(user, 'full_name', None),
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
    }

    return UserResponse(
        id=user_id,
        username=user.username,
        email=user.email,
        full_name=getattr(user, 'full_name', None),
        is_active=True,
        created_at=users_db[user.username]["created_at"],
    )


def authenticate_user(user_credentials: UserLogin) -> Token:
    """Authenticate user and return tokens"""
    user = users_db.get(user_credentials.username)

    if not user or not verify_password(
        user_credentials.password, user["hashed_password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user["username"]}, expires_delta=refresh_token_expires
    )

    # Store refresh token
    refresh_tokens_db[user["username"]] = refresh_token

    return Token(
        access_token=access_token, refresh_token=refresh_token, token_type="bearer"
    )


def refresh_user_token(refresh_token: str) -> Token:
    """Refresh access token using refresh token"""
    token_data = verify_token(refresh_token, "refresh")

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username = token_data.get("sub") or token_data.get("username")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = users_db.get(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if refresh token matches stored one
    stored_refresh_token = refresh_tokens_db.get(username)
    if stored_refresh_token != refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create new tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(
        data={"sub": user["username"]}, expires_delta=refresh_token_expires
    )

    # Update stored refresh token
    refresh_tokens_db[username] = new_refresh_token

    return Token(
        access_token=access_token, refresh_token=new_refresh_token, token_type="bearer"
    )


def logout_user(refresh_token: str) -> Dict[str, str]:
    """Logout user and invalidate refresh token"""
    # Verify the refresh token and get username
    token_data = verify_token(refresh_token, "refresh")
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username = token_data.get("sub") or token_data.get("username")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user has an active refresh token
    if username not in refresh_tokens_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Remove refresh token
    del refresh_tokens_db[username]

    return {"message": "Successfully logged out"}