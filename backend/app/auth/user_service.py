"""User service for Reynard Backend.

This module provides user management functionality using the Gatekeeper library.
"""

from datetime import datetime
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.gatekeeper_config import get_auth_manager
from app.services.auth.agent_user_mapping import agent_user_mapping_service
from gatekeeper.models.token import TokenResponse
from gatekeeper.models.user import User
from gatekeeper.models.user import UserCreate as GatekeeperUserCreate
from gatekeeper.models.user import UserRole

from .user_models import (
    AuthResponse,
    RefreshResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)


async def create_user(user_data: UserCreate) -> UserResponse:
    """Create a new user using Gatekeeper.

    Args:
        user_data: User creation data

    Returns:
        UserResponse: Created user data

    Raises:
        HTTPException: If user already exists or validation fails

    """
    try:
        auth_manager = await get_auth_manager()

        # Convert to Gatekeeper UserCreate
        gatekeeper_user = GatekeeperUserCreate(
            username=user_data.username,
            password=user_data.password,
            email=user_data.email,
            role=UserRole.REGULAR,  # Default role
        )

        # Create user in Gatekeeper
        created_user = await auth_manager.create_user(gatekeeper_user)

        return UserResponse(
            username=created_user.username,
            email=created_user.email,
            full_name=user_data.full_name,  # Gatekeeper doesn't have full_name, keep from input
            is_active=created_user.is_active,
            created_at=(
                created_user.created_at.isoformat()
                if created_user.created_at
                else datetime.now().isoformat()
            ),
        )

    except Exception as e:
        if "already exists" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}",
        )


async def authenticate_user(login_data: UserLogin) -> AuthResponse:
    """Authenticate a user using Gatekeeper.

    Args:
        login_data: User login data

    Returns:
        AuthResponse: Token response

    Raises:
        HTTPException: If authentication fails

    """
    try:
        auth_manager = await get_auth_manager()

        # Authenticate with Gatekeeper
        token_response = await auth_manager.authenticate(
            username=login_data.username,
            password=login_data.password,
        )

        if not token_response:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
            )

        return AuthResponse(
            access_token=token_response.access_token,
            refresh_token=token_response.refresh_token,
            token_type="bearer",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}",
        )


async def refresh_user_token(refresh_token: str) -> RefreshResponse:
    """Refresh user tokens using Gatekeeper.

    Args:
        refresh_token: The refresh token

    Returns:
        RefreshResponse: New token response

    Raises:
        HTTPException: If refresh fails

    """
    try:
        auth_manager = await get_auth_manager()

        # Refresh tokens with Gatekeeper
        token_response = await auth_manager.refresh_tokens(refresh_token)

        if not token_response:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        return RefreshResponse(
            access_token=token_response.access_token,
            refresh_token=token_response.refresh_token,
            token_type="bearer",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}",
        )


async def logout_user(refresh_token: str) -> dict[str, str]:
    """Logout a user using Gatekeeper.

    Args:
        refresh_token: The refresh token to revoke

    Returns:
        dict[str, str]: Logout response

    Raises:
        HTTPException: If logout fails

    """
    try:
        auth_manager = await get_auth_manager()

        # Logout with Gatekeeper
        success = await auth_manager.logout(refresh_token)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        return {"message": "Successfully logged out"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}",
        )


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict[str, Any]:
    """Get current user from token using Gatekeeper.

    Args:
        credentials: HTTP authorization credentials

    Returns:
        dict[str, Any]: User data

    Raises:
        HTTPException: If token is invalid

    """
    try:
        auth_manager = await get_auth_manager()
        token = credentials.credentials

        # Get user from Gatekeeper
        user = await auth_manager.get_current_user(token)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

        return {
            "username": user.username,
            "email": user.email,
            "role": user.role.value,
            "is_active": user.is_active,
            "user_id": user.id,
            "permissions": user.permissions or [],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


async def get_current_active_user(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """Get current active user.

    Args:
        current_user: Current user data

    Returns:
        dict[str, Any]: Active user data

    Raises:
        HTTPException: If user is inactive

    """
    if not current_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    return current_user


async def get_current_agent(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """Get the current user as an Agent model representation.

    This function provides a bridge between the Gatekeeper User model
    and the backend Agent model for backward compatibility.

    Args:
        current_user: Current user data from Gatekeeper

    Returns:
        dict[str, Any]: Agent representation of the user
    """
    try:
        # Create an Agent-like representation from the User data
        agent_data = {
            "id": current_user.get("user_id"),
            "agent_id": current_user.get("username"),
            "name": current_user.get("username"),
            "email": current_user.get("email"),
            "spirit": "user",  # Default spirit
            "active": current_user.get("is_active", True),
            "role": current_user.get("role", "regular"),
            "permissions": current_user.get("permissions", []),
        }

        return agent_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent data: {str(e)}",
        )


# Compatibility exports for backward compatibility
# These are now empty since we use Gatekeeper instead of in-memory storage
users_db: dict[str, dict] = {}
refresh_tokens_db: dict[str, str] = {}
