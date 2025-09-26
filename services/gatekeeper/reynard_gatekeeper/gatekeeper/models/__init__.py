"""Models package for the Gatekeeper authentication library.

This package contains all the data models used throughout the authentication system.
"""

from .rbac import (
    Operation,
    Permission,
    PermissionCreate,
    PermissionResult,
    PermissionScope,
    ResourceAccessControl,
    ResourcePermissionGrant,
    ResourceType,
    Role,
    RoleCreate,
    UserRoleAssignment,
    UserRoleLink,
)
from .token import (
    TokenConfig,
    TokenData,
    TokenRefreshRequest,
    TokenRefreshResponse,
    TokenResponse,
    TokenValidationResult,
)
from .user import (
    User,
    UserCreate,
    UserLogin,
    UserPasswordChange,
    UserPublic,
    UserRole,
    UserUpdate,
)

__all__ = [
    # User models
    "User",
    "UserRole",
    "UserCreate",
    "UserPublic",
    "UserUpdate",
    "UserLogin",
    "UserPasswordChange",
    # Token models
    "TokenData",
    "TokenResponse",
    "TokenRefreshRequest",
    "TokenRefreshResponse",
    "TokenValidationResult",
    "TokenConfig",
    # RBAC models
    "Role",
    "Permission",
    "UserRoleLink",
    "ResourceAccessControl",
    "PermissionResult",
    "RoleCreate",
    "PermissionCreate",
    "UserRoleAssignment",
    "ResourcePermissionGrant",
    "PermissionScope",
    "ResourceType",
    "Operation",
]
