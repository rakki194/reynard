"""🔐 ECS RBAC Service: Unified Access Control for ECS World Operations

This service provides RBAC integration for the ECS world, managing access control
for agents, groups, worlds, and simulation operations.

Key Features:
- Agent-level permissions and role management
- Group-based access control
- World-level permissions
- Simulation control permissions
- Social interaction permissions
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
from gatekeeper.core.auth_manager import AuthManager
from gatekeeper.models.rbac import (
    Operation,
    PermissionResult,
    PermissionScope,
    ResourceType,
)

from ..ecs.components.social import GroupType, SocialRole, SocialStatus
from ..ecs.core.entity import Entity
from .rbac.rbac_ecs_service import RBACECSService

logger = logging.getLogger("uvicorn")


class ECSRBACService:
    """ECS RBAC service for comprehensive access control."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}

        # RBAC configuration
        self.audit_enabled = self.config.get("audit_enabled", True)
        self.retention_days = self.config.get("retention_days", 365)
        self.cache_enabled = self.config.get("cache_enabled", True)
        self.cache_ttl = self.config.get("cache_ttl", 300)  # 5 minutes

        # RBAC components
        self.auth_manager: Optional[AuthManager] = None
        self.rbac_ecs_service: Optional[RBACECSService] = None
        self.audit_logs: List[Dict[str, Any]] = []
        self.permission_cache: Dict[str, Dict[str, Any]] = {}

        # Metrics
        self.metrics = {
            "access_checks": 0,
            "access_granted": 0,
            "access_denied": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "audit_events": 0,
            "rbac_errors": 0,
            "agent_operations": 0,
            "group_operations": 0,
            "world_operations": 0,
            "simulation_operations": 0,
        }

    async def initialize(self) -> bool:
        """Initialize the ECS RBAC service."""
        try:
            # Get AuthManager from service registry
            service_registry = get_service_registry()
            self.auth_manager = service_registry.get_service_instance("auth_manager")

            if not self.auth_manager:
                raise RuntimeError("AuthManager not found in service registry")

            # Initialize RBAC ECS service
            self.rbac_ecs_service = RBACECSService(self.config)
            await self.rbac_ecs_service.initialize()

            logger.info("ECS RBAC service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize ECS RBAC service: {e}")
            return False

    async def check_agent_permission(
        self, user_id: str, agent_id: str, operation: str, **kwargs
    ) -> bool:
        """Check if user has permission for agent operations."""
        try:
            self.metrics["access_checks"] += 1
            self.metrics["agent_operations"] += 1

            # Check cache first
            cache_key = self._get_cache_key(user_id, "agent", operation, agent_id)
            if self.cache_enabled and cache_key in self.permission_cache:
                cached_result = self.permission_cache[cache_key]
                if time.time() - cached_result["timestamp"] < self.cache_ttl:
                    self.metrics["cache_hits"] += 1
                    return cached_result["granted"]
                else:
                    del self.permission_cache[cache_key]

            self.metrics["cache_misses"] += 1

            # Map operation to RBAC operation
            rbac_operation = self._map_agent_operation_to_rbac(operation)
            if not rbac_operation:
                logger.warning(f"No RBAC mapping for agent operation: {operation}")
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
                    operation=f"agent_{operation}",
                    resource_type="ecs_agent",
                    resource_id=agent_id,
                    success=granted,
                    **kwargs,
                )

            if granted:
                self.metrics["access_granted"] += 1
            else:
                self.metrics["access_denied"] += 1

            return granted

        except Exception as e:
            logger.error(f"Agent permission check failed: {e}")
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

    async def check_simulation_permission(
        self, user_id: str, world_id: str, operation: str, **kwargs
    ) -> bool:
        """Check if user has permission for simulation operations."""
        try:
            self.metrics["access_checks"] += 1
            self.metrics["simulation_operations"] += 1

            # Check cache first
            cache_key = self._get_cache_key(user_id, "simulation", operation, world_id)
            if self.cache_enabled and cache_key in self.permission_cache:
                cached_result = self.permission_cache[cache_key]
                if time.time() - cached_result["timestamp"] < self.cache_ttl:
                    self.metrics["cache_hits"] += 1
                    return cached_result["granted"]
                else:
                    del self.permission_cache[cache_key]

            self.metrics["cache_misses"] += 1

            # Map operation to RBAC operation
            rbac_operation = self._map_simulation_operation_to_rbac(operation)
            if not rbac_operation:
                logger.warning(f"No RBAC mapping for simulation operation: {operation}")
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
                    operation=f"simulation_{operation}",
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
            logger.error(f"Simulation permission check failed: {e}")
            self.metrics["rbac_errors"] += 1
            self.metrics["access_denied"] += 1
            return False

    async def assign_agent_role(
        self,
        user_id: str,
        agent_id: str,
        role_name: str,
        context: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> bool:
        """Assign a role to an agent."""
        try:
            # Create context for the role assignment
            assignment_context = {
                "type": "ecs_agent",
                "agent_id": agent_id,
                "role": role_name,
            }
            if context:
                assignment_context.update(context)

            # Assign role using RBAC system
            success = await self.auth_manager.assign_role_to_user(
                user_id=user_id,
                role_id=role_name,
                context_type="ecs_agent",
                context_id=agent_id,
                metadata=assignment_context,
            )

            if success:
                logger.info(f"Assigned role {role_name} to agent {agent_id}")

                # Log audit event
                if self.audit_enabled:
                    await self._log_audit_event(
                        user_id=user_id,
                        operation="assign_agent_role",
                        resource_type="ecs_agent",
                        resource_id=agent_id,
                        success=True,
                        role_name=role_name,
                        **kwargs,
                    )

            return success

        except Exception as e:
            logger.error(f"Failed to assign agent role: {e}")
            return False

    async def get_agent_roles(self, user_id: str, agent_id: str, **kwargs) -> List[str]:
        """Get all roles assigned to an agent."""
        try:
            # Get user roles with ECS agent context
            user_roles = await self.auth_manager.get_user_roles(
                username=user_id, context_type="ecs_agent", context_id=agent_id
            )

            return user_roles

        except Exception as e:
            logger.error(f"Failed to get agent roles: {e}")
            return []

    def _map_agent_operation_to_rbac(self, operation: str) -> Optional[Operation]:
        """Map agent operation to RBAC operation."""
        mapping = {
            "create": Operation.CREATE,
            "view": Operation.READ,
            "update": Operation.UPDATE,
            "delete": Operation.DELETE,
            "manage": Operation.MANAGE,
            "interact": Operation.READ,
            "control": Operation.EXECUTE,
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
            "access": Operation.READ,
        }
        return mapping.get(operation)

    def _map_simulation_operation_to_rbac(self, operation: str) -> Optional[Operation]:
        """Map simulation operation to RBAC operation."""
        mapping = {
            "control": Operation.EXECUTE,
            "accelerate_time": Operation.EXECUTE,
            "pause": Operation.EXECUTE,
            "resume": Operation.EXECUTE,
            "reset": Operation.EXECUTE,
            "configure": Operation.UPDATE,
        }
        return mapping.get(operation)

    def _get_cache_key(
        self, user_id: str, operation_type: str, operation: str, resource_id: str
    ) -> str:
        """Generate cache key for permission check."""
        return f"{user_id}:{operation_type}:{operation}:{resource_id}"

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
        return f"ecs_rbac_log_{int(time.time() * 1000)}_{hash(str(time.time())) % 10000:04d}"

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
            "service": "ecs_rbac",
            "metrics": self.metrics,
            "cache_size": len(self.permission_cache),
            "audit_logs_count": len(self.audit_logs),
            "rbac_connected": self.auth_manager is not None,
            "rbac_ecs_service_available": self.rbac_ecs_service is not None,
        }
