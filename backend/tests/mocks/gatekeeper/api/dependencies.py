"""
Mock gatekeeper API dependencies.
"""

from fastapi import Depends

from ..main import (
    MockAuthManager,
    MockUser,
    get_auth_manager,
    get_current_user,
    require_role,
)


def require_active_user():
    """Require an active user (for dependency injection)."""

    def active_user_checker(
        current_user: MockUser = Depends(get_current_user),
    ) -> MockUser:
        if not current_user.is_active:
            from fastapi import HTTPException

            raise HTTPException(status_code=403, detail="User account is inactive")
        return current_user

    return active_user_checker


def set_auth_manager(auth_manager: MockAuthManager) -> None:
    """Set the mock auth manager."""
    # For testing, we don't need to actually set anything
    # The mock auth manager is already configured
    pass


__all__ = [
    "MockAuthManager",
    "MockUser",
    "get_auth_manager",
    "get_current_user",
    "require_active_user",
    "require_role",
    "set_auth_manager",
]
