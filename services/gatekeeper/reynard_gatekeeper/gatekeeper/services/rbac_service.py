"""RBAC Service: Conditional Permissions, Dynamic Assignment, and Inheritance

This service provides advanced RBAC features including:
- Conditional permissions (time-based, IP-based, device-based)
- Dynamic role assignment with automatic triggers
- Role delegation and expiration
- Permission inheritance and role hierarchy
- Permission overrides

Author: Reynard Development Team
Version: 1.0.0
"""

import ipaddress
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from ..core.audit_service import AuditEventType, audit_service
from ..core.auth_manager import AuthManager
from ..models.rbac import (
    ConditionalPermission,
    DeviceCondition,
    IPCondition,
    Permission,
    PermissionOverride,
    PermissionResult,
    Role,
    RoleAssignmentRule,
    RoleDelegation,
    RoleHierarchy,
    TimeCondition,
    UserRoleLink,
)

logger = logging.getLogger(__name__)


class RBACService:
    """Advanced RBAC service with conditional permissions and dynamic assignment."""

    def __init__(self, auth_manager: AuthManager):
        """Initialize the advanced RBAC service.

        Args:
            auth_manager: The authentication manager instance
        """
        self.auth_manager = auth_manager

    # Conditional Permissions

    async def create_conditional_permission(
        self,
        permission_id: str,
        time_conditions: Optional[TimeCondition] = None,
        ip_conditions: Optional[IPCondition] = None,
        device_conditions: Optional[DeviceCondition] = None,
    ) -> ConditionalPermission:
        """Create a conditional permission.

        Args:
            permission_id: ID of the base permission
            time_conditions: Time-based access conditions
            ip_conditions: IP-based access conditions
            device_conditions: Device-based access conditions

        Returns:
            ConditionalPermission: Created conditional permission
        """
        try:
            conditional_permission = ConditionalPermission(
                permission_id=permission_id,
                time_conditions=time_conditions,
                ip_conditions=ip_conditions,
                device_conditions=device_conditions,
                created_at=datetime.now(timezone.utc),
            )

            # Store in backend
            result = await self.auth_manager.backend.create_conditional_permission(
                conditional_permission.model_dump()
            )

            # Log audit event
            await audit_service.log_rbac_operation(
                event_type=AuditEventType.CONDITIONAL_PERMISSION_CREATED,
                permission_id=permission_id,
                success=True,
                context={
                    "time_conditions": (
                        time_conditions.model_dump() if time_conditions else None
                    ),
                    "ip_conditions": (
                        ip_conditions.model_dump() if ip_conditions else None
                    ),
                    "device_conditions": (
                        device_conditions.model_dump() if device_conditions else None
                    ),
                },
            )

            logger.info(f"Created conditional permission for {permission_id}")
            return ConditionalPermission(**result)

        except Exception as e:
            logger.error(f"Failed to create conditional permission: {e}")
            raise

    async def check_conditional_permission(
        self,
        username: str,
        resource_type: str,
        resource_id: str,
        operation: str,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
        device_type: Optional[str] = None,
    ) -> PermissionResult:
        """Check permission with conditional access controls.

        Args:
            username: Username to check
            resource_type: Type of resource
            resource_id: ID of the resource
            operation: Operation to check
            client_ip: Client IP address
            user_agent: User agent string
            device_type: Type of device

        Returns:
            PermissionResult: Permission check result with conditions
        """
        try:
            # First check basic permission
            basic_result = await self.auth_manager.check_permission(
                username, resource_type, resource_id, operation
            )

            if not basic_result.granted:
                return basic_result

            # Get user and check for conditional permissions
            user = await self.auth_manager.get_user_by_username(username)
            if not user:
                return PermissionResult(granted=False, reason="User not found")

            # Get user roles and check for conditional permissions
            user_roles = await self.auth_manager.get_user_roles(username)

            for role_data in user_roles:
                role_id = role_data.get("role_id")
                if not role_id:
                    continue

                # Check conditional permissions for this role
                conditional_permissions = await self.auth_manager.backend.get_conditional_permissions_for_role(
                    role_id
                )

                for cond_perm in conditional_permissions:
                    # Check if this conditional permission applies to the requested resource/operation
                    base_permission = (
                        await self.auth_manager.backend.get_permission_by_id(
                            cond_perm["permission_id"]
                        )
                    )
                    if not base_permission:
                        continue

                    if (
                        base_permission["resource_type"] == resource_type
                        and base_permission["operation"] == operation
                    ):

                        # Check time conditions
                        if cond_perm.get("time_conditions"):
                            if not self._check_time_conditions(
                                cond_perm["time_conditions"]
                            ):
                                return PermissionResult(
                                    granted=False,
                                    reason="Time-based access restriction",
                                    conditions_met=False,
                                )

                        # Check IP conditions
                        if cond_perm.get("ip_conditions") and client_ip:
                            if not self._check_ip_conditions(
                                cond_perm["ip_conditions"], client_ip
                            ):
                                return PermissionResult(
                                    granted=False,
                                    reason="IP-based access restriction",
                                    conditions_met=False,
                                )

                        # Check device conditions
                        if cond_perm.get("device_conditions"):
                            if not self._check_device_conditions(
                                cond_perm["device_conditions"], user_agent, device_type
                            ):
                                return PermissionResult(
                                    granted=False,
                                    reason="Device-based access restriction",
                                    conditions_met=False,
                                )

            # All conditions passed
            return PermissionResult(
                granted=True, reason="All conditions met", conditions_met=True
            )

        except Exception as e:
            logger.error(f"Failed to check conditional permission: {e}")
            return PermissionResult(
                granted=False, reason=f"Conditional permission check failed: {e}"
            )

    def _check_time_conditions(self, time_conditions: Dict[str, Any]) -> bool:
        """Check if current time meets the time conditions.

        Args:
            time_conditions: Time conditions dictionary

        Returns:
            bool: True if time conditions are met
        """
        try:
            now = datetime.now(timezone.utc)

            # Check start/end time
            if time_conditions.get("start_time"):
                start_time = datetime.fromisoformat(time_conditions["start_time"])
                if now < start_time:
                    return False

            if time_conditions.get("end_time"):
                end_time = datetime.fromisoformat(time_conditions["end_time"])
                if now > end_time:
                    return False

            # Check days of week
            if time_conditions.get("days_of_week"):
                current_weekday = now.weekday()  # 0=Monday, 6=Sunday
                if current_weekday not in time_conditions["days_of_week"]:
                    return False

            # Check hours of day
            if time_conditions.get("hours_of_day"):
                current_hour = now.hour
                if current_hour not in time_conditions["hours_of_day"]:
                    return False

            return True

        except Exception as e:
            logger.error(f"Error checking time conditions: {e}")
            return False

    def _check_ip_conditions(
        self, ip_conditions: Dict[str, Any], client_ip: str
    ) -> bool:
        """Check if client IP meets the IP conditions.

        Args:
            ip_conditions: IP conditions dictionary
            client_ip: Client IP address

        Returns:
            bool: True if IP conditions are met
        """
        try:
            client_ip_obj = ipaddress.ip_address(client_ip)

            # Check blocked IPs first
            if ip_conditions.get("blocked_ips"):
                for blocked_ip in ip_conditions["blocked_ips"]:
                    if client_ip_obj == ipaddress.ip_address(blocked_ip):
                        return False

            # Check blocked CIDRs
            if ip_conditions.get("blocked_cidrs"):
                for blocked_cidr in ip_conditions["blocked_cidrs"]:
                    if client_ip_obj in ipaddress.ip_network(blocked_cidr):
                        return False

            # Check allowed IPs
            if ip_conditions.get("allowed_ips"):
                for allowed_ip in ip_conditions["allowed_ips"]:
                    if client_ip_obj == ipaddress.ip_address(allowed_ip):
                        return True
                # If allowed_ips is specified but client IP not in list, deny
                return False

            # Check allowed CIDRs
            if ip_conditions.get("allowed_cidrs"):
                for allowed_cidr in ip_conditions["allowed_cidrs"]:
                    if client_ip_obj in ipaddress.ip_network(allowed_cidr):
                        return True
                # If allowed_cidrs is specified but client IP not in any CIDR, deny
                return False

            # If no restrictions specified, allow
            return True

        except Exception as e:
            logger.error(f"Error checking IP conditions: {e}")
            return False

    def _check_device_conditions(
        self,
        device_conditions: Dict[str, Any],
        user_agent: Optional[str],
        device_type: Optional[str],
    ) -> bool:
        """Check if device meets the device conditions.

        Args:
            device_conditions: Device conditions dictionary
            user_agent: User agent string
            device_type: Type of device

        Returns:
            bool: True if device conditions are met
        """
        try:
            # Check blocked user agents
            if device_conditions.get("blocked_user_agents") and user_agent:
                for blocked_ua in device_conditions["blocked_user_agents"]:
                    if blocked_ua.lower() in user_agent.lower():
                        return False

            # Check allowed device types
            if device_conditions.get("allowed_device_types") and device_type:
                if device_type not in device_conditions["allowed_device_types"]:
                    return False

            # Check allowed user agents
            if device_conditions.get("allowed_user_agents") and user_agent:
                for allowed_ua in device_conditions["allowed_user_agents"]:
                    if allowed_ua.lower() in user_agent.lower():
                        return True
                # If allowed_user_agents is specified but user agent not in list, deny
                return False

            # Check device verification requirement
            if device_conditions.get("require_device_verification"):
                # This would need to be implemented with actual device verification
                # For now, we'll assume it's not verified
                return False

            return True

        except Exception as e:
            logger.error(f"Error checking device conditions: {e}")
            return False

    # Dynamic Role Assignment

    async def create_role_assignment_rule(
        self,
        name: str,
        trigger_type: str,
        target_role_id: str,
        conditions: Dict[str, Any],
        description: Optional[str] = None,
    ) -> RoleAssignmentRule:
        """Create a rule for automatic role assignment.

        Args:
            name: Name of the rule
            trigger_type: Type of trigger ("user_created", "time_based", "condition_met")
            target_role_id: ID of the role to assign
            conditions: Conditions for the rule
            description: Optional description

        Returns:
            RoleAssignmentRule: Created rule
        """
        try:
            rule = RoleAssignmentRule(
                name=name,
                description=description,
                trigger_type=trigger_type,
                target_role_id=target_role_id,
                conditions=conditions,
                created_at=datetime.now(timezone.utc),
            )

            # Store in backend
            result = await self.auth_manager.backend.create_role_assignment_rule(
                rule.model_dump()
            )

            # Log audit event
            await audit_service.log_rbac_operation(
                event_type=AuditEventType.ROLE_ASSIGNMENT_RULE_CREATED,
                rule_name=name,
                target_role_id=target_role_id,
                success=True,
                context=conditions,
            )

            logger.info(f"Created role assignment rule: {name}")
            return RoleAssignmentRule(**result)

        except Exception as e:
            logger.error(f"Failed to create role assignment rule: {e}")
            raise

    async def process_role_assignment_rules(
        self, username: str, trigger_type: str
    ) -> List[str]:
        """Process role assignment rules for a user.

        Args:
            username: Username to process rules for
            trigger_type: Type of trigger that occurred

        Returns:
            List[str]: List of roles that were assigned
        """
        try:
            assigned_roles = []

            # Get all active rules for this trigger type
            rules = (
                await self.auth_manager.backend.get_role_assignment_rules_by_trigger(
                    trigger_type
                )
            )

            for rule in rules:
                if not rule.get("is_active"):
                    continue

                # Check if rule conditions are met
                if await self._evaluate_rule_conditions(username, rule["conditions"]):
                    # Assign the role
                    success = await self.auth_manager.assign_role_to_user(
                        username,
                        rule["target_role_id"],
                        context={"rule_id": rule["id"], "trigger_type": trigger_type},
                    )

                    if success:
                        assigned_roles.append(rule["target_role_id"])

                        # Log audit event
                        await audit_service.log_rbac_operation(
                            event_type=AuditEventType.ROLE_AUTO_ASSIGNED,
                            username=username,
                            role_name=rule["target_role_id"],
                            success=True,
                            context={
                                "rule_id": rule["id"],
                                "trigger_type": trigger_type,
                            },
                        )

            if assigned_roles:
                logger.info(f"Auto-assigned roles {assigned_roles} to user {username}")

            return assigned_roles

        except Exception as e:
            logger.error(f"Failed to process role assignment rules: {e}")
            return []

    async def _evaluate_rule_conditions(
        self, username: str, conditions: Dict[str, Any]
    ) -> bool:
        """Evaluate rule conditions for a user.

        Args:
            username: Username to evaluate conditions for
            conditions: Rule conditions

        Returns:
            bool: True if conditions are met
        """
        try:
            # Get user data
            user = await self.auth_manager.get_user_by_username(username)
            if not user:
                return False

            # Check various condition types
            for condition_type, condition_value in conditions.items():
                if condition_type == "user_created_after":
                    if user.created_at and user.created_at < datetime.fromisoformat(
                        condition_value
                    ):
                        return False

                elif condition_type == "user_created_before":
                    if user.created_at and user.created_at > datetime.fromisoformat(
                        condition_value
                    ):
                        return False

                elif condition_type == "user_role":
                    user_roles = await self.auth_manager.get_user_roles(username)
                    role_names = [role.get("role_name") for role in user_roles]
                    if condition_value not in role_names:
                        return False

                elif condition_type == "user_metadata":
                    if not user.metadata:
                        return False
                    for key, value in condition_value.items():
                        if user.metadata.get(key) != value:
                            return False

            return True

        except Exception as e:
            logger.error(f"Error evaluating rule conditions: {e}")
            return False

    # Role Delegation

    async def delegate_role(
        self,
        delegator_username: str,
        delegatee_username: str,
        role_name: str,
        expires_at: Optional[datetime] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Delegate a role from one user to another.

        Args:
            delegator_username: Username of the delegator
            delegatee_username: Username of the delegatee
            role_name: Name of the role to delegate
            expires_at: Optional expiration time
            context: Optional context for delegation

        Returns:
            bool: True if delegation was successful
        """
        try:
            # Get users
            delegator = await self.auth_manager.get_user_by_username(delegator_username)
            delegatee = await self.auth_manager.get_user_by_username(delegatee_username)

            if not delegator or not delegatee:
                logger.error("Delegator or delegatee not found")
                return False

            # Get role
            role = await self.auth_manager.get_role_by_name(role_name)
            if not role:
                logger.error(f"Role {role_name} not found")
                return False

            # Check if delegator has the role
            delegator_roles = await self.auth_manager.get_user_roles(delegator_username)
            delegator_has_role = any(
                role_data.get("role_id") == role.id for role_data in delegator_roles
            )

            if not delegator_has_role:
                logger.error(
                    f"Delegator {delegator_username} does not have role {role_name}"
                )
                return False

            # Create delegation record
            delegation = RoleDelegation(
                delegator_user_id=delegator.id,
                delegatee_user_id=delegatee.id,
                role_id=role.id,
                context_type=context.get("type") if context else None,
                context_id=context.get("id") if context else None,
                delegated_at=datetime.now(timezone.utc),
                expires_at=expires_at,
                conditions=context or {},
            )

            # Store delegation
            success = await self.auth_manager.backend.create_role_delegation(
                delegation.model_dump()
            )

            if success:
                # Assign role to delegatee
                role_assigned = await self.auth_manager.assign_role_to_user(
                    delegatee_username,
                    role_name,
                    context={
                        "delegated_by": delegator_username,
                        "delegation_id": delegation.id,
                    },
                )

                if role_assigned:
                    # Log audit event
                    await audit_service.log_rbac_operation(
                        event_type=AuditEventType.ROLE_DELEGATED,
                        username=delegator_username,
                        user_id=delegator.id,
                        role_name=role_name,
                        success=True,
                        context={
                            "delegatee_username": delegatee_username,
                            "delegatee_id": delegatee.id,
                            "expires_at": (
                                expires_at.isoformat() if expires_at else None
                            ),
                        },
                    )

                    logger.info(
                        f"Delegated role {role_name} from {delegator_username} to {delegatee_username}"
                    )
                    return True

            return False

        except Exception as e:
            logger.error(f"Failed to delegate role: {e}")
            return False

    async def revoke_delegation(self, delegation_id: str) -> bool:
        """Revoke a role delegation.

        Args:
            delegation_id: ID of the delegation to revoke

        Returns:
            bool: True if revocation was successful
        """
        try:
            # Get delegation
            delegation = await self.auth_manager.backend.get_role_delegation_by_id(
                delegation_id
            )
            if not delegation:
                logger.error(f"Delegation {delegation_id} not found")
                return False

            # Remove role from delegatee
            delegatee = await self.auth_manager.get_user_by_id(
                delegation["delegatee_user_id"]
            )
            if delegatee:
                role = await self.auth_manager.get_role_by_id(delegation["role_id"])
                if role:
                    await self.auth_manager.remove_role_from_user(
                        delegatee.username,
                        role.name,
                        context={"delegation_revoked": delegation_id},
                    )

            # Mark delegation as inactive
            success = await self.auth_manager.backend.revoke_role_delegation(
                delegation_id
            )

            if success:
                # Log audit event
                await audit_service.log_rbac_operation(
                    event_type=AuditEventType.ROLE_DELEGATION_REVOKED,
                    delegation_id=delegation_id,
                    success=True,
                    context=delegation,
                )

                logger.info(f"Revoked delegation {delegation_id}")

            return success

        except Exception as e:
            logger.error(f"Failed to revoke delegation: {e}")
            return False

    # Permission Inheritance

    async def create_role_hierarchy(
        self,
        parent_role_id: str,
        child_role_id: str,
        inheritance_type: str = "full",
        inherited_permissions: Optional[List[str]] = None,
        excluded_permissions: Optional[List[str]] = None,
    ) -> RoleHierarchy:
        """Create a role hierarchy relationship.

        Args:
            parent_role_id: ID of the parent role
            child_role_id: ID of the child role
            inheritance_type: Type of inheritance ("full", "partial", "none")
            inherited_permissions: List of specific permissions to inherit
            excluded_permissions: List of permissions to exclude from inheritance

        Returns:
            RoleHierarchy: Created hierarchy relationship
        """
        try:
            hierarchy = RoleHierarchy(
                parent_role_id=parent_role_id,
                child_role_id=child_role_id,
                inheritance_type=inheritance_type,
                inherited_permissions=inherited_permissions,
                excluded_permissions=excluded_permissions,
                created_at=datetime.now(timezone.utc),
            )

            # Store in backend
            result = await self.auth_manager.backend.create_role_hierarchy(
                hierarchy.model_dump()
            )

            # Log audit event
            await audit_service.log_rbac_operation(
                event_type=AuditEventType.ROLE_HIERARCHY_CREATED,
                parent_role_id=parent_role_id,
                child_role_id=child_role_id,
                success=True,
                context={
                    "inheritance_type": inheritance_type,
                    "inherited_permissions": inherited_permissions,
                    "excluded_permissions": excluded_permissions,
                },
            )

            logger.info(f"Created role hierarchy: {parent_role_id} -> {child_role_id}")
            return RoleHierarchy(**result)

        except Exception as e:
            logger.error(f"Failed to create role hierarchy: {e}")
            raise

    async def get_inherited_permissions(self, role_id: str) -> List[Dict[str, Any]]:
        """Get all permissions inherited by a role through hierarchy.

        Args:
            role_id: ID of the role

        Returns:
            List[Dict[str, Any]]: List of inherited permissions
        """
        try:
            inherited_permissions = []

            # Get direct permissions
            direct_permissions = (
                await self.auth_manager.backend.get_permissions_for_role(role_id)
            )
            inherited_permissions.extend(direct_permissions)

            # Get parent roles and their permissions
            parent_hierarchies = (
                await self.auth_manager.backend.get_role_hierarchies_by_child(role_id)
            )

            for hierarchy in parent_hierarchies:
                if not hierarchy.get("is_active"):
                    continue

                parent_role_id = hierarchy["parent_role_id"]
                inheritance_type = hierarchy.get("inheritance_type", "full")

                if inheritance_type == "none":
                    continue

                # Get parent permissions
                parent_permissions = (
                    await self.auth_manager.backend.get_permissions_for_role(
                        parent_role_id
                    )
                )

                if inheritance_type == "full":
                    # Inherit all permissions except excluded ones
                    excluded = hierarchy.get("excluded_permissions", [])
                    for perm in parent_permissions:
                        if perm["id"] not in excluded:
                            inherited_permissions.append(perm)

                elif inheritance_type == "partial":
                    # Only inherit specified permissions
                    inherited = hierarchy.get("inherited_permissions", [])
                    for perm in parent_permissions:
                        if perm["id"] in inherited:
                            inherited_permissions.append(perm)

                # Recursively get permissions from parent's parents
                parent_inherited = await self.get_inherited_permissions(parent_role_id)
                inherited_permissions.extend(parent_inherited)

            # Remove duplicates
            seen = set()
            unique_permissions = []
            for perm in inherited_permissions:
                if perm["id"] not in seen:
                    seen.add(perm["id"])
                    unique_permissions.append(perm)

            return unique_permissions

        except Exception as e:
            logger.error(f"Failed to get inherited permissions: {e}")
            return []

    async def create_permission_override(
        self,
        role_id: str,
        permission_id: str,
        override_type: str,
        override_conditions: Dict[str, Any],
    ) -> PermissionOverride:
        """Create a permission override for a role.

        Args:
            role_id: ID of the role
            permission_id: ID of the permission
            override_type: Type of override ("grant", "deny", "modify")
            override_conditions: Conditions for the override

        Returns:
            PermissionOverride: Created override
        """
        try:
            override = PermissionOverride(
                role_id=role_id,
                permission_id=permission_id,
                override_type=override_type,
                override_conditions=override_conditions,
                created_at=datetime.now(timezone.utc),
            )

            # Store in backend
            result = await self.auth_manager.backend.create_permission_override(
                override.model_dump()
            )

            # Log audit event
            await audit_service.log_rbac_operation(
                event_type=AuditEventType.PERMISSION_OVERRIDE_CREATED,
                role_id=role_id,
                permission_id=permission_id,
                success=True,
                context={
                    "override_type": override_type,
                    "override_conditions": override_conditions,
                },
            )

            logger.info(
                f"Created permission override: {role_id} -> {permission_id} ({override_type})"
            )
            return PermissionOverride(**result)

        except Exception as e:
            logger.error(f"Failed to create permission override: {e}")
            raise

    async def check_permission_with_inheritance(
        self, username: str, resource_type: str, resource_id: str, operation: str
    ) -> PermissionResult:
        """Check permission including inheritance and overrides.

        Args:
            username: Username to check
            resource_type: Type of resource
            resource_id: ID of the resource
            operation: Operation to check

        Returns:
            PermissionResult: Permission check result with inheritance
        """
        try:
            # Get user and roles
            user = await self.auth_manager.get_user_by_username(username)
            if not user:
                return PermissionResult(granted=False, reason="User not found")

            user_roles = await self.auth_manager.get_user_roles(username)

            # Check each role for permissions
            for role_data in user_roles:
                role_id = role_data.get("role_id")
                if not role_id:
                    continue

                # Get all permissions for this role (including inherited)
                all_permissions = await self.get_inherited_permissions(role_id)

                # Check for permission overrides first
                overrides = (
                    await self.auth_manager.backend.get_permission_overrides_for_role(
                        role_id
                    )
                )

                for override in overrides:
                    if override["permission_id"] in [p["id"] for p in all_permissions]:
                        if override["override_type"] == "deny":
                            return PermissionResult(
                                granted=False, reason="Permission denied by override"
                            )
                        elif override["override_type"] == "grant":
                            return PermissionResult(
                                granted=True, reason="Permission granted by override"
                            )

                # Check regular permissions
                for permission in all_permissions:
                    if (
                        permission["resource_type"] == resource_type
                        and permission["operation"] == operation
                    ):

                        # Check if permission is overridden
                        override_found = False
                        for override in overrides:
                            if override["permission_id"] == permission["id"]:
                                override_found = True
                                if override["override_type"] == "deny":
                                    continue  # Skip this permission
                                elif override["override_type"] == "grant":
                                    return PermissionResult(
                                        granted=True,
                                        reason="Permission granted by override",
                                    )

                        if not override_found:
                            return PermissionResult(
                                granted=True, reason="Permission granted by role"
                            )

            return PermissionResult(
                granted=False, reason="No matching permissions found"
            )

        except Exception as e:
            logger.error(f"Failed to check permission with inheritance: {e}")
            return PermissionResult(
                granted=False, reason=f"Permission check failed: {e}"
            )
