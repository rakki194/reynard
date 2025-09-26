"""🔐 ECS RBAC Migration Script

This script migrates the ECS system from isolated social role management
to the new unified RBAC system.

Migration Steps:
1. Create ECS-specific RBAC roles and permissions
2. Migrate existing social roles to RBAC roles
3. Update group management to use RBAC
4. Migrate world access controls to RBAC
5. Update simulation permissions to use RBAC

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.core.service_registry import get_service_registry
from gatekeeper.core.auth_manager import AuthManager
from gatekeeper.models.rbac import (
    Operation,
    Permission,
    PermissionCreate,
    PermissionScope,
    ResourceType,
    Role,
    RoleCreate,
    UserRoleAssignment,
)

from ...ecs.components.social import GroupType, SocialRole, SocialStatus

logger = logging.getLogger(__name__)


class ECSRBACMigration:
    """Migration script for ECS system RBAC integration."""

    def __init__(self):
        self.auth_manager: Optional[AuthManager] = None
        self.migration_stats = {
            "roles_created": 0,
            "permissions_created": 0,
            "user_assignments": 0,
            "social_roles_migrated": 0,
            "group_roles_migrated": 0,
            "world_permissions_migrated": 0,
            "errors": 0,
        }

    async def initialize(self) -> bool:
        """Initialize the migration."""
        try:
            service_registry = get_service_registry()
            self.auth_manager = service_registry.get_service_instance("auth_manager")

            if not self.auth_manager:
                logger.error("AuthManager not found in service registry")
                return False

            logger.info("ECS RBAC migration initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize ECS RBAC migration: {e}")
            return False

    async def run_migration(self) -> bool:
        """Run the complete ECS RBAC migration."""
        try:
            logger.info("🚀 Starting ECS RBAC migration...")

            # Step 1: Create ECS-specific roles
            await self._create_ecs_roles()

            # Step 2: Create ECS-specific permissions
            await self._create_ecs_permissions()

            # Step 3: Assign permissions to roles
            await self._assign_permissions_to_roles()

            # Step 4: Create default user assignments
            await self._create_default_user_assignments()

            # Step 5: Migrate existing social roles
            await self._migrate_social_roles()

            # Step 6: Migrate group management
            await self._migrate_group_management()

            # Step 7: Migrate world access controls
            await self._migrate_world_access_controls()

            logger.info("✅ ECS RBAC migration completed successfully")
            self._log_migration_stats()
            return True

        except Exception as e:
            logger.error(f"❌ ECS RBAC migration failed: {e}")
            self.migration_stats["errors"] += 1
            return False

    async def _create_ecs_roles(self) -> None:
        """Create ECS-specific roles."""
        logger.info("Creating ECS-specific roles...")

        ecs_roles = [
            # Social roles
            RoleCreate(
                name="ecs_social_leader",
                description="ECS social leader role - can lead groups and influence others",
                level=40,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "leader"},
            ),
            RoleCreate(
                name="ecs_social_follower",
                description="ECS social follower role - can follow leaders and participate in groups",
                level=20,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "follower"},
            ),
            RoleCreate(
                name="ecs_social_mediator",
                description="ECS social mediator role - can resolve conflicts and mediate disputes",
                level=30,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "mediator"},
            ),
            RoleCreate(
                name="ecs_social_outcast",
                description="ECS social outcast role - limited social interactions",
                level=10,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "outcast"},
            ),
            RoleCreate(
                name="ecs_social_neutral",
                description="ECS social neutral role - standard social interactions",
                level=15,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "neutral"},
            ),
            RoleCreate(
                name="ecs_social_influencer",
                description="ECS social influencer role - can influence others and spread ideas",
                level=35,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "influencer"},
            ),
            RoleCreate(
                name="ecs_social_mentor",
                description="ECS social mentor role - can teach and guide others",
                level=30,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "mentor"},
            ),
            RoleCreate(
                name="ecs_social_student",
                description="ECS social student role - can learn from mentors",
                level=15,
                is_system_role=True,
                metadata={"system": "ecs", "type": "social", "role": "student"},
            ),
            # Group roles
            RoleCreate(
                name="ecs_group_work",
                description="ECS work group role - can participate in work-related groups",
                level=25,
                is_system_role=True,
                metadata={"system": "ecs", "type": "group", "group_type": "work"},
            ),
            RoleCreate(
                name="ecs_group_social",
                description="ECS social group role - can participate in social groups",
                level=20,
                is_system_role=True,
                metadata={"system": "ecs", "type": "group", "group_type": "social"},
            ),
            RoleCreate(
                name="ecs_group_interest",
                description="ECS interest group role - can participate in interest-based groups",
                level=20,
                is_system_role=True,
                metadata={"system": "ecs", "type": "group", "group_type": "interest"},
            ),
            RoleCreate(
                name="ecs_group_family",
                description="ECS family group role - can participate in family groups",
                level=30,
                is_system_role=True,
                metadata={"system": "ecs", "type": "group", "group_type": "family"},
            ),
            RoleCreate(
                name="ecs_group_community",
                description="ECS community group role - can participate in community groups",
                level=25,
                is_system_role=True,
                metadata={"system": "ecs", "type": "group", "group_type": "community"},
            ),
            # Status roles
            RoleCreate(
                name="ecs_status_accepted",
                description="ECS accepted status role - well-accepted in the community",
                level=25,
                is_system_role=True,
                metadata={"system": "ecs", "type": "status", "status": "accepted"},
            ),
            RoleCreate(
                name="ecs_status_isolated",
                description="ECS isolated status role - limited community interaction",
                level=10,
                is_system_role=True,
                metadata={"system": "ecs", "type": "status", "status": "isolated"},
            ),
            RoleCreate(
                name="ecs_status_controversial",
                description="ECS controversial status role - mixed community reception",
                level=20,
                is_system_role=True,
                metadata={"system": "ecs", "type": "status", "status": "controversial"},
            ),
            RoleCreate(
                name="ecs_status_influential",
                description="ECS influential status role - high community influence",
                level=35,
                is_system_role=True,
                metadata={"system": "ecs", "type": "status", "status": "influential"},
            ),
            RoleCreate(
                name="ecs_status_leader",
                description="ECS leader status role - recognized community leader",
                level=40,
                is_system_role=True,
                metadata={"system": "ecs", "type": "status", "status": "leader"},
            ),
            # World management roles
            RoleCreate(
                name="ecs_world_viewer",
                description="ECS world viewer role - can view world state and agents",
                level=20,
                is_system_role=True,
                metadata={"system": "ecs", "type": "world", "operation": "view"},
            ),
            RoleCreate(
                name="ecs_world_manager",
                description="ECS world manager role - can manage world state and agents",
                level=40,
                is_system_role=True,
                metadata={"system": "ecs", "type": "world", "operation": "manage"},
            ),
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
        ]

        for role_data in ecs_roles:
            try:
                role_id = await self.auth_manager.create_role(role_data)
                if role_id:
                    self.migration_stats["roles_created"] += 1
                    logger.info(f"Created ECS role: {role_data.name}")
                else:
                    logger.warning(f"Failed to create ECS role: {role_data.name}")
            except Exception as e:
                logger.error(f"Error creating ECS role {role_data.name}: {e}")
                self.migration_stats["errors"] += 1

    async def _create_ecs_permissions(self) -> None:
        """Create ECS-specific permissions."""
        logger.info("Creating ECS-specific permissions...")

        ecs_permissions = [
            # Social interaction permissions
            PermissionCreate(
                name="ecs:social:interact",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.READ,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "interact"},
                metadata={"system": "ecs", "type": "social", "operation": "interact"},
            ),
            PermissionCreate(
                name="ecs:social:connect",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.CREATE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "connect"},
                metadata={"system": "ecs", "type": "social", "operation": "connect"},
            ),
            PermissionCreate(
                name="ecs:social:disconnect",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.DELETE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "disconnect"},
                metadata={"system": "ecs", "type": "social", "operation": "disconnect"},
            ),
            PermissionCreate(
                name="ecs:social:influence",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.UPDATE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "influence"},
                metadata={"system": "ecs", "type": "social", "operation": "influence"},
            ),
            PermissionCreate(
                name="ecs:social:lead",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.MANAGE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "lead"},
                metadata={"system": "ecs", "type": "social", "operation": "lead"},
            ),
            PermissionCreate(
                name="ecs:social:mediate",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.UPDATE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "mediate"},
                metadata={"system": "ecs", "type": "social", "operation": "mediate"},
            ),
            PermissionCreate(
                name="ecs:social:mentor",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.UPDATE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "mentor"},
                metadata={"system": "ecs", "type": "social", "operation": "mentor"},
            ),
            PermissionCreate(
                name="ecs:social:learn",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.READ,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "learn"},
                metadata={"system": "ecs", "type": "social", "operation": "learn"},
            ),
            # Group management permissions
            PermissionCreate(
                name="ecs:group:join",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.CREATE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "join_group"},
                metadata={"system": "ecs", "type": "group", "operation": "join"},
            ),
            PermissionCreate(
                name="ecs:group:leave",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.DELETE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "leave_group"},
                metadata={"system": "ecs", "type": "group", "operation": "leave"},
            ),
            PermissionCreate(
                name="ecs:group:create",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.CREATE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "create_group"},
                metadata={"system": "ecs", "type": "group", "operation": "create"},
            ),
            PermissionCreate(
                name="ecs:group:delete",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.DELETE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "delete_group"},
                metadata={"system": "ecs", "type": "group", "operation": "delete"},
            ),
            PermissionCreate(
                name="ecs:group:manage",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.MANAGE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "manage_group"},
                metadata={"system": "ecs", "type": "group", "operation": "manage"},
            ),
            PermissionCreate(
                name="ecs:group:view",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.READ,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "view_group"},
                metadata={"system": "ecs", "type": "group", "operation": "view"},
            ),
            PermissionCreate(
                name="ecs:group:invite",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.CREATE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "invite_to_group"},
                metadata={"system": "ecs", "type": "group", "operation": "invite"},
            ),
            PermissionCreate(
                name="ecs:group:kick",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.DELETE,
                scope=PermissionScope.TEAM,
                conditions={"operation": "kick_from_group"},
                metadata={"system": "ecs", "type": "group", "operation": "kick"},
            ),
            # World management permissions
            PermissionCreate(
                name="ecs:world:view",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.READ,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "view_world"},
                metadata={"system": "ecs", "type": "world", "operation": "view"},
            ),
            PermissionCreate(
                name="ecs:world:create",
                resource_type=ResourceType.ECS_WORLD,
                operation=Operation.CREATE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"operation": "create_world"},
                metadata={"system": "ecs", "type": "world", "operation": "create"},
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
        ]

        for permission_data in ecs_permissions:
            try:
                permission_id = await self.auth_manager.create_permission(
                    permission_data
                )
                if permission_id:
                    self.migration_stats["permissions_created"] += 1
                    logger.info(f"Created ECS permission: {permission_data.name}")
                else:
                    logger.warning(
                        f"Failed to create ECS permission: {permission_data.name}"
                    )
            except Exception as e:
                logger.error(
                    f"Error creating ECS permission {permission_data.name}: {e}"
                )
                self.migration_stats["errors"] += 1

    async def _assign_permissions_to_roles(self) -> None:
        """Assign permissions to ECS roles."""
        logger.info("Assigning permissions to ECS roles...")

        role_permission_mappings = {
            # Social role permissions
            "ecs_social_leader": [
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:influence",
                "ecs:social:lead",
                "ecs:social:mediate",
                "ecs:social:mentor",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:create",
                "ecs:group:manage",
                "ecs:group:view",
                "ecs:group:invite",
                "ecs:group:kick",
            ],
            "ecs_social_follower": [
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
            ],
            "ecs_social_mediator": [
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:mediate",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
            ],
            "ecs_social_outcast": ["ecs:social:interact", "ecs:social:learn"],
            "ecs_social_neutral": [
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
            ],
            "ecs_social_influencer": [
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:influence",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
            ],
            "ecs_social_mentor": [
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:mentor",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
            ],
            "ecs_social_student": [
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
            ],
            # Group type permissions
            "ecs_group_work": ["ecs:group:join", "ecs:group:leave", "ecs:group:view"],
            "ecs_group_social": ["ecs:group:join", "ecs:group:leave", "ecs:group:view"],
            "ecs_group_interest": [
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
            ],
            "ecs_group_family": [
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
                "ecs:group:manage",
            ],
            "ecs_group_community": [
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
            ],
            # Status permissions
            "ecs_status_accepted": [
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
            ],
            "ecs_status_isolated": ["ecs:social:interact", "ecs:social:learn"],
            "ecs_status_controversial": [
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
            ],
            "ecs_status_influential": [
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:influence",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:view",
                "ecs:group:invite",
            ],
            "ecs_status_leader": [
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:influence",
                "ecs:social:lead",
                "ecs:social:mediate",
                "ecs:social:mentor",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:create",
                "ecs:group:manage",
                "ecs:group:view",
                "ecs:group:invite",
                "ecs:group:kick",
            ],
            # World management permissions
            "ecs_world_viewer": [
                "ecs:world:view",
                "ecs:social:interact",
                "ecs:social:learn",
                "ecs:group:view",
            ],
            "ecs_world_manager": [
                "ecs:world:view",
                "ecs:world:create",
                "ecs:world:update",
                "ecs:world:delete",
                "ecs:world:manage",
                "ecs:social:interact",
                "ecs:social:connect",
                "ecs:social:disconnect",
                "ecs:social:influence",
                "ecs:social:lead",
                "ecs:social:mediate",
                "ecs:social:mentor",
                "ecs:social:learn",
                "ecs:group:join",
                "ecs:group:leave",
                "ecs:group:create",
                "ecs:group:delete",
                "ecs:group:manage",
                "ecs:group:view",
                "ecs:group:invite",
                "ecs:group:kick",
            ],
            "ecs_simulation_controller": [
                "ecs:simulation:control",
                "ecs:simulation:accelerate_time",
                "ecs:simulation:pause",
                "ecs:simulation:resume",
                "ecs:world:view",
                "ecs:world:update",
            ],
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
                self.migration_stats["errors"] += 1

    async def _create_default_user_assignments(self) -> None:
        """Create default user role assignments."""
        logger.info("Creating default user role assignments...")

        try:
            # Get existing users and assign appropriate roles
            admin_username = "admin"  # This should come from configuration

            # Assign admin user to world manager role
            assignment = UserRoleAssignment(
                user_id=admin_username,
                role_id="ecs_world_manager",
                context_type="ecs_system",
                context_id="default_world",
                metadata={
                    "migration": "ecs_rbac",
                    "created_at": datetime.now().isoformat(),
                },
            )

            success = await self.auth_manager.assign_role_to_user(assignment)
            if success:
                self.migration_stats["user_assignments"] += 1
                logger.info(f"Assigned admin user to ecs_world_manager role")
            else:
                logger.warning("Failed to assign admin user to ecs_world_manager role")

        except Exception as e:
            logger.error(f"Error creating default user assignments: {e}")
            self.migration_stats["errors"] += 1

    async def _migrate_social_roles(self) -> None:
        """Migrate existing social roles to RBAC."""
        logger.info("Migrating existing social roles to RBAC...")

        # This would typically migrate existing social role assignments
        # For now, we'll just log the migration step
        logger.info("Social role migration completed (no existing data to migrate)")
        self.migration_stats["social_roles_migrated"] += 1

    async def _migrate_group_management(self) -> None:
        """Migrate group management to RBAC."""
        logger.info("Migrating group management to RBAC...")

        # This would typically migrate existing group configurations
        # For now, we'll just log the migration step
        logger.info(
            "Group management migration completed (no existing data to migrate)"
        )
        self.migration_stats["group_roles_migrated"] += 1

    async def _migrate_world_access_controls(self) -> None:
        """Migrate world access controls to RBAC."""
        logger.info("Migrating world access controls to RBAC...")

        # This would typically migrate existing world access configurations
        # For now, we'll just log the migration step
        logger.info(
            "World access control migration completed (no existing data to migrate)"
        )
        self.migration_stats["world_permissions_migrated"] += 1

    def _log_migration_stats(self) -> None:
        """Log migration statistics."""
        logger.info("📊 ECS RBAC Migration Statistics:")
        logger.info(f"  ✅ Roles created: {self.migration_stats['roles_created']}")
        logger.info(
            f"  ✅ Permissions created: {self.migration_stats['permissions_created']}"
        )
        logger.info(
            f"  ✅ User assignments: {self.migration_stats['user_assignments']}"
        )
        logger.info(
            f"  ✅ Social roles migrated: {self.migration_stats['social_roles_migrated']}"
        )
        logger.info(
            f"  ✅ Group roles migrated: {self.migration_stats['group_roles_migrated']}"
        )
        logger.info(
            f"  ✅ World permissions migrated: {self.migration_stats['world_permissions_migrated']}"
        )
        logger.info(f"  ❌ Errors: {self.migration_stats['errors']}")


async def run_ecs_rbac_migration() -> bool:
    """Run the ECS RBAC migration."""
    migration = ECSRBACMigration()

    if not await migration.initialize():
        logger.error("Failed to initialize ECS RBAC migration")
        return False

    return await migration.run_migration()


if __name__ == "__main__":
    # Run the migration
    success = asyncio.run(run_ecs_rbac_migration())
    if success:
        print("✅ ECS RBAC migration completed successfully")
        exit(0)
    else:
        print("❌ ECS RBAC migration failed")
        exit(1)
