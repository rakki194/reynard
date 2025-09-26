"""RBAC (Role-Based Access Control) models for Gatekeeper.

This module provides the core RBAC models including Role, Permission, UserRole,
and ResourceAccessControl models for implementing fine-grained access control.
"""

import logging
from datetime import UTC, datetime
from enum import Enum
from typing import Any, Optional
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger(__name__)


class PermissionScope(str, Enum):
    """Permission scope enumeration."""

    OWN = "own"
    TEAM = "team"
    ORGANIZATION = "organization"
    GLOBAL = "global"


class ResourceType(str, Enum):
    """Resource type enumeration."""

    NOTE = "note"
    TODO = "todo"
    EMAIL = "email"
    RAG_DOCUMENT = "rag_document"
    ECS_WORLD = "ecs_world"
    MCP_TOOL = "mcp_tool"
    USER = "user"
    SYSTEM = "system"


class Operation(str, Enum):
    """Operation enumeration."""

    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    SHARE = "share"
    EXECUTE = "execute"
    MANAGE = "manage"


class Role(BaseModel):
    """Role model for RBAC system.

    Represents a role that can be assigned to users with specific permissions.
    """

    id: Optional[str] = Field(default=None)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    level: int = Field(default=0, ge=0, le=100)  # Role hierarchy level
    parent_role_id: Optional[str] = Field(default=None)
    is_system_role: bool = Field(default=False)
    is_active: bool = Field(default=True)
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        """Validate role name format."""
        if not value.replace("_", "").replace("-", "").isalnum():
            raise ValueError(
                "Role name must contain only alphanumeric characters, underscores, and hyphens"
            )
        return value.lower()


class Permission(BaseModel):
    """Permission model for RBAC system.

    Represents a specific permission that can be granted to roles.
    """

    id: Optional[str] = Field(default=None)
    name: str = Field(..., min_length=1, max_length=100)
    resource_type: ResourceType = Field(...)
    operation: Operation = Field(...)
    scope: PermissionScope = Field(default=PermissionScope.OWN)
    conditions: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = Field(default=True)
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        """Validate permission name format."""
        if not value.replace("_", "").replace("-", "").replace(":", "").isalnum():
            raise ValueError(
                "Permission name must contain only alphanumeric characters, underscores, hyphens, and colons"
            )
        return value.lower()


class RolePermission(BaseModel):
    """Role-Permission relationship model.

    Represents the many-to-many relationship between roles and permissions.
    """

    role_id: str = Field(...)
    permission_id: str = Field(...)
    granted_at: Optional[datetime] = Field(default=None)
    granted_by: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    conditions: dict[str, Any] = Field(default_factory=dict)
    expires_at: Optional[datetime] = Field(default=None)


class UserRoleLink(BaseModel):
    """User-Role assignment model.

    Represents the assignment of a role to a user with optional context.
    """

    id: Optional[str] = Field(default=None)
    user_id: str = Field(...)
    role_id: str = Field(...)
    context_type: Optional[str] = Field(
        default=None
    )  # e.g., "project", "team", "organization"
    context_id: Optional[str] = Field(default=None)  # ID of the context entity
    assigned_at: Optional[datetime] = Field(default=None)
    assigned_by: Optional[str] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)
    is_active: bool = Field(default=True)
    conditions: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ResourceAccessControl(BaseModel):
    """Resource-specific access control model.

    Represents direct access control for specific resources.
    """

    id: Optional[str] = Field(default=None)
    resource_type: ResourceType = Field(...)
    resource_id: str = Field(...)
    subject_type: str = Field(default="user")  # "user", "role", "group"
    subject_id: str = Field(...)
    permission_level: str = Field(...)  # "owner", "editor", "viewer", "none"
    granted_at: Optional[datetime] = Field(default=None)
    granted_by: Optional[str] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)
    is_active: bool = Field(default=True)
    conditions: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)


class PermissionResult(BaseModel):
    """Result of a permission check."""

    granted: bool = Field(...)
    reason: Optional[str] = Field(default=None)
    conditions_met: bool = Field(default=True)
    expires_at: Optional[datetime] = Field(default=None)
    metadata: dict[str, Any] = Field(default_factory=dict)


class RoleCreate(BaseModel):
    """Model for creating a new role."""

    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    level: int = Field(default=0, ge=0, le=100)
    parent_role_id: Optional[str] = Field(default=None)
    is_system_role: bool = Field(default=False)
    metadata: dict[str, Any] = Field(default_factory=dict)


class RoleUpdate(BaseModel):
    """Model for updating an existing role."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    level: Optional[int] = Field(default=None, ge=0, le=100)
    parent_role_id: Optional[str] = Field(default=None)
    is_active: Optional[bool] = Field(default=None)
    metadata: Optional[dict[str, Any]] = Field(default=None)


class PermissionCreate(BaseModel):
    """Model for creating a new permission."""

    name: str = Field(..., min_length=1, max_length=100)
    resource_type: ResourceType = Field(...)
    operation: Operation = Field(...)
    scope: PermissionScope = Field(default=PermissionScope.OWN)
    conditions: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)


class PermissionUpdate(BaseModel):
    """Model for updating an existing permission."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    resource_type: Optional[ResourceType] = Field(default=None)
    operation: Optional[Operation] = Field(default=None)
    scope: Optional[PermissionScope] = Field(default=None)
    conditions: Optional[dict[str, Any]] = Field(default=None)
    is_active: Optional[bool] = Field(default=None)
    metadata: Optional[dict[str, Any]] = Field(default=None)


class UserRoleAssignment(BaseModel):
    """Model for assigning a role to a user."""

    user_id: str = Field(...)
    role_id: str = Field(...)
    context_type: Optional[str] = Field(default=None)
    context_id: Optional[str] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)
    conditions: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ResourcePermissionGrant(BaseModel):
    """Model for granting direct resource permissions."""

    resource_type: ResourceType = Field(...)
    resource_id: str = Field(...)
    subject_type: str = Field(default="user")
    subject_id: str = Field(...)
    permission_level: str = Field(...)
    expires_at: Optional[datetime] = Field(default=None)
    conditions: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)


# Advanced RBAC Features - Conditional Permissions


class TimeCondition(BaseModel):
    """Time-based permission condition."""

    start_time: Optional[datetime] = Field(default=None)
    end_time: Optional[datetime] = Field(default=None)
    days_of_week: Optional[list[int]] = Field(default=None)  # 0=Monday, 6=Sunday
    hours_of_day: Optional[list[int]] = Field(default=None)  # 0-23
    timezone: str = Field(default="UTC")


class IPCondition(BaseModel):
    """IP-based permission condition."""

    allowed_ips: Optional[list[str]] = Field(default=None)
    blocked_ips: Optional[list[str]] = Field(default=None)
    allowed_cidrs: Optional[list[str]] = Field(default=None)
    blocked_cidrs: Optional[list[str]] = Field(default=None)


class DeviceCondition(BaseModel):
    """Device-based permission condition."""

    allowed_device_types: Optional[list[str]] = Field(
        default=None
    )  # mobile, desktop, tablet
    allowed_user_agents: Optional[list[str]] = Field(default=None)
    blocked_user_agents: Optional[list[str]] = Field(default=None)
    require_device_verification: bool = Field(default=False)


class ConditionalPermission(BaseModel):
    """Enhanced permission with conditional access."""

    id: Optional[str] = Field(default=None)
    permission_id: str = Field(...)
    time_conditions: Optional[TimeCondition] = Field(default=None)
    ip_conditions: Optional[IPCondition] = Field(default=None)
    device_conditions: Optional[DeviceCondition] = Field(default=None)
    is_active: bool = Field(default=True)
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)


# Advanced RBAC Features - Dynamic Role Assignment


class RoleAssignmentRule(BaseModel):
    """Rule for automatic role assignment."""

    id: Optional[str] = Field(default=None)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default=None)
    trigger_type: str = Field(...)  # "user_created", "time_based", "condition_met"
    target_role_id: str = Field(...)
    conditions: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = Field(default=True)
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)


class RoleDelegation(BaseModel):
    """Role delegation model."""

    id: Optional[str] = Field(default=None)
    delegator_user_id: str = Field(...)
    delegatee_user_id: str = Field(...)
    role_id: str = Field(...)
    context_type: Optional[str] = Field(default=None)
    context_id: Optional[str] = Field(default=None)
    delegated_at: Optional[datetime] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)
    is_active: bool = Field(default=True)
    conditions: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)


# Advanced RBAC Features - Permission Inheritance


class RoleHierarchy(BaseModel):
    """Role hierarchy model for permission inheritance."""

    id: Optional[str] = Field(default=None)
    parent_role_id: str = Field(...)
    child_role_id: str = Field(...)
    inheritance_type: str = Field(default="full")  # "full", "partial", "none"
    inherited_permissions: Optional[list[str]] = Field(default=None)
    excluded_permissions: Optional[list[str]] = Field(default=None)
    is_active: bool = Field(default=True)
    created_at: Optional[datetime] = Field(default=None)


class PermissionOverride(BaseModel):
    """Permission override model."""

    id: Optional[str] = Field(default=None)
    role_id: str = Field(...)
    permission_id: str = Field(...)
    override_type: str = Field(...)  # "grant", "deny", "modify"
    override_conditions: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = Field(default=True)
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)
