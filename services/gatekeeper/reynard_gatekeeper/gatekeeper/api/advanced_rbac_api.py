"""Advanced RBAC API endpoints.

This module provides REST API endpoints for advanced RBAC features including:
- Conditional permissions management
- Dynamic role assignment rules
- Role delegation
- Permission inheritance and overrides

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from ..core.auth_manager import AuthManager
from ..core.dependencies import get_auth_manager
from ..models.rbac import (
    ConditionalPermission,
    DeviceCondition,
    IPCondition,
    PermissionOverride,
    PermissionResult,
    RoleAssignmentRule,
    RoleDelegation,
    RoleHierarchy,
    TimeCondition,
)
from ..services.advanced_rbac_service import AdvancedRBACService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/advanced-rbac", tags=["Advanced RBAC"])


# Request/Response Models


class TimeConditionRequest(BaseModel):
    """Request model for time conditions."""

    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    days_of_week: Optional[List[int]] = Field(
        default=None, description="0=Monday, 6=Sunday"
    )
    hours_of_day: Optional[List[int]] = Field(default=None, description="0-23")
    timezone: str = Field(default="UTC")


class IPConditionRequest(BaseModel):
    """Request model for IP conditions."""

    allowed_ips: Optional[List[str]] = None
    blocked_ips: Optional[List[str]] = None
    allowed_cidrs: Optional[List[str]] = None
    blocked_cidrs: Optional[List[str]] = None


class DeviceConditionRequest(BaseModel):
    """Request model for device conditions."""

    allowed_device_types: Optional[List[str]] = None
    allowed_user_agents: Optional[List[str]] = None
    blocked_user_agents: Optional[List[str]] = None
    require_device_verification: bool = False


class ConditionalPermissionRequest(BaseModel):
    """Request model for creating conditional permissions."""

    permission_id: str
    time_conditions: Optional[TimeConditionRequest] = None
    ip_conditions: Optional[IPConditionRequest] = None
    device_conditions: Optional[DeviceConditionRequest] = None


class ConditionalPermissionResponse(BaseModel):
    """Response model for conditional permissions."""

    id: str
    permission_id: str
    time_conditions: Optional[TimeCondition] = None
    ip_conditions: Optional[IPCondition] = None
    device_conditions: Optional[DeviceCondition] = None
    is_active: bool
    created_at: datetime


class RoleAssignmentRuleRequest(BaseModel):
    """Request model for role assignment rules."""

    name: str
    description: Optional[str] = None
    trigger_type: str = Field(
        ..., description="user_created, time_based, condition_met"
    )
    target_role_id: str
    conditions: Dict[str, Any] = Field(default_factory=dict)


class RoleAssignmentRuleResponse(BaseModel):
    """Response model for role assignment rules."""

    id: str
    name: str
    description: Optional[str] = None
    trigger_type: str
    target_role_id: str
    conditions: Dict[str, Any]
    is_active: bool
    created_at: datetime


class RoleDelegationRequest(BaseModel):
    """Request model for role delegation."""

    delegator_username: str
    delegatee_username: str
    role_name: str
    expires_at: Optional[datetime] = None
    context: Optional[Dict[str, Any]] = None


class RoleDelegationResponse(BaseModel):
    """Response model for role delegation."""

    id: str
    delegator_user_id: str
    delegatee_user_id: str
    role_id: str
    context_type: Optional[str] = None
    context_id: Optional[str] = None
    delegated_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool


class RoleHierarchyRequest(BaseModel):
    """Request model for role hierarchy."""

    parent_role_id: str
    child_role_id: str
    inheritance_type: str = Field(default="full", description="full, partial, none")
    inherited_permissions: Optional[List[str]] = None
    excluded_permissions: Optional[List[str]] = None


class RoleHierarchyResponse(BaseModel):
    """Response model for role hierarchy."""

    id: str
    parent_role_id: str
    child_role_id: str
    inheritance_type: str
    inherited_permissions: Optional[List[str]] = None
    excluded_permissions: Optional[List[str]] = None
    is_active: bool
    created_at: datetime


class PermissionOverrideRequest(BaseModel):
    """Request model for permission overrides."""

    role_id: str
    permission_id: str
    override_type: str = Field(..., description="grant, deny, modify")
    override_conditions: Dict[str, Any] = Field(default_factory=dict)


class PermissionOverrideResponse(BaseModel):
    """Response model for permission overrides."""

    id: str
    role_id: str
    permission_id: str
    override_type: str
    override_conditions: Dict[str, Any]
    is_active: bool
    created_at: datetime


class PermissionCheckRequest(BaseModel):
    """Request model for permission checks."""

    username: str
    resource_type: str
    resource_id: str
    operation: str
    client_ip: Optional[str] = None
    user_agent: Optional[str] = None
    device_type: Optional[str] = None


class PermissionCheckResponse(BaseModel):
    """Response model for permission checks."""

    granted: bool
    reason: Optional[str] = None
    conditions_met: bool = True
    expires_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


# Dependency injection


def get_advanced_rbac_service(
    auth_manager: AuthManager = Depends(get_auth_manager),
) -> AdvancedRBACService:
    """Get AdvancedRBACService instance."""
    return AdvancedRBACService(auth_manager)


# Conditional Permissions Endpoints


@router.post("/conditional-permissions", response_model=ConditionalPermissionResponse)
async def create_conditional_permission(
    request: ConditionalPermissionRequest,
    advanced_rbac: AdvancedRBACService = Depends(get_advanced_rbac_service),
):
    """Create a conditional permission."""
    try:
        # Convert request models to domain models
        time_conditions = None
        if request.time_conditions:
            time_conditions = TimeCondition(**request.time_conditions.model_dump())

        ip_conditions = None
        if request.ip_conditions:
            ip_conditions = IPCondition(**request.ip_conditions.model_dump())

        device_conditions = None
        if request.device_conditions:
            device_conditions = DeviceCondition(
                **request.device_conditions.model_dump()
            )

        conditional_permission = await advanced_rbac.create_conditional_permission(
            permission_id=request.permission_id,
            time_conditions=time_conditions,
            ip_conditions=ip_conditions,
            device_conditions=device_conditions,
        )

        return ConditionalPermissionResponse(
            id=conditional_permission.id,
            permission_id=conditional_permission.permission_id,
            time_conditions=conditional_permission.time_conditions,
            ip_conditions=conditional_permission.ip_conditions,
            device_conditions=conditional_permission.device_conditions,
            is_active=conditional_permission.is_active,
            created_at=conditional_permission.created_at,
        )

    except Exception as e:
        logger.error(f"Failed to create conditional permission: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conditional permission: {str(e)}",
        )


@router.post("/permissions/check", response_model=PermissionCheckResponse)
async def check_conditional_permission(
    request: PermissionCheckRequest,
    advanced_rbac: AdvancedRBACService = Depends(get_advanced_rbac_service),
):
    """Check permission with conditional access controls."""
    try:
        result = await advanced_rbac.check_conditional_permission(
            username=request.username,
            resource_type=request.resource_type,
            resource_id=request.resource_id,
            operation=request.operation,
            client_ip=request.client_ip,
            user_agent=request.user_agent,
            device_type=request.device_type,
        )

        return PermissionCheckResponse(
            granted=result.granted,
            reason=result.reason,
            conditions_met=result.conditions_met,
            expires_at=result.expires_at,
            metadata=result.metadata,
        )

    except Exception as e:
        logger.error(f"Failed to check conditional permission: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check permission: {str(e)}",
        )


# Dynamic Role Assignment Endpoints


@router.post("/role-assignment-rules", response_model=RoleAssignmentRuleResponse)
async def create_role_assignment_rule(
    request: RoleAssignmentRuleRequest,
    advanced_rbac: AdvancedRBACService = Depends(get_advanced_rbac_service),
):
    """Create a role assignment rule."""
    try:
        rule = await advanced_rbac.create_role_assignment_rule(
            name=request.name,
            trigger_type=request.trigger_type,
            target_role_id=request.target_role_id,
            conditions=request.conditions,
            description=request.description,
        )

        return RoleAssignmentRuleResponse(
            id=rule.id,
            name=rule.name,
            description=rule.description,
            trigger_type=rule.trigger_type,
            target_role_id=rule.target_role_id,
            conditions=rule.conditions,
            is_active=rule.is_active,
            created_at=rule.created_at,
        )

    except Exception as e:
        logger.error(f"Failed to create role assignment rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create role assignment rule: {str(e)}",
        )


@router.post("/role-assignment-rules/process/{username}")
async def process_role_assignment_rules(
    username: str,
    trigger_type: str,
    advanced_rbac: AdvancedRBACService = Depends(get_advanced_rbac_service),
):
    """Process role assignment rules for a user."""
    try:
        assigned_roles = await advanced_rbac.process_role_assignment_rules(
            username=username, trigger_type=trigger_type
        )

        return {
            "username": username,
            "trigger_type": trigger_type,
            "assigned_roles": assigned_roles,
            "count": len(assigned_roles),
        }

    except Exception as e:
        logger.error(f"Failed to process role assignment rules: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process role assignment rules: {str(e)}",
        )


# Role Delegation Endpoints


@router.post("/role-delegations", response_model=RoleDelegationResponse)
async def delegate_role(
    request: RoleDelegationRequest,
    advanced_rbac: AdvancedRBACService = Depends(get_advanced_rbac_service),
):
    """Delegate a role from one user to another."""
    try:
        success = await advanced_rbac.delegate_role(
            delegator_username=request.delegator_username,
            delegatee_username=request.delegatee_username,
            role_name=request.role_name,
            expires_at=request.expires_at,
            context=request.context,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delegate role",
            )

        # Note: In a real implementation, you'd return the actual delegation object
        # For now, we'll return a success response
        return {
            "message": "Role delegated successfully",
            "delegator_username": request.delegator_username,
            "delegatee_username": request.delegatee_username,
            "role_name": request.role_name,
            "expires_at": request.expires_at,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delegate role: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delegate role: {str(e)}",
        )


@router.delete("/role-delegations/{delegation_id}")
async def revoke_delegation(
    delegation_id: str,
    advanced_rbac: AdvancedRBACService = Depends(get_advanced_rbac_service),
):
    """Revoke a role delegation."""
    try:
        success = await advanced_rbac.revoke_delegation(delegation_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delegation not found or already revoked",
            )

        return {
            "message": "Delegation revoked successfully",
            "delegation_id": delegation_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to revoke delegation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke delegation: {str(e)}",
        )


# Permission Inheritance Endpoints


@router.post("/role-hierarchies", response_model=RoleHierarchyResponse)
async def create_role_hierarchy(
    request: RoleHierarchyRequest,
    advanced_rbac: AdvancedRBACService = Depends(get_advanced_rbac_service),
):
    """Create a role hierarchy relationship."""
    try:
        hierarchy = await advanced_rbac.create_role_hierarchy(
            parent_role_id=request.parent_role_id,
            child_role_id=request.child_role_id,
            inheritance_type=request.inheritance_type,
            inherited_permissions=request.inherited_permissions,
            excluded_permissions=request.excluded_permissions,
        )

        return RoleHierarchyResponse(
            id=hierarchy.id,
            parent_role_id=hierarchy.parent_role_id,
            child_role_id=hierarchy.child_role_id,
            inheritance_type=hierarchy.inheritance_type,
            inherited_permissions=hierarchy.inherited_permissions,
            excluded_permissions=hierarchy.excluded_permissions,
            is_active=hierarchy.is_active,
            created_at=hierarchy.created_at,
        )

    except Exception as e:
        logger.error(f"Failed to create role hierarchy: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create role hierarchy: {str(e)}",
        )


@router.get("/role-hierarchies/{role_id}/inherited-permissions")
async def get_inherited_permissions(
    role_id: str,
    advanced_rbac: AdvancedRBACService = Depends(get_advanced_rbac_service),
):
    """Get all permissions inherited by a role through hierarchy."""
    try:
        permissions = await advanced_rbac.get_inherited_permissions(role_id)

        return {
            "role_id": role_id,
            "permissions": permissions,
            "count": len(permissions),
        }

    except Exception as e:
        logger.error(f"Failed to get inherited permissions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get inherited permissions: {str(e)}",
        )


@router.post("/permission-overrides", response_model=PermissionOverrideResponse)
async def create_permission_override(
    request: PermissionOverrideRequest,
    advanced_rbac: AdvancedRBACService = Depends(get_advanced_rbac_service),
):
    """Create a permission override for a role."""
    try:
        override = await advanced_rbac.create_permission_override(
            role_id=request.role_id,
            permission_id=request.permission_id,
            override_type=request.override_type,
            override_conditions=request.override_conditions,
        )

        return PermissionOverrideResponse(
            id=override.id,
            role_id=override.role_id,
            permission_id=override.permission_id,
            override_type=override.override_type,
            override_conditions=override.override_conditions,
            is_active=override.is_active,
            created_at=override.created_at,
        )

    except Exception as e:
        logger.error(f"Failed to create permission override: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create permission override: {str(e)}",
        )


@router.post(
    "/permissions/check-with-inheritance", response_model=PermissionCheckResponse
)
async def check_permission_with_inheritance(
    request: PermissionCheckRequest,
    advanced_rbac: AdvancedRBACService = Depends(get_advanced_rbac_service),
):
    """Check permission including inheritance and overrides."""
    try:
        result = await advanced_rbac.check_permission_with_inheritance(
            username=request.username,
            resource_type=request.resource_type,
            resource_id=request.resource_id,
            operation=request.operation,
        )

        return PermissionCheckResponse(
            granted=result.granted,
            reason=result.reason,
            conditions_met=result.conditions_met,
            expires_at=result.expires_at,
            metadata=result.metadata,
        )

    except Exception as e:
        logger.error(f"Failed to check permission with inheritance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check permission: {str(e)}",
        )


# Utility Endpoints


@router.get("/health")
async def health_check():
    """Health check endpoint for advanced RBAC service."""
    return {
        "status": "healthy",
        "service": "advanced-rbac",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "features": [
            "conditional_permissions",
            "dynamic_role_assignment",
            "role_delegation",
            "permission_inheritance",
            "permission_overrides",
        ],
    }


@router.get("/features")
async def get_features():
    """Get available advanced RBAC features."""
    return {
        "conditional_permissions": {
            "description": "Time-based, IP-based, and device-based access controls",
            "endpoints": ["POST /conditional-permissions", "POST /permissions/check"],
        },
        "dynamic_role_assignment": {
            "description": "Automatic role assignment based on rules and triggers",
            "endpoints": [
                "POST /role-assignment-rules",
                "POST /role-assignment-rules/process/{username}",
            ],
        },
        "role_delegation": {
            "description": "Temporary role delegation between users",
            "endpoints": [
                "POST /role-delegations",
                "DELETE /role-delegations/{delegation_id}",
            ],
        },
        "permission_inheritance": {
            "description": "Role hierarchy with permission inheritance",
            "endpoints": [
                "POST /role-hierarchies",
                "GET /role-hierarchies/{role_id}/inherited-permissions",
            ],
        },
        "permission_overrides": {
            "description": "Override permissions for specific roles",
            "endpoints": [
                "POST /permission-overrides",
                "POST /permissions/check-with-inheritance",
            ],
        },
    }
