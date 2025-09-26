"""🔐 ECS RBAC Bootstrap Service

This service automatically sets up all ECS RBAC roles and permissions
when the system starts up, ensuring the ECS system is fully integrated
with the unified RBAC system from the beginning.

Key Features:
- Automatic role and permission creation
- Default user assignments
- System integration
- No migration required - everything is set up fresh

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from typing import Any, Dict, List, Optional

from app.core.service_registry import get_service_registry
from gatekeeper.core.auth_manager import AuthManager
from gatekeeper.models.rbac import (
    Operation,
    PermissionCreate,
    PermissionScope,
    ResourceType,
    RoleCreate,
    UserRoleAssignment,
)

logger = logging.getLogger(__name__)


class ECSRBACBootstrap:
    """Bootstrap service for ECS RBAC integration."""

    def __init__(self):
        self.auth_manager: Optional[AuthManager] = None
        self.bootstrap_stats = {
            "roles_created": 0,
            "permissions_created": 0,
            "user_assignments": 0,
            "errors": 0,
        }

    async def initialize(self) -> bool:
        """Initialize the bootstrap service."""
        try:
            service_registry = get_service_registry()
            self.auth_manager = service_registry.get_service_instance("auth_manager")

            if not self.auth_manager:
                logger.error("AuthManager not found in service registry")
                return False

            logger.info("ECS RBAC bootstrap service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize ECS RBAC bootstrap service: {e}")
            return False

    async def bootstrap_ecs_rbac(self) -> bool:
        """Bootstrap the complete ECS RBAC system."""
        try:
            logger.info("🚀 Starting ECS RBAC bootstrap...")

            # Step 1: Create ECS roles
            await self._create_ecs_roles()

            # Step 2: Create ECS permissions
            await self._create_ecs_permissions()

            # Step 3: Assign permissions to roles
            await self._assign_permissions_to_roles()

            # Step 4: Create default user assignments
            await self._create_default_user_assignments()

            logger.info("✅ ECS RBAC bootstrap completed successfully")
            self._log_bootstrap_stats()
            return True

        except Exception as e:
            logger.error(f"❌ ECS RBAC bootstrap failed: {e}")
            self.bootstrap_stats["errors"] += 1
            return False

    async def _create_ecs_roles(self) -> None:
        """Create all ECS-specific roles."""
        logger.info("Creating ECS roles...")

        ecs_roles = [
            # Social system roles
            RoleCreate(
                name="ecs_social_leader",
                description="ECS Social Leader - can lead social groups",
                level=50,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "leader"},
            ),
            RoleCreate(
                name="ecs_social_follower",
                description="ECS Social Follower - can follow in social groups",
                level=30,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "follower"},
            ),
            RoleCreate(
                name="ecs_social_mediator",
                description="ECS Social Mediator - can mediate social conflicts",
                level=40,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "mediator"},
            ),
            RoleCreate(
                name="ecs_social_outcast",
                description="ECS Social Outcast - limited social interactions",
                level=10,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "outcast"},
            ),
            RoleCreate(
                name="ecs_social_neutral",
                description="ECS Social Neutral - neutral social status",
                level=20,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "neutral"},
            ),
            RoleCreate(
                name="ecs_social_influencer",
                description="ECS Social Influencer - can influence others",
                level=45,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "influencer"},
            ),
            RoleCreate(
                name="ecs_social_mentor",
                description="ECS Social Mentor - can mentor others",
                level=35,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "mentor"},
            ),
            RoleCreate(
                name="ecs_social_student",
                description="ECS Social Student - can be mentored",
                level=25,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "student"},
            ),
            # Group type roles
            RoleCreate(
                name="ecs_group_work",
                description="ECS Work Group Member",
                level=30,
                is_system_role=True,
                metadata={"system": "ecs", "type": "group", "group_type": "work"},
            ),
            RoleCreate(
                name="ecs_group_social",
                description="ECS Social Group Member",
                level=25,
                is_system_role=True,
                metadata={"system": "ecs", "type": "group", "group_type": "social"},
            ),
            RoleCreate(
                name="ecs_group_interest",
                description="ECS Interest Group Member",
                level=25,
                is_system_role=True,
                metadata={"system": "ecs", "type": "group", "group_type": "interest"},
            ),
            RoleCreate(
                name="ecs_group_family",
                description="ECS Family Group Member",
                level=35,
                is_system_role=True,
                metadata={"system": "ecs", "type": "group", "group_type": "family"},
            ),
            RoleCreate(
                name="ecs_group_community",
                description="ECS Community Group Member",
                level=30,
                is_system_role=True,
                metadata={"system": "ecs", "type": "group", "group_type": "community"},
            ),
            # Social status roles
            RoleCreate(
                name="ecs_status_accepted",
                description="ECS Agent with Accepted Social Status",
                level=30,
                is_system_role=True,
                metadata={"system": "ecs", "type": "status", "status": "accepted"},
            ),
            RoleCreate(
                name="ecs_status_isolated",
                description="ECS Agent with Isolated Social Status",
                level=15,
                is_system_role=True,
                metadata={"system": "ecs", "type": "status", "status": "isolated"},
            ),
            RoleCreate(
                name="ecs_status_controversial",
                description="ECS Agent with Controversial Social Status",
                level=20,
                is_system_role=True,
                metadata={"system": "ecs", "type": "status", "status": "controversial"},
            ),
            RoleCreate(
                name="ecs_status_influential",
                description="ECS Agent with Influential Social Status",
                level=45,
                is_system_role=True,
                metadata={"system": "ecs", "type": "status", "status": "influential"},
            ),
            RoleCreate(
                name="ecs_status_leader",
                description="ECS Agent with Leader Social Status",
                level=50,
                is_system_role=True,
                metadata={"system": "ecs", "type": "status", "status": "leader"},
            ),
            # World management roles
            RoleCreate(
                name="ecs_world_creator",
                description="ECS world creator role - can create new worlds",
                level=30,
                is_system_role=True,
                metadata={"system": "ecs", "type": "world", "operation": "create"},
            ),
            RoleCreate(
                name="ecs_world_owner",
                description="ECS world owner role - full control over owned worlds",
                level=40,
                is_system_role=True,
                metadata={"system": "ecs", "type": "world", "operation": "own"},
            ),
            RoleCreate(
                name="ecs_world_collaborator",
                description="ECS world collaborator role - limited access to shared worlds",
                level=25,
                is_system_role=True,
                metadata={"system": "ecs", "type": "world", "operation": "collaborate"},
            ),
            RoleCreate(
                name="ecs_world_viewer",
                description="ECS world viewer role - read-only access to worlds",
                level=20,
                is_system_role=True,
                metadata={"system": "ecs", "type": "world", "operation": "view"},
            ),
            # Agent management roles
            RoleCreate(
                name="ecs_agent_creator",
                description="ECS agent creator role - can create agents in worlds",
                level=25,
                is_system_role=True,
                metadata={"system": "ecs", "type": "agent", "operation": "create"},
            ),
            RoleCreate(
                name="ecs_agent_manager",
                description="ECS agent manager role - can manage agents in worlds",
                level=30,
                is_system_role=True,
                metadata={"system": "ecs", "type": "agent", "operation": "manage"},
            ),
            RoleCreate(
                name="ecs_agent_viewer",
                description="ECS agent viewer role - can view agents in worlds",
                level=20,
                is_system_role=True,
                metadata={"system": "ecs", "type": "agent", "operation": "view"},
            ),
            # Simulation control roles
            RoleCreate(
                name="ecs_simulation_controller",
                description="ECS simulation controller role - can control simulation parameters",
                level=35,
                is_system_role=True,
                metadata={
                    "system": "ecs",
                    "type": "simulation",
                    "operation": "control",
                },
            ),
            RoleCreate(
                name="ecs_simulation_operator",
                description="ECS simulation operator role - can operate simulation controls",
                level=30,
                is_system_role=True,
                metadata={
                    "system": "ecs",
                    "type": "simulation",
                    "operation": "operate",
                },
            ),
            RoleCreate(
                name="ecs_simulation_viewer",
                description="ECS simulation viewer role - can view simulation status",
                level=20,
                is_system_role=True,
                metadata={"system": "ecs", "type": "simulation", "operation": "view"},
            ),
            # Analytics roles
            RoleCreate(
                name="ecs_analytics_admin",
                description="ECS analytics admin role - full access to world analytics",
                level=35,
                is_system_role=True,
                metadata={"system": "ecs", "type": "analytics", "operation": "admin"},
            ),
            RoleCreate(
                name="ecs_analytics_viewer",
                description="ECS analytics viewer role - can view world analytics",
                level=25,
                is_system_role=True,
                metadata={"system": "ecs", "type": "analytics", "operation": "view"},
            ),
        ]

        for role_data in ecs_roles:
            try:
                role_id = await self.auth_manager.create_role(role_data)
                if role_id:
                    self.bootstrap_stats["roles_created"] += 1
                    logger.info(f"Created ECS role: {role_data.name}")
                else:
                    logger.warning(f"Failed to create ECS role: {role_data.name}")
            except Exception as e:
                logger.error(f"Error creating ECS role {role_data.name}: {e}")
                self.bootstrap_stats["errors"] += 1

    async def _create_ecs_permissions(self) -> None:
        """Create all ECS-specific permissions."""
        logger.info("Creating ECS permissions...")

        ecs_permissions = [
            # Social system permissions
            PermissionCreate(
                name="ecs:social:create_group",
                resource_type=ResourceType.ECS_GROUP,
                operation=Operation.CREATE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "create_social_group"},
                metadata={
                    "system": "ecs",
                    "type": "social",
                    "operation": "create_group",
                },
            ),
            PermissionCreate(
                name="ecs:social:join_group",
                resource_type=ResourceType.ECS_GROUP,
                operation=Operation.UPDATE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "join_social_group"},
                metadata={"system": "ecs", "type": "social", "operation": "join_group"},
            ),
            PermissionCreate(
                name="ecs:social:leave_group",
                resource_type=ResourceType.ECS_GROUP,
                operation=Operation.UPDATE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "leave_social_group"},
                metadata={
                    "system": "ecs",
                    "type": "social",
                    "operation": "leave_group",
                },
            ),
            PermissionCreate(
                name="ecs:social:manage_group",
                resource_type=ResourceType.ECS_GROUP,
                operation=Operation.MANAGE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "manage_social_group"},
                metadata={
                    "system": "ecs",
                    "type": "social",
                    "operation": "manage_group",
                },
            ),
            PermissionCreate(
                name="ecs:social:interact",
                resource_type=ResourceType.ECS_AGENT,
                operation=Operation.EXECUTE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "social_interaction"},
                metadata={"system": "ecs", "type": "social", "operation": "interact"},
            ),
            PermissionCreate(
                name="ecs:social:view_analytics",
                resource_type=ResourceType.ECS_GROUP,
                operation=Operation.READ,
                scope=PermissionScope.TEAM,
                conditions={"operation": "view_social_analytics"},
                metadata={
                    "system": "ecs",
                    "type": "social",
                    "operation": "view_analytics",
                },
            ),
            # World management permissions
            PermissionCreate(
                name="ecs:world:create",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.CREATE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "create_world"},
                metadata={"system": "ecs", "type": "world", "operation": "create"},
            ),
            PermissionCreate(
                name="ecs:world:view",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.READ,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "view_world"},
                metadata={"system": "ecs", "type": "world", "operation": "view"},
            ),
            PermissionCreate(
                name="ecs:world:update",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.UPDATE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "update_world"},
                metadata={"system": "ecs", "type": "world", "operation": "update"},
            ),
            PermissionCreate(
                name="ecs:world:delete",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.DELETE,
                scope=PermissionScope.OWN,
                conditions={"operation": "delete_world"},
                metadata={"system": "ecs", "type": "world", "operation": "delete"},
            ),
            PermissionCreate(
                name="ecs:world:manage",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.MANAGE,
                scope=PermissionScope.OWN,
                conditions={"operation": "manage_world"},
                metadata={"system": "ecs", "type": "world", "operation": "manage"},
            ),
            PermissionCreate(
                name="ecs:world:share",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.SHARE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "share_world"},
                metadata={"system": "ecs", "type": "world", "operation": "share"},
            ),
            # Agent management permissions
            PermissionCreate(
                name="ecs:agent:create",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.CREATE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "create_agent"},
                metadata={"system": "ecs", "type": "agent", "operation": "create"},
            ),
            PermissionCreate(
                name="ecs:agent:view",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.READ,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "view_agent"},
                metadata={"system": "ecs", "type": "agent", "operation": "view"},
            ),
            PermissionCreate(
                name="ecs:agent:update",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.UPDATE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "update_agent"},
                metadata={"system": "ecs", "type": "agent", "operation": "update"},
            ),
            PermissionCreate(
                name="ecs:agent:delete",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.DELETE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "delete_agent"},
                metadata={"system": "ecs", "type": "agent", "operation": "delete"},
            ),
            PermissionCreate(
                name="ecs:agent:manage",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.MANAGE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "manage_agent"},
                metadata={"system": "ecs", "type": "agent", "operation": "manage"},
            ),
            # Simulation control permissions
            PermissionCreate(
                name="ecs:simulation:control",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.EXECUTE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "control_simulation"},
                metadata={
                    "system": "ecs",
                    "type": "simulation",
                    "operation": "control",
                },
            ),
            PermissionCreate(
                name="ecs:simulation:accelerate_time",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.EXECUTE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "accelerate_time"},
                metadata={
                    "system": "ecs",
                    "type": "simulation",
                    "operation": "accelerate_time",
                },
            ),
            PermissionCreate(
                name="ecs:simulation:pause",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.EXECUTE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "pause_simulation"},
                metadata={"system": "ecs", "type": "simulation", "operation": "pause"},
            ),
            PermissionCreate(
                name="ecs:simulation:resume",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.EXECUTE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "resume_simulation"},
                metadata={"system": "ecs", "type": "simulation", "operation": "resume"},
            ),
            PermissionCreate(
                name="ecs:simulation:reset",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.EXECUTE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "reset_simulation"},
                metadata={"system": "ecs", "type": "simulation", "operation": "reset"},
            ),
            PermissionCreate(
                name="ecs:simulation:view_status",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.READ,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "view_simulation_status"},
                metadata={
                    "system": "ecs",
                    "type": "simulation",
                    "operation": "view_status",
                },
            ),
            # Analytics permissions
            PermissionCreate(
                name="ecs:analytics:view",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.READ,
                scope=PermissionScope.TEAM,
                conditions={"operation": "view_analytics"},
                metadata={"system": "ecs", "type": "analytics", "operation": "view"},
            ),
            PermissionCreate(
                name="ecs:analytics:export",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.EXECUTE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "export_analytics"},
                metadata={"system": "ecs", "type": "analytics", "operation": "export"},
            ),
            PermissionCreate(
                name="ecs:analytics:admin",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.MANAGE,
                scope=PermissionScope.OWN,
                conditions={"operation": "admin_analytics"},
                metadata={"system": "ecs", "type": "analytics", "operation": "admin"},
            ),
        ]

        for permission_data in ecs_permissions:
            try:
                permission_id = await self.auth_manager.create_permission(
                    permission_data
                )
                if permission_id:
                    self.bootstrap_stats["permissions_created"] += 1
                    logger.info(f"Created ECS permission: {permission_data.name}")
                else:
                    logger.warning(
                        f"Failed to create ECS permission: {permission_data.name}"
                    )
            except Exception as e:
                logger.error(
                    f"Error creating ECS permission {permission_data.name}: {e}"
                )
                self.bootstrap_stats["errors"] += 1

    async def _assign_permissions_to_roles(self) -> None:
        """Assign permissions to ECS roles."""
        logger.info("Assigning permissions to ECS roles...")

        role_permission_mappings = {
            # Social system role permissions
            "ecs_social_leader": [
                "ecs:social:create_group",
                "ecs:social:manage_group",
                "ecs:social:interact",
                "ecs:social:view_analytics",
            ],
            "ecs_social_follower": [
                "ecs:social:join_group",
                "ecs:social:leave_group",
                "ecs:social:interact",
            ],
            "ecs_social_mediator": ["ecs:social:interact", "ecs:social:view_analytics"],
            "ecs_social_outcast": ["ecs:social:interact"],  # Limited interactions
            "ecs_social_neutral": [
                "ecs:social:join_group",
                "ecs:social:leave_group",
                "ecs:social:interact",
            ],
            "ecs_social_influencer": [
                "ecs:social:interact",
                "ecs:social:view_analytics",
            ],
            "ecs_social_mentor": ["ecs:social:interact", "ecs:social:view_analytics"],
            "ecs_social_student": ["ecs:social:join_group", "ecs:social:interact"],
            # Group type role permissions
            "ecs_group_work": [
                "ecs:social:join_group",
                "ecs:social:leave_group",
                "ecs:social:interact",
            ],
            "ecs_group_social": [
                "ecs:social:join_group",
                "ecs:social:leave_group",
                "ecs:social:interact",
            ],
            "ecs_group_interest": [
                "ecs:social:join_group",
                "ecs:social:leave_group",
                "ecs:social:interact",
            ],
            "ecs_group_family": [
                "ecs:social:join_group",
                "ecs:social:leave_group",
                "ecs:social:interact",
                "ecs:social:view_analytics",
            ],
            "ecs_group_community": [
                "ecs:social:join_group",
                "ecs:social:leave_group",
                "ecs:social:interact",
            ],
            # Social status role permissions
            "ecs_status_accepted": ["ecs:social:join_group", "ecs:social:interact"],
            "ecs_status_isolated": ["ecs:social:interact"],  # Limited interactions
            "ecs_status_controversial": ["ecs:social:interact"],
            "ecs_status_influential": [
                "ecs:social:interact",
                "ecs:social:view_analytics",
            ],
            "ecs_status_leader": [
                "ecs:social:create_group",
                "ecs:social:manage_group",
                "ecs:social:interact",
                "ecs:social:view_analytics",
            ],
            # World management role permissions
            "ecs_world_creator": ["ecs:world:create", "ecs:world:view"],
            "ecs_world_owner": [
                "ecs:world:view",
                "ecs:world:update",
                "ecs:world:delete",
                "ecs:world:manage",
                "ecs:world:share",
                "ecs:agent:create",
                "ecs:agent:view",
                "ecs:agent:update",
                "ecs:agent:delete",
                "ecs:agent:manage",
                "ecs:simulation:control",
                "ecs:simulation:accelerate_time",
                "ecs:simulation:pause",
                "ecs:simulation:resume",
                "ecs:simulation:reset",
                "ecs:simulation:view_status",
                "ecs:analytics:view",
                "ecs:analytics:export",
                "ecs:analytics:admin",
            ],
            "ecs_world_collaborator": [
                "ecs:world:view",
                "ecs:agent:create",
                "ecs:agent:view",
                "ecs:agent:update",
                "ecs:simulation:view_status",
                "ecs:analytics:view",
            ],
            "ecs_world_viewer": [
                "ecs:world:view",
                "ecs:agent:view",
                "ecs:simulation:view_status",
            ],
            # Agent management role permissions
            "ecs_agent_creator": ["ecs:agent:create", "ecs:agent:view"],
            "ecs_agent_manager": [
                "ecs:agent:create",
                "ecs:agent:view",
                "ecs:agent:update",
                "ecs:agent:delete",
                "ecs:agent:manage",
            ],
            "ecs_agent_viewer": ["ecs:agent:view"],
            # Simulation control role permissions
            "ecs_simulation_controller": [
                "ecs:simulation:control",
                "ecs:simulation:accelerate_time",
                "ecs:simulation:pause",
                "ecs:simulation:resume",
                "ecs:simulation:reset",
                "ecs:simulation:view_status",
            ],
            "ecs_simulation_operator": [
                "ecs:simulation:accelerate_time",
                "ecs:simulation:pause",
                "ecs:simulation:resume",
                "ecs:simulation:view_status",
            ],
            "ecs_simulation_viewer": ["ecs:simulation:view_status"],
            # Analytics role permissions
            "ecs_analytics_admin": [
                "ecs:analytics:view",
                "ecs:analytics:export",
                "ecs:analytics:admin",
            ],
            "ecs_analytics_viewer": ["ecs:analytics:view"],
        }

        for role_name, permission_names in role_permission_mappings.items():
            try:
                for permission_name in permission_names:
                    success = await self.auth_manager.assign_permission_to_role(
                        role_name=role_name, permission_name=permission_name
                    )
                    if success:
                        logger.debug(
                            f"Assigned permission {permission_name} to role {role_name}"
                        )
                    else:
                        logger.warning(
                            f"Failed to assign permission {permission_name} to role {role_name}"
                        )
            except Exception as e:
                logger.error(f"Error assigning permissions to role {role_name}: {e}")
                self.bootstrap_stats["errors"] += 1

    async def _create_default_user_assignments(self) -> None:
        """Create default user role assignments."""
        logger.info("Creating default user role assignments...")

        try:
            # Assign admin user to world owner role
            admin_username = "admin"  # This should come from configuration

            assignment = UserRoleAssignment(
                user_id=admin_username,
                role_id="ecs_world_owner",
                context_type="ecs_world",
                context_id="default_world",
                metadata={
                    "bootstrap": "ecs_rbac",
                    "created_at": "2024-01-01T00:00:00Z",
                },
            )

            success = await self.auth_manager.assign_role_to_user(assignment)
            if success:
                self.bootstrap_stats["user_assignments"] += 1
                logger.info(f"Assigned admin user to ecs_world_owner role")
            else:
                logger.warning("Failed to assign admin user to ecs_world_owner role")

        except Exception as e:
            logger.error(f"Error creating default user assignments: {e}")
            self.bootstrap_stats["errors"] += 1

    def _log_bootstrap_stats(self) -> None:
        """Log bootstrap statistics."""
        logger.info("📊 ECS RBAC Bootstrap Statistics:")
        logger.info(f"  ✅ Roles created: {self.bootstrap_stats['roles_created']}")
        logger.info(
            f"  ✅ Permissions created: {self.bootstrap_stats['permissions_created']}"
        )
        logger.info(
            f"  ✅ User assignments: {self.bootstrap_stats['user_assignments']}"
        )
        logger.info(f"  ❌ Errors: {self.bootstrap_stats['errors']}")


async def bootstrap_ecs_rbac() -> bool:
    """Bootstrap the ECS RBAC system."""
    bootstrap = ECSRBACBootstrap()

    if not await bootstrap.initialize():
        logger.error("Failed to initialize ECS RBAC bootstrap")
        return False

    return await bootstrap.bootstrap_ecs_rbac()
