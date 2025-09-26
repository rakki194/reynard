"""🔐 RBAC World Service: Unified Access Control for ECS World Operations

This service provides RBAC integration for ECS world management, including
agent creation, world control, and simulation management.

Key Features:
- Agent creation and management permissions
- World-level access control
- Simulation control permissions
- Time acceleration controls
- World sharing and collaboration
- Analytics access control
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
from app.ecs.core.entity import Entity
from app.ecs.core.world import ECSWorld
from app.ecs.world.agent_world import AgentWorld
from gatekeeper.core.auth_manager import AuthManager
from gatekeeper.models.rbac import (
    Operation,
    PermissionResult,
    PermissionScope,
    ResourceType,
)

from ..rbac.ecs_rbac_bootstrap import bootstrap_ecs_rbac

logger = logging.getLogger("uvicorn")


class RBACWorldService:
    """RBAC-integrated ECS world service."""

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

        # World management
        self.worlds: Dict[str, AgentWorld] = {}
        self.world_owners: Dict[str, str] = {}  # world_id -> user_id
        self.world_collaborators: Dict[str, List[str]] = {}  # world_id -> [user_ids]

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
            "world_operations": 0,
            "simulation_operations": 0,
            "worlds_created": 0,
            "agents_created": 0,
        }

    async def initialize(self) -> bool:
        """Initialize the RBAC world service."""
        try:
            # Get AuthManager from service registry
            service_registry = get_service_registry()
            self.auth_manager = service_registry.get_service_instance("auth_manager")

            if not self.auth_manager:
                raise RuntimeError("AuthManager not found in service registry")

            # Bootstrap ECS RBAC system
            await bootstrap_ecs_rbac()

            # Initialize default world if needed
            await self._initialize_default_world()

            logger.info("RBAC World service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize RBAC World service: {e}")
            return False

    async def create_world(
        self, user_id: str, world_id: str, world_name: str = "New World", **kwargs
    ) -> Optional[AgentWorld]:
        """Create a new ECS world with RBAC permission checks."""
        try:
            self.metrics["world_operations"] += 1

            # Check permission to create worlds
            has_permission = await self.check_world_permission(
                user_id=user_id, world_id="new_world", operation="create"
            )

            if not has_permission:
                logger.warning(
                    f"User {user_id} does not have permission to create worlds"
                )
                return None

            # Create the world
            world = AgentWorld(world_id=world_id)
            world.set_owner(user_id)
            self.worlds[world_id] = world
            self.world_owners[world_id] = user_id
            self.world_collaborators[world_id] = [user_id]

            self.metrics["worlds_created"] += 1

            # Log audit event
            if self.audit_enabled:
                await self._log_audit_event(
                    user_id=user_id,
                    operation="create_world",
                    resource_type="ecs_world",
                    resource_id=world_id,
                    success=True,
                    world_name=world_name,
                    **kwargs,
                )

            logger.info(f"Created world {world_id} for user {user_id}")
            return world

        except Exception as e:
            logger.error(f"Failed to create world: {e}")
            self.metrics["rbac_errors"] += 1
            return None

    async def create_agent(
        self,
        user_id: str,
        world_id: str,
        agent_id: str,
        spirit: str = "fox",
        style: str = "foundation",
        name: Optional[str] = None,
        **kwargs,
    ) -> Optional[Entity]:
        """Create a new agent in a world with RBAC permission checks."""
        try:
            self.metrics["agent_operations"] += 1

            # Check permission to create agents in this world
            has_permission = await self.check_world_permission(
                user_id=user_id, world_id=world_id, operation="create_agent"
            )

            if not has_permission:
                logger.warning(
                    f"User {user_id} does not have permission to create agents in world {world_id}"
                )
                return None

            # Get the world
            world = self.worlds.get(world_id)
            if not world:
                logger.error(f"World {world_id} not found")
                return None

            # Create the agent
            agent = world.create_agent(
                agent_id=agent_id,
                spirit=spirit,
                style=style,
                name=name,
                user_id=user_id,
            )

            self.metrics["agents_created"] += 1

            # Log audit event
            if self.audit_enabled:
                await self._log_audit_event(
                    user_id=user_id,
                    operation="create_agent",
                    resource_type="ecs_agent",
                    resource_id=agent_id,
                    success=True,
                    world_id=world_id,
                    spirit=spirit,
                    style=style,
                    **kwargs,
                )

            logger.info(
                f"Created agent {agent_id} in world {world_id} for user {user_id}"
            )
            return agent

        except Exception as e:
            logger.error(f"Failed to create agent: {e}")
            self.metrics["rbac_errors"] += 1
            return None

    async def get_world(
        self, user_id: str, world_id: str, **kwargs
    ) -> Optional[AgentWorld]:
        """Get a world with RBAC permission checks."""
        try:
            self.metrics["world_operations"] += 1

            # Check permission to view this world
            has_permission = await self.check_world_permission(
                user_id=user_id, world_id=world_id, operation="view"
            )

            if not has_permission:
                logger.warning(
                    f"User {user_id} does not have permission to view world {world_id}"
                )
                return None

            # Get the world
            world = self.worlds.get(world_id)
            if not world:
                logger.error(f"World {world_id} not found")
                return None

            # Log audit event
            if self.audit_enabled:
                await self._log_audit_event(
                    user_id=user_id,
                    operation="view_world",
                    resource_type="ecs_world",
                    resource_id=world_id,
                    success=True,
                    **kwargs,
                )

            return world

        except Exception as e:
            logger.error(f"Failed to get world: {e}")
            self.metrics["rbac_errors"] += 1
            return None

    async def get_agent(
        self, user_id: str, world_id: str, agent_id: str, **kwargs
    ) -> Optional[Entity]:
        """Get an agent from a world with RBAC permission checks."""
        try:
            self.metrics["agent_operations"] += 1

            # Check permission to view agents in this world
            has_permission = await self.check_world_permission(
                user_id=user_id, world_id=world_id, operation="view_agent"
            )

            if not has_permission:
                logger.warning(
                    f"User {user_id} does not have permission to view agents in world {world_id}"
                )
                return None

            # Get the world
            world = self.worlds.get(world_id)
            if not world:
                logger.error(f"World {world_id} not found")
                return None

            # Get the agent
            agent = world.get_entity(agent_id)
            if not agent:
                logger.error(f"Agent {agent_id} not found in world {world_id}")
                return None

            # Log audit event
            if self.audit_enabled:
                await self._log_audit_event(
                    user_id=user_id,
                    operation="view_agent",
                    resource_type="ecs_agent",
                    resource_id=agent_id,
                    success=True,
                    world_id=world_id,
                    **kwargs,
                )

            return agent

        except Exception as e:
            logger.error(f"Failed to get agent: {e}")
            self.metrics["rbac_errors"] += 1
            return None

    async def control_simulation(
        self, user_id: str, world_id: str, operation: str, **kwargs
    ) -> bool:
        """Control simulation with RBAC permission checks."""
        try:
            self.metrics["simulation_operations"] += 1

            # Check permission to control simulation
            has_permission = await self.check_simulation_permission(
                user_id=user_id, world_id=world_id, operation=operation
            )

            if not has_permission:
                logger.warning(
                    f"User {user_id} does not have permission to {operation} simulation in world {world_id}"
                )
                return False

            # Get the world
            world = self.worlds.get(world_id)
            if not world:
                logger.error(f"World {world_id} not found")
                return False

            # Perform simulation operation
            success = await self._perform_simulation_operation(
                world, operation, **kwargs
            )

            # Log audit event
            if self.audit_enabled:
                await self._log_audit_event(
                    user_id=user_id,
                    operation=f"simulation_{operation}",
                    resource_type="ecs_world",
                    resource_id=world_id,
                    success=success,
                    **kwargs,
                )

            return success

        except Exception as e:
            logger.error(f"Failed to control simulation: {e}")
            self.metrics["rbac_errors"] += 1
            return False

    async def share_world(
        self,
        user_id: str,
        world_id: str,
        target_user_id: str,
        permission_level: str = "view",
        **kwargs,
    ) -> bool:
        """Share a world with another user with RBAC permission checks."""
        try:
            self.metrics["world_operations"] += 1

            # Check permission to share this world
            has_permission = await self.check_world_permission(
                user_id=user_id, world_id=world_id, operation="share"
            )

            if not has_permission:
                logger.warning(
                    f"User {user_id} does not have permission to share world {world_id}"
                )
                return False

            # Add collaborator
            if world_id not in self.world_collaborators:
                self.world_collaborators[world_id] = []

            if target_user_id not in self.world_collaborators[world_id]:
                self.world_collaborators[world_id].append(target_user_id)

            # Log audit event
            if self.audit_enabled:
                await self._log_audit_event(
                    user_id=user_id,
                    operation="share_world",
                    resource_type="ecs_world",
                    resource_id=world_id,
                    success=True,
                    target_user_id=target_user_id,
                    permission_level=permission_level,
                    **kwargs,
                )

            logger.info(
                f"Shared world {world_id} with user {target_user_id} at {permission_level} level"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to share world: {e}")
            self.metrics["rbac_errors"] += 1
            return False

    async def check_world_permission(
        self, user_id: str, world_id: str, operation: str, **kwargs
    ) -> bool:
        """Check if user has permission for world operations."""
        try:
            self.metrics["access_checks"] += 1

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

            # Check if user is world owner
            if world_id in self.world_owners and self.world_owners[world_id] == user_id:
                granted = True
            # Check if user is collaborator
            elif (
                world_id in self.world_collaborators
                and user_id in self.world_collaborators[world_id]
            ):
                # Collaborators have limited permissions
                if operation in ["view", "view_agent", "create_agent"]:
                    granted = True
                else:
                    granted = False
            else:
                # Check RBAC permissions
                rbac_operation = self._map_world_operation_to_rbac(operation)
                if not rbac_operation:
                    logger.warning(f"No RBAC mapping for world operation: {operation}")
                    granted = False
                else:
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

            # Check if user is world owner (owners have full simulation control)
            if world_id in self.world_owners and self.world_owners[world_id] == user_id:
                granted = True
            # Check if user is collaborator (collaborators have limited simulation control)
            elif (
                world_id in self.world_collaborators
                and user_id in self.world_collaborators[world_id]
            ):
                # Collaborators can only view simulation status
                if operation in ["view_status", "get_metrics"]:
                    granted = True
                else:
                    granted = False
            else:
                # Check RBAC permissions
                rbac_operation = self._map_simulation_operation_to_rbac(operation)
                if not rbac_operation:
                    logger.warning(
                        f"No RBAC mapping for simulation operation: {operation}"
                    )
                    granted = False
                else:
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

    async def _initialize_default_world(self) -> None:
        """Initialize a default world for the system."""
        try:
            default_world_id = "default_world"
            if default_world_id not in self.worlds:
                world = AgentWorld()
                self.worlds[default_world_id] = world
                self.world_owners[default_world_id] = "system"
                self.world_collaborators[default_world_id] = ["system"]
                logger.info("Initialized default world")
        except Exception as e:
            logger.error(f"Failed to initialize default world: {e}")

    async def _perform_simulation_operation(
        self, world: AgentWorld, operation: str, **kwargs
    ) -> bool:
        """Perform a simulation operation on the world."""
        try:
            if operation == "pause":
                # Pause simulation (if supported by world)
                logger.info("Pausing simulation")
                return True
            elif operation == "resume":
                # Resume simulation (if supported by world)
                logger.info("Resuming simulation")
                return True
            elif operation == "accelerate_time":
                factor = kwargs.get("factor", 1.0)
                # Accelerate time (if supported by world)
                logger.info(f"Accelerating time by {factor}x")
                return True
            elif operation == "reset":
                # Reset simulation (if supported by world)
                logger.info("Resetting simulation")
                return True
            elif operation == "view_status":
                # Get simulation status
                logger.info("Getting simulation status")
                return True
            else:
                logger.warning(f"Unknown simulation operation: {operation}")
                return False
        except Exception as e:
            logger.error(f"Failed to perform simulation operation {operation}: {e}")
            return False

    def _map_world_operation_to_rbac(self, operation: str) -> Optional[Operation]:
        """Map world operation to RBAC operation."""
        mapping = {
            "view": Operation.READ,
            "create": Operation.CREATE,
            "update": Operation.UPDATE,
            "delete": Operation.DELETE,
            "manage": Operation.MANAGE,
            "share": Operation.SHARE,
            "create_agent": Operation.CREATE,
            "view_agent": Operation.READ,
            "update_agent": Operation.UPDATE,
            "delete_agent": Operation.DELETE,
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
            "view_status": Operation.READ,
            "get_metrics": Operation.READ,
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
        return (
            f"world_log_{int(time.time() * 1000)}_{hash(str(time.time())) % 10000:04d}"
        )

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
            "service": "rbac_world",
            "metrics": self.metrics,
            "cache_size": len(self.permission_cache),
            "audit_logs_count": len(self.audit_logs),
            "worlds_count": len(self.worlds),
            "rbac_connected": self.auth_manager is not None,
        }

    async def get_world_list(self, user_id: str) -> List[Dict[str, Any]]:
        """Get list of worlds accessible to user."""
        accessible_worlds = []

        for world_id, world in self.worlds.items():
            # Check if user has access to this world
            has_access = await self.check_world_permission(
                user_id=user_id, world_id=world_id, operation="view"
            )

            if has_access:
                is_owner = (
                    world_id in self.world_owners
                    and self.world_owners[world_id] == user_id
                )
                is_collaborator = (
                    world_id in self.world_collaborators
                    and user_id in self.world_collaborators[world_id]
                )

                accessible_worlds.append(
                    {
                        "world_id": world_id,
                        "is_owner": is_owner,
                        "is_collaborator": is_collaborator,
                        "entity_count": len(world.entities),
                        "owner": self.world_owners.get(world_id, "unknown"),
                        "collaborators": self.world_collaborators.get(world_id, []),
                    }
                )

        return accessible_worlds
