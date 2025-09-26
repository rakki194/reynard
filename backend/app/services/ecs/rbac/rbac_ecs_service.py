"""🔐 RBAC ECS Service: Unified Access Control for ECS Operations

This service provides RBAC integration for the ECS (Entity Component System) world,
replacing isolated social role management with a unified approach that integrates
with the Gatekeeper RBAC system.

Key Features:
- Integration with unified RBAC system
- Social role to RBAC role mapping
- Group-based permissions and access control
- World-level and simulation-level permissions
- Agent interaction permissions
- Unified audit logging
- Performance optimization with caching

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from app.core.service_registry import get_service_registry
from app.ecs.components.social import GroupType, SocialRole, SocialStatus
from app.ecs.core.entity import Entity
from gatekeeper.core.auth_manager import AuthManager
from gatekeeper.models.rbac import (
    Operation,
    PermissionResult,
    PermissionScope,
    ResourceType,
)

logger = logging.getLogger("uvicorn")


class RBACECSService:
    """RBAC-integrated ECS security service."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}

        # RBAC configuration
        self.audit_enabled = self.config.get("audit_enabled", True)
        self.retention_days = self.config.get("retention_days", 365)
        self.cache_enabled = self.config.get("cache_enabled", True)
        self.cache_ttl = self.config.get("cache_ttl", 300)  # 5 minutes

        # RBAC components
        self.auth_manager: Optional[AuthManager] = None
        self.audit_logs: List[Dict[str, Any]] = []
        self.permission_cache: Dict[str, Dict[str, Any]] = {}

        # Social role to RBAC role mapping
        self.social_role_mapping = {
            SocialRole.LEADER: "ecs_social_leader",
            SocialRole.FOLLOWER: "ecs_social_follower",
            SocialRole.MEDIATOR: "ecs_social_mediator",
            SocialRole.OUTCAST: "ecs_social_outcast",
            SocialRole.NEUTRAL: "ecs_social_neutral",
            SocialRole.INFLUENCER: "ecs_social_influencer",
            SocialRole.MENTOR: "ecs_social_mentor",
            SocialRole.STUDENT: "ecs_social_student",
        }

        # Group type to RBAC role mapping
        self.group_type_mapping = {
            GroupType.WORK: "ecs_group_work",
            GroupType.SOCIAL: "ecs_group_social",
            GroupType.INTEREST: "ecs_group_interest",
            GroupType.FAMILY: "ecs_group_family",
            GroupType.COMMUNITY: "ecs_group_community",
        }

        # Social status to RBAC role mapping
        self.social_status_mapping = {
            SocialStatus.ACCEPTED: "ecs_status_accepted",
            SocialStatus.ISOLATED: "ecs_status_isolated",
            SocialStatus.CONTROVERSIAL: "ecs_status_controversial",
            SocialStatus.INFLUENTIAL: "ecs_status_influential",
            SocialStatus.LEADER: "ecs_status_leader",
        }

        # Metrics
        self.metrics = {
            "access_checks": 0,
            "access_granted": 0,
            "access_denied": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "audit_events": 0,
            "rbac_errors": 0,
            "social_interactions": 0,
            "group_operations": 0,
            "world_operations": 0,
        }

    async def initialize(self) -> bool:
        """Initialize the RBAC ECS service."""
        try:
            # Get AuthManager from service registry
            service_registry = get_service_registry()
            self.auth_manager = service_registry.get_service_instance("auth_manager")

            if not self.auth_manager:
                raise RuntimeError("AuthManager not found in service registry")

            # Initialize RBAC permissions for ECS operations
            await self._initialize_ecs_permissions()

            logger.info("RBAC ECS service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize RBAC ECS service: {e}")
            return False

    async def check_social_permission(
        self,
        user_id: str,
        agent_id: str,
        operation: str,
        target_agent_id: Optional[str] = None,
        group_id: Optional[str] = None,
        **kwargs,
    ) -> bool:
        """Check if user has permission for social operations."""
        try:
            self.metrics["access_checks"] += 1
            self.metrics["social_interactions"] += 1

            # Check cache first
            cache_key = self._get_cache_key(
                user_id, "social", operation, agent_id, target_agent_id, group_id
            )
            if self.cache_enabled and cache_key in self.permission_cache:
                cached_result = self.permission_cache[cache_key]
                if time.time() - cached_result["timestamp"] < self.cache_ttl:
                    self.metrics["cache_hits"] += 1
                    return cached_result["granted"]
                else:
                    del self.permission_cache[cache_key]

            self.metrics["cache_misses"] += 1

            # Map operation to RBAC operation
            rbac_operation = self._map_social_operation_to_rbac(operation)
            if not rbac_operation:
                logger.warning(f"No RBAC mapping for social operation: {operation}")
                self.metrics["access_denied"] += 1
                return False

            # Check permission using RBAC system
            permission_result = await self.auth_manager.check_permission(
                username=user_id,
                resource_type=ResourceType.ECS_WORLD,
                resource_id=agent_id,
                operation=rbac_operation.value,
            )

            granted = permission_result.granted if permission_result else False

            # Cache the result
            if self.cache_enabled:
                self.permission_cache[cache_key] = {
                    "granted": granted,
                    "timestamp": time.time(),
                }

            # Log audit event
            if self.audit_enabled:
                await self._log_audit_event(
                    user_id=user_id,
                    operation=f"social_{operation}",
                    resource_type="ecs_agent",
                    resource_id=agent_id,
                    success=granted,
                    target_agent_id=target_agent_id,
                    group_id=group_id,
                    **kwargs,
                )

            if granted:
                self.metrics["access_granted"] += 1
            else:
                self.metrics["access_denied"] += 1

            return granted

        except Exception as e:
            logger.error(f"Social permission check failed: {e}")
            self.metrics["rbac_errors"] += 1
            self.metrics["access_denied"] += 1
            return False

    async def check_group_permission(
        self,
        user_id: str,
        group_id: str,
        operation: str,
        agent_id: Optional[str] = None,
        **kwargs,
    ) -> bool:
        """Check if user has permission for group operations."""
        try:
            self.metrics["access_checks"] += 1
            self.metrics["group_operations"] += 1

            # Check cache first
            cache_key = self._get_cache_key(
                user_id, "group", operation, group_id, agent_id
            )
            if self.cache_enabled and cache_key in self.permission_cache:
                cached_result = self.permission_cache[cache_key]
                if time.time() - cached_result["timestamp"] < self.cache_ttl:
                    self.metrics["cache_hits"] += 1
                    return cached_result["granted"]
                else:
                    del self.permission_cache[cache_key]

            self.metrics["cache_misses"] += 1

            # Map operation to RBAC operation
            rbac_operation = self._map_group_operation_to_rbac(operation)
            if not rbac_operation:
                logger.warning(f"No RBAC mapping for group operation: {operation}")
                self.metrics["access_denied"] += 1
                return False

            # Check permission using RBAC system
            permission_result = await self.auth_manager.check_permission(
                username=user_id,
                resource_type=ResourceType.ECS_WORLD,
                resource_id=group_id,
                operation=rbac_operation.value,
            )

            granted = permission_result.granted if permission_result else False

            # Cache the result
            if self.cache_enabled:
                self.permission_cache[cache_key] = {
                    "granted": granted,
                    "timestamp": time.time(),
                }

            # Log audit event
            if self.audit_enabled:
                await self._log_audit_event(
                    user_id=user_id,
                    operation=f"group_{operation}",
                    resource_type="ecs_group",
                    resource_id=group_id,
                    success=granted,
                    agent_id=agent_id,
                    **kwargs,
                )

            if granted:
                self.metrics["access_granted"] += 1
            else:
                self.metrics["access_denied"] += 1

            return granted

        except Exception as e:
            logger.error(f"Group permission check failed: {e}")
            self.metrics["rbac_errors"] += 1
            self.metrics["access_denied"] += 1
            return False

    async def check_world_permission(
        self, user_id: str, world_id: str, operation: str, **kwargs
    ) -> bool:
        """Check if user has permission for world operations."""
        try:
            self.metrics["access_checks"] += 1
            self.metrics["world_operations"] += 1

            # Check cache first
            cache_key = self._get_cache_key(user_id, "world", operation, world_id)
            if self.cache_enabled and cache_key in self.permission_cache:
                cached_result = self.permission_cache[cache_key]
                if time.time() - cached_result["timestamp"] < self.cache_ttl:
                    self.metrics["cache_hits"] += 1
                    return cached_result["granted"]
                else:
                    del self.permission_cache[cache_key]

            self.metrics["cache_misses"] += 1

            # Map operation to RBAC operation
            rbac_operation = self._map_world_operation_to_rbac(operation)
            if not rbac_operation:
                logger.warning(f"No RBAC mapping for world operation: {operation}")
                self.metrics["access_denied"] += 1
                return False

            # Check permission using RBAC system
            permission_result = await self.auth_manager.check_permission(
                username=user_id,
                resource_type=ResourceType.ECS_WORLD,
                resource_id=world_id,
                operation=rbac_operation.value,
            )

            granted = permission_result.granted if permission_result else False

            # Cache the result
            if self.cache_enabled:
                self.permission_cache[cache_key] = {
                    "granted": granted,
                    "timestamp": time.time(),
                }

            # Log audit event
            if self.audit_enabled:
                await self._log_audit_event(
                    user_id=user_id,
                    operation=f"world_{operation}",
                    resource_type="ecs_world",
                    resource_id=world_id,
                    success=granted,
                    **kwargs,
                )

            if granted:
                self.metrics["access_granted"] += 1
            else:
                self.metrics["access_denied"] += 1

            return granted

        except Exception as e:
            logger.error(f"World permission check failed: {e}")
            self.metrics["rbac_errors"] += 1
            self.metrics["access_denied"] += 1
            return False

    async def assign_social_role(
        self,
        user_id: str,
        agent_id: str,
        social_role: SocialRole,
        group_id: Optional[str] = None,
        **kwargs,
    ) -> bool:
        """Assign a social role to an agent using RBAC."""
        try:
            # Get the corresponding RBAC role
            rbac_role = self.social_role_mapping.get(social_role)
            if not rbac_role:
                logger.warning(f"No RBAC mapping for social role: {social_role}")
                return False

            # Create context for the role assignment
            context = {
                "type": "ecs_social",
                "agent_id": agent_id,
                "social_role": social_role.value,
            }
            if group_id:
                context["group_id"] = group_id

            # Assign role using RBAC system
            success = await self.auth_manager.assign_role_to_user(
                user_id=user_id,
                role_id=rbac_role,
                context_type="ecs_social",
                context_id=agent_id,
                metadata=context,
            )

            if success:
                logger.info(
                    f"Assigned social role {social_role.value} to agent {agent_id}"
                )

                # Log audit event
                if self.audit_enabled:
                    await self._log_audit_event(
                        user_id=user_id,
                        operation="assign_social_role",
                        resource_type="ecs_agent",
                        resource_id=agent_id,
                        success=True,
                        social_role=social_role.value,
                        group_id=group_id,
                        **kwargs,
                    )

            return success

        except Exception as e:
            logger.error(f"Failed to assign social role: {e}")
            return False

    async def get_agent_social_roles(
        self, user_id: str, agent_id: str, **kwargs
    ) -> List[str]:
        """Get all social roles assigned to an agent."""
        try:
            # Get user roles with ECS social context
            user_roles = await self.auth_manager.get_user_roles(
                username=user_id, context_type="ecs_social", context_id=agent_id
            )

            # Filter for social roles
            social_roles = []
            for role in user_roles:
                if role.startswith("ecs_social_"):
                    # Map back to social role
                    for social_role, rbac_role in self.social_role_mapping.items():
                        if rbac_role == role:
                            social_roles.append(social_role.value)
                            break

            return social_roles

        except Exception as e:
            logger.error(f"Failed to get agent social roles: {e}")
            return []

    async def _initialize_ecs_permissions(self) -> None:
        """Initialize RBAC permissions for ECS operations."""
        try:
            logger.info("Initializing RBAC permissions for ECS operations")

            # This would typically create default permissions in the RBAC system
            # For now, we'll just log that we're initializing
            logger.info("ECS RBAC permissions initialized")

        except Exception as e:
            logger.error(f"Failed to initialize ECS permissions: {e}")
            raise

    def _map_social_operation_to_rbac(self, operation: str) -> Optional[Operation]:
        """Map social operation to RBAC operation."""
        mapping = {
            "interact": Operation.READ,
            "connect": Operation.CREATE,
            "disconnect": Operation.DELETE,
            "influence": Operation.UPDATE,
            "lead": Operation.MANAGE,
            "follow": Operation.READ,
            "mediate": Operation.UPDATE,
            "mentor": Operation.UPDATE,
            "learn": Operation.READ,
        }
        return mapping.get(operation)

    def _map_group_operation_to_rbac(self, operation: str) -> Optional[Operation]:
        """Map group operation to RBAC operation."""
        mapping = {
            "join": Operation.CREATE,
            "leave": Operation.DELETE,
            "create": Operation.CREATE,
            "delete": Operation.DELETE,
            "manage": Operation.MANAGE,
            "view": Operation.READ,
            "update": Operation.UPDATE,
            "invite": Operation.CREATE,
            "kick": Operation.DELETE,
        }
        return mapping.get(operation)

    def _map_world_operation_to_rbac(self, operation: str) -> Optional[Operation]:
        """Map world operation to RBAC operation."""
        mapping = {
            "view": Operation.READ,
            "create": Operation.CREATE,
            "update": Operation.UPDATE,
            "delete": Operation.DELETE,
            "manage": Operation.MANAGE,
            "simulate": Operation.EXECUTE,
            "accelerate_time": Operation.EXECUTE,
            "pause": Operation.EXECUTE,
            "resume": Operation.EXECUTE,
        }
        return mapping.get(operation)

    def _get_cache_key(
        self,
        user_id: str,
        operation_type: str,
        operation: str,
        resource_id: str,
        target_id: Optional[str] = None,
        context_id: Optional[str] = None,
    ) -> str:
        """Generate cache key for permission check."""
        key_parts = [user_id, operation_type, operation, resource_id]
        if target_id:
            key_parts.append(target_id)
        if context_id:
            key_parts.append(context_id)
        return ":".join(key_parts)

    async def _log_audit_event(
        self,
        user_id: str,
        operation: str,
        resource_type: str,
        resource_id: str,
        success: bool,
        **kwargs,
    ) -> None:
        """Log an audit event."""
        if not self.audit_enabled:
            return

        try:
            self.metrics["audit_events"] += 1

            audit_log = {
                "log_id": self._generate_log_id(),
                "user_id": user_id,
                "operation": operation,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "timestamp": datetime.now().isoformat(),
                "success": success,
                "details": kwargs,
            }

            self.audit_logs.append(audit_log)

            # Clean up old audit logs
            await self._cleanup_old_audit_logs()

        except Exception as e:
            logger.error(f"Failed to log audit event: {e}")

    def _generate_log_id(self) -> str:
        """Generate unique log ID."""
        return f"ecs_log_{int(time.time() * 1000)}_{hash(str(time.time())) % 10000:04d}"

    async def _cleanup_old_audit_logs(self) -> None:
        """Clean up old audit logs based on retention policies."""
        cutoff_date = datetime.now() - timedelta(days=self.retention_days)
        self.audit_logs = [
            log
            for log in self.audit_logs
            if datetime.fromisoformat(log["timestamp"]) > cutoff_date
        ]

    async def get_metrics(self) -> Dict[str, Any]:
        """Get service metrics."""
        return {
            "service": "rbac_ecs",
            "metrics": self.metrics,
            "cache_size": len(self.permission_cache),
            "audit_logs_count": len(self.audit_logs),
            "rbac_connected": self.auth_manager is not None,
        }
