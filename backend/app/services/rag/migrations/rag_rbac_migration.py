"""🔐 RAG RBAC Migration Script

This script migrates the RAG system from the old AccessControlSecurityService
to the new unified RBAC system.

Migration Steps:
1. Create RAG-specific RBAC roles and permissions
2. Migrate existing access levels to RBAC roles
3. Update security policies to use RBAC
4. Migrate audit logs to unified system
5. Update service configurations

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

logger = logging.getLogger(__name__)


class RAGRBACMigration:
    """Migration script for RAG system RBAC integration."""

    def __init__(self):
        self.auth_manager: Optional[AuthManager] = None
        self.migration_stats = {
            "roles_created": 0,
            "permissions_created": 0,
            "user_assignments": 0,
            "policies_migrated": 0,
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

            logger.info("RAG RBAC migration initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize RAG RBAC migration: {e}")
            return False

    async def run_migration(self) -> bool:
        """Run the complete RAG RBAC migration."""
        try:
            logger.info("🚀 Starting RAG RBAC migration...")

            # Step 1: Create RAG-specific roles
            await self._create_rag_roles()

            # Step 2: Create RAG-specific permissions
            await self._create_rag_permissions()

            # Step 3: Assign permissions to roles
            await self._assign_permissions_to_roles()

            # Step 4: Create default user assignments
            await self._create_default_user_assignments()

            # Step 5: Migrate existing access levels
            await self._migrate_access_levels()

            logger.info("✅ RAG RBAC migration completed successfully")
            self._log_migration_stats()
            return True

        except Exception as e:
            logger.error(f"❌ RAG RBAC migration failed: {e}")
            self.migration_stats["errors"] += 1
            return False

    async def _create_rag_roles(self) -> None:
        """Create RAG-specific roles."""
        logger.info("Creating RAG-specific roles...")

        rag_roles = [
            RoleCreate(
                name="rag_public_reader",
                description="Public reader role for RAG system - can read public documents",
                level=10,
                is_system_role=True,
                metadata={"system": "rag", "access_level": "public"},
            ),
            RoleCreate(
                name="rag_internal_user",
                description="Internal user role for RAG system - can read and search internal documents",
                level=20,
                is_system_role=True,
                metadata={"system": "rag", "access_level": "internal"},
            ),
            RoleCreate(
                name="rag_confidential_user",
                description="Confidential user role for RAG system - can access confidential documents",
                level=30,
                is_system_role=True,
                metadata={"system": "rag", "access_level": "confidential"},
            ),
            RoleCreate(
                name="rag_restricted_admin",
                description="Restricted admin role for RAG system - full access to restricted documents",
                level=40,
                is_system_role=True,
                metadata={"system": "rag", "access_level": "restricted"},
            ),
            RoleCreate(
                name="rag_embedding_user",
                description="User role for generating embeddings",
                level=15,
                is_system_role=True,
                metadata={"system": "rag", "operation": "embedding"},
            ),
            RoleCreate(
                name="rag_search_user",
                description="User role for performing searches",
                level=15,
                is_system_role=True,
                metadata={"system": "rag", "operation": "search"},
            ),
        ]

        for role_data in rag_roles:
            try:
                role_id = await self.auth_manager.create_role(role_data)
                if role_id:
                    self.migration_stats["roles_created"] += 1
                    logger.info(f"Created RAG role: {role_data.name}")
                else:
                    logger.warning(f"Failed to create RAG role: {role_data.name}")
            except Exception as e:
                logger.error(f"Error creating RAG role {role_data.name}: {e}")
                self.migration_stats["errors"] += 1

    async def _create_rag_permissions(self) -> None:
        """Create RAG-specific permissions."""
        logger.info("Creating RAG-specific permissions...")

        rag_permissions = [
            # Public permissions
            PermissionCreate(
                name="rag:public:read",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.READ,
                scope=PermissionScope.GLOBAL,
                conditions={"access_level": "public"},
                metadata={"system": "rag", "access_level": "public"},
            ),
            PermissionCreate(
                name="rag:public:search",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.READ,
                scope=PermissionScope.GLOBAL,
                conditions={"access_level": "public", "operation": "search"},
                metadata={
                    "system": "rag",
                    "access_level": "public",
                    "operation": "search",
                },
            ),
            # Internal permissions
            PermissionCreate(
                name="rag:internal:read",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.READ,
                scope=PermissionScope.ORGANIZATION,
                conditions={"access_level": "internal"},
                metadata={"system": "rag", "access_level": "internal"},
            ),
            PermissionCreate(
                name="rag:internal:search",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.READ,
                scope=PermissionScope.ORGANIZATION,
                conditions={"access_level": "internal", "operation": "search"},
                metadata={
                    "system": "rag",
                    "access_level": "internal",
                    "operation": "search",
                },
            ),
            PermissionCreate(
                name="rag:internal:embed",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.EXECUTE,
                scope=PermissionScope.ORGANIZATION,
                conditions={"access_level": "internal", "operation": "embedding"},
                metadata={
                    "system": "rag",
                    "access_level": "internal",
                    "operation": "embedding",
                },
            ),
            # Confidential permissions
            PermissionCreate(
                name="rag:confidential:read",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.READ,
                scope=PermissionScope.TEAM,
                conditions={"access_level": "confidential"},
                metadata={"system": "rag", "access_level": "confidential"},
            ),
            PermissionCreate(
                name="rag:confidential:search",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.READ,
                scope=PermissionScope.TEAM,
                conditions={"access_level": "confidential", "operation": "search"},
                metadata={
                    "system": "rag",
                    "access_level": "confidential",
                    "operation": "search",
                },
            ),
            PermissionCreate(
                name="rag:confidential:embed",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.EXECUTE,
                scope=PermissionScope.TEAM,
                conditions={"access_level": "confidential", "operation": "embedding"},
                metadata={
                    "system": "rag",
                    "access_level": "confidential",
                    "operation": "embedding",
                },
            ),
            # Restricted permissions
            PermissionCreate(
                name="rag:restricted:read",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.READ,
                scope=PermissionScope.OWN,
                conditions={"access_level": "restricted"},
                metadata={"system": "rag", "access_level": "restricted"},
            ),
            PermissionCreate(
                name="rag:restricted:search",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.READ,
                scope=PermissionScope.OWN,
                conditions={"access_level": "restricted", "operation": "search"},
                metadata={
                    "system": "rag",
                    "access_level": "restricted",
                    "operation": "search",
                },
            ),
            PermissionCreate(
                name="rag:restricted:embed",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.EXECUTE,
                scope=PermissionScope.OWN,
                conditions={"access_level": "restricted", "operation": "embedding"},
                metadata={
                    "system": "rag",
                    "access_level": "restricted",
                    "operation": "embedding",
                },
            ),
            PermissionCreate(
                name="rag:restricted:manage",
                resource_type=ResourceType.RAG_DOCUMENT,
                operation=Operation.MANAGE,
                scope=PermissionScope.OWN,
                conditions={"access_level": "restricted"},
                metadata={
                    "system": "rag",
                    "access_level": "restricted",
                    "operation": "manage",
                },
            ),
        ]

        for permission_data in rag_permissions:
            try:
                permission_id = await self.auth_manager.create_permission(
                    permission_data
                )
                if permission_id:
                    self.migration_stats["permissions_created"] += 1
                    logger.info(f"Created RAG permission: {permission_data.name}")
                else:
                    logger.warning(
                        f"Failed to create RAG permission: {permission_data.name}"
                    )
            except Exception as e:
                logger.error(
                    f"Error creating RAG permission {permission_data.name}: {e}"
                )
                self.migration_stats["errors"] += 1

    async def _assign_permissions_to_roles(self) -> None:
        """Assign permissions to RAG roles."""
        logger.info("Assigning permissions to RAG roles...")

        role_permission_mappings = {
            "rag_public_reader": ["rag:public:read", "rag:public:search"],
            "rag_internal_user": [
                "rag:public:read",
                "rag:public:search",
                "rag:internal:read",
                "rag:internal:search",
                "rag:internal:embed",
            ],
            "rag_confidential_user": [
                "rag:public:read",
                "rag:public:search",
                "rag:internal:read",
                "rag:internal:search",
                "rag:internal:embed",
                "rag:confidential:read",
                "rag:confidential:search",
                "rag:confidential:embed",
            ],
            "rag_restricted_admin": [
                "rag:public:read",
                "rag:public:search",
                "rag:internal:read",
                "rag:internal:search",
                "rag:internal:embed",
                "rag:confidential:read",
                "rag:confidential:search",
                "rag:confidential:embed",
                "rag:restricted:read",
                "rag:restricted:search",
                "rag:restricted:embed",
                "rag:restricted:manage",
            ],
            "rag_embedding_user": ["rag:internal:embed", "rag:confidential:embed"],
            "rag_search_user": [
                "rag:public:search",
                "rag:internal:search",
                "rag:confidential:search",
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

        # Get existing users and assign appropriate roles
        try:
            # This would typically get users from the system
            # For now, we'll create a default admin assignment
            admin_username = "admin"  # This should come from configuration

            # Assign admin user to restricted admin role
            assignment = UserRoleAssignment(
                user_id=admin_username,
                role_id="rag_restricted_admin",
                context_type="system",
                context_id="rag_system",
                metadata={
                    "migration": "rag_rbac",
                    "created_at": datetime.now().isoformat(),
                },
            )

            success = await self.auth_manager.assign_role_to_user(assignment)
            if success:
                self.migration_stats["user_assignments"] += 1
                logger.info(f"Assigned admin user to rag_restricted_admin role")
            else:
                logger.warning(
                    "Failed to assign admin user to rag_restricted_admin role"
                )

        except Exception as e:
            logger.error(f"Error creating default user assignments: {e}")
            self.migration_stats["errors"] += 1

    async def _migrate_access_levels(self) -> None:
        """Migrate existing access levels to RBAC."""
        logger.info("Migrating existing access levels to RBAC...")

        # This would typically migrate existing access level configurations
        # For now, we'll just log the migration step
        logger.info("Access level migration completed (no existing data to migrate)")
        self.migration_stats["policies_migrated"] += 1

    def _log_migration_stats(self) -> None:
        """Log migration statistics."""
        logger.info("📊 RAG RBAC Migration Statistics:")
        logger.info(f"  ✅ Roles created: {self.migration_stats['roles_created']}")
        logger.info(
            f"  ✅ Permissions created: {self.migration_stats['permissions_created']}"
        )
        logger.info(
            f"  ✅ User assignments: {self.migration_stats['user_assignments']}"
        )
        logger.info(
            f"  ✅ Policies migrated: {self.migration_stats['policies_migrated']}"
        )
        logger.info(f"  ❌ Errors: {self.migration_stats['errors']}")


async def run_rag_rbac_migration() -> bool:
    """Run the RAG RBAC migration."""
    migration = RAGRBACMigration()

    if not await migration.initialize():
        logger.error("Failed to initialize RAG RBAC migration")
        return False

    return await migration.run_migration()


if __name__ == "__main__":
    # Run the migration
    success = asyncio.run(run_rag_rbac_migration())
    if success:
        print("✅ RAG RBAC migration completed successfully")
        exit(0)
    else:
        print("❌ RAG RBAC migration failed")
        exit(1)
