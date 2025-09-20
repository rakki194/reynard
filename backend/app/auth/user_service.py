"""
User service for Reynard Backend.

This module provides user management functionality using the Gatekeeper library.
"""

from datetime import datetime

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .jwt_utils import create_access_token, create_refresh_token, verify_token_sync
from .password_utils import verify_password
from .user_models import (
    AuthResponse,
    RefreshResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)

# In-memory storage for testing (simplified version)
users_db: dict[str, dict] = {}
refresh_tokens_db: dict[str, str] = {}


def create_user(user_data: UserCreate) -> UserResponse:
    """
    Create a new user.

    Args:
        user_data: User creation data

    Returns:
        UserResponse: Created user data

    Raises:
        HTTPException: If user already exists or validation fails
    """
    # Check if username already exists
    if user_data.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email already exists
    for user in users_db.values():
        if user.get("email") == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    # Hash password
    from .password_utils import get_password_hash

    hashed_password = get_password_hash(user_data.password)

    # Create user
    user_dict = {
        "username": user_data.username,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.now().isoformat(),
    }

    users_db[user_data.username] = user_dict

    return UserResponse(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        is_active=True,
        created_at=user_dict["created_at"],
    )


def authenticate_user(login_data: UserLogin) -> AuthResponse:
    """
    Authenticate a user.

    Args:
        login_data: User login data

    Returns:
        Dict[str, str]: Token response

    Raises:
        HTTPException: If authentication fails
    """
    # Get user from database
    user = users_db.get(login_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    # Verify password
    if not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # Create tokens
    token_data = {"sub": user["username"], "username": user["username"]}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Store refresh token
    refresh_tokens_db[user["username"]] = refresh_token

    return AuthResponse(
        access_token=access_token, refresh_token=refresh_token, token_type="bearer"
    )


def refresh_user_token(refresh_token: str) -> RefreshResponse:
    """
    Refresh user tokens.

    Args:
        refresh_token: The refresh token

    Returns:
        Dict[str, str]: New token response

    Raises:
        HTTPException: If refresh fails
    """
    # Verify refresh token
    payload = verify_token(refresh_token, "refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    username = payload.get("sub")
    if not username or username not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )

    # Check if stored refresh token matches
    if refresh_tokens_db.get(username) != refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    # Create new tokens
    token_data = {"sub": username, "username": username}
    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)

    # Update stored refresh token
    refresh_tokens_db[username] = new_refresh_token

    return RefreshResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
    )


def logout_user(refresh_token: str) -> dict[str, str]:
    """
    Logout a user.

    Args:
        refresh_token: The refresh token to revoke

    Returns:
        Dict[str, str]: Logout response

    Raises:
        HTTPException: If logout fails
    """
    # Verify refresh token
    payload = verify_token(refresh_token, "refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    username = payload.get("sub")
    if not username or username not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )

    # Remove refresh token
    refresh_tokens_db.pop(username, None)

    return {"message": "Successfully logged out"}


security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict[str, str]:
    """
    Get current user from token.

    Args:
        credentials: HTTP authorization credentials

    Returns:
        Dict[str, str]: User data

    Raises:
        HTTPException: If token is invalid
    """
    token = credentials.credentials
    payload = verify_token_sync(token, "access")

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    username = payload.get("sub")
    if not username or username not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )

    user = users_db[username]
    return {
        "username": user["username"],
        "email": user["email"],
        "full_name": user["full_name"],
        "is_active": user["is_active"],
    }


def get_current_active_user(current_user: dict[str, str] = Depends(get_current_user)) -> dict[str, str]:
    """
    Get current active user.

    Args:
        current_user: Current user data

    Returns:
        Dict[str, str]: Active user data

    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    return current_user
