"""Authentication Dependencies for Reynard Backend

FastAPI dependencies for authentication and authorization.
Provides user and admin authentication with proper permission checks.

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import logging
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.gatekeeper_config import get_auth_manager

from .user_service import get_current_user

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()


async def get_current_active_user(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """Get the current active user.

    Args:
        current_user: Current user from token

    Returns:
        User data if active

    Raises:
        HTTPException: If user is not active
    """
    if not current_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )
    return current_user


async def get_current_admin_user(
    current_user: dict[str, Any] = Depends(get_current_active_user),
) -> dict[str, Any]:
    """Get the current user if they have admin privileges.

    Args:
        current_user: Current active user

    Returns:
        User data if admin

    Raises:
        HTTPException: If user is not an admin
    """
    # Check if user has admin role using Gatekeeper role system
    user_role = current_user.get("role", "regular")

    if user_role.lower() not in ["admin", "administrator"]:
        # Also check if username contains 'admin' for backward compatibility
        admin_users = {"admin", "administrator", "root", "reynard_admin"}
        if current_user["username"].lower() not in admin_users:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required",
            )

    return current_user


def require_permission(permission: str):
    """Create a dependency that requires a specific permission.

    Args:
        permission: Required permission string

    Returns:
        Dependency function
    """

    async def permission_dependency(
        current_user: dict[str, Any] = Depends(get_current_active_user),
    ) -> dict[str, Any]:
        """Check if user has the required permission."""
        # Get user permissions from Gatekeeper
        user_permissions = current_user.get("permissions", [])

        # Check if user has the required permission
        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required",
            )

        return current_user

    return permission_dependency


def require_admin_or_self(target_user_id: str):
    """Create a dependency that requires admin privileges or the user to be accessing their own data.

    Args:
        target_user_id: The user ID being accessed

    Returns:
        Dependency function
    """

    async def admin_or_self_dependency(
        current_user: dict[str, Any] = Depends(get_current_active_user),
    ) -> dict[str, Any]:
        """Check if user is admin or accessing their own data."""
        # Check if user is admin
        try:
            admin_user = await get_current_admin_user(current_user)
            return admin_user
        except HTTPException:
            # Not an admin, check if accessing own data
            if current_user["username"] != target_user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin privileges or own data access required",
                )
            return current_user

    return admin_or_self_dependency
