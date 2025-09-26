"""RBAC Bootstrap Service for Default System Setup.

This module provides functionality to bootstrap the RBAC system with default
roles, permissions, and system data.
"""

import logging
from typing import Any, Dict, List

from ..models.rbac import (
    Operation,
    Permission,
    PermissionCreate,
    PermissionScope,
    ResourceType,
    Role,
    RoleCreate,
)
from .auth_manager import AuthManager

logger = logging.getLogger(__name__)


class RBACBootstrapService:
    """Service for bootstrapping RBAC system with default data."""

    def __init__(self, auth_manager: AuthManager):
        """Initialize the RBAC bootstrap service.

        Args:
            auth_manager: AuthManager instance for database operations
        """
        self.auth_manager = auth_manager
        self.logger = logging.getLogger(f"{__name__}.bootstrap")

    async def create_default_roles(self) -> Dict[str, Role]:
        """Create default system roles with hierarchy.

        Returns:
            Dict[str, Role]: Dictionary of created roles by name
        """
        self.logger.info("Creating default system roles...")

        # Define default roles with hierarchy levels
        default_roles = [
            {
                "name": "system_admin",
                "description": "System administrator with full access to all resources and operations",
                "level": 100,
                "is_system_role": True,
            },
            {
                "name": "admin",
                "description": "Administrator with full access to most resources",
                "level": 90,
                "is_system_role": True,
            },
            {
                "name": "manager",
                "description": "Manager with access to team resources and user management",
                "level": 70,
                "is_system_role": True,
            },
            {
                "name": "user",
                "description": "Regular user with access to own resources and shared content",
                "level": 50,
                "is_system_role": True,
            },
            {
                "name": "guest",
                "description": "Guest user with limited read-only access",
                "level": 10,
                "is_system_role": True,
            },
            {
                "name": "project_admin",
                "description": "Project administrator with full access to specific project resources",
                "level": 80,
                "is_system_role": False,
            },
            {
                "name": "project_member",
                "description": "Project member with access to project resources",
                "level": 60,
                "is_system_role": False,
            },
            {
                "name": "project_viewer",
                "description": "Project viewer with read-only access to project resources",
                "level": 40,
                "is_system_role": False,
            },
        ]

        created_roles = {}

        for role_data in default_roles:
            try:
                # Check if role already exists
                existing_role = await self.auth_manager.get_role_by_name(
                    role_data["name"]
                )
                if existing_role:
                    self.logger.info(
                        f"Role '{role_data['name']}' already exists, skipping"
                    )
                    created_roles[role_data["name"]] = existing_role
                    continue

                # Create role
                role_create = RoleCreate(**role_data)
                role = await self.auth_manager.create_role(role_create)
                created_roles[role_data["name"]] = role

                self.logger.info(f"Created role: {role.name} (level: {role.level})")

            except Exception as e:
                self.logger.error(f"Failed to create role '{role_data['name']}': {e}")
                raise

        # Set up role hierarchy
        await self._setup_role_hierarchy(created_roles)

        self.logger.info(f"Successfully created {len(created_roles)} default roles")
        return created_roles

    async def _setup_role_hierarchy(self, roles: Dict[str, Role]) -> None:
        """Set up role hierarchy relationships.

        Args:
            roles: Dictionary of created roles
        """
        self.logger.info("Setting up role hierarchy...")

        # Define hierarchy relationships
        hierarchy = {
            "admin": "system_admin",  # admin inherits from system_admin
            "manager": "admin",  # manager inherits from admin
            "user": "manager",  # user inherits from manager
            "guest": "user",  # guest inherits from user
            "project_admin": "manager",  # project_admin inherits from manager
            "project_member": "user",  # project_member inherits from user
            "project_viewer": "guest",  # project_viewer inherits from guest
        }

        for child_role_name, parent_role_name in hierarchy.items():
            try:
                if child_role_name in roles and parent_role_name in roles:
                    child_role = roles[child_role_name]
                    parent_role = roles[parent_role_name]

                    # Update child role with parent relationship
                    # Note: This would require an update method in AuthManager
                    # For now, we'll log the relationship
                    self.logger.info(
                        f"Role hierarchy: {child_role.name} (level {child_role.level}) "
                        f"inherits from {parent_role.name} (level {parent_role.level})"
                    )

            except Exception as e:
                self.logger.error(
                    f"Failed to set up hierarchy for {child_role_name}: {e}"
                )

    async def create_default_permissions(self) -> Dict[str, Permission]:
        """Create default permissions for all resource types and operations.

        Returns:
            Dict[str, Permission]: Dictionary of created permissions by name
        """
        self.logger.info("Creating default permissions...")

        # Define resource types and operations
        resource_types = [
            ResourceType.NOTE,
            ResourceType.TODO,
            ResourceType.EMAIL,
            ResourceType.RAG_DOCUMENT,
            ResourceType.ECS_WORLD,
            ResourceType.MCP_TOOL,
            ResourceType.USER,
            ResourceType.SYSTEM,
        ]

        operations = [
            Operation.CREATE,
            Operation.READ,
            Operation.UPDATE,
            Operation.DELETE,
            Operation.SHARE,
            Operation.EXECUTE,
            Operation.MANAGE,
        ]

        scopes = [
            PermissionScope.OWN,
            PermissionScope.TEAM,
            PermissionScope.ORGANIZATION,
            PermissionScope.GLOBAL,
        ]

        created_permissions = {}

        # Create permissions for each combination
        for resource_type in resource_types:
            for operation in operations:
                for scope in scopes:
                    permission_name = (
                        f"{resource_type.value}:{operation.value}:{scope.value}"
                    )

                    try:
                        # Check if permission already exists
                        # Note: We'd need a get_permission_by_name method in AuthManager
                        # For now, we'll create all permissions

                        permission_data = {
                            "name": permission_name,
                            "resource_type": resource_type,
                            "operation": operation,
                            "scope": scope,
                            "conditions": {},
                            "metadata": {
                                "description": f"Permission to {operation.value} {resource_type.value} resources at {scope.value} scope",
                                "category": "default",
                            },
                        }

                        permission_create = PermissionCreate(**permission_data)
                        permission = await self.auth_manager.create_permission(
                            permission_create
                        )
                        created_permissions[permission_name] = permission

                        self.logger.debug(f"Created permission: {permission.name}")

                    except Exception as e:
                        self.logger.error(
                            f"Failed to create permission '{permission_name}': {e}"
                        )
                        # Continue with other permissions rather than failing completely

        # Create some special permissions
        special_permissions = [
            {
                "name": "system:manage:global",
                "resource_type": ResourceType.SYSTEM,
                "operation": Operation.MANAGE,
                "scope": PermissionScope.GLOBAL,
                "conditions": {},
                "metadata": {
                    "description": "Full system management access",
                    "category": "system",
                },
            },
            {
                "name": "user:manage:global",
                "resource_type": ResourceType.USER,
                "operation": Operation.MANAGE,
                "scope": PermissionScope.GLOBAL,
                "conditions": {},
                "metadata": {
                    "description": "User management access",
                    "category": "user_management",
                },
            },
            {
                "name": "rbac:manage:global",
                "resource_type": ResourceType.SYSTEM,
                "operation": Operation.MANAGE,
                "scope": PermissionScope.GLOBAL,
                "conditions": {"rbac_management": True},
                "metadata": {
                    "description": "RBAC system management access",
                    "category": "rbac_management",
                },
            },
        ]

        for perm_data in special_permissions:
            try:
                permission_create = PermissionCreate(**perm_data)
                permission = await self.auth_manager.create_permission(
                    permission_create
                )
                created_permissions[perm_data["name"]] = permission

                self.logger.info(f"Created special permission: {permission.name}")

            except Exception as e:
                self.logger.error(
                    f"Failed to create special permission '{perm_data['name']}': {e}"
                )

        self.logger.info(
            f"Successfully created {len(created_permissions)} default permissions"
        )
        return created_permissions

    async def assign_permissions_to_roles(
        self, roles: Dict[str, Role], permissions: Dict[str, Permission]
    ) -> None:
        """Assign permissions to roles based on role hierarchy.

        Args:
            roles: Dictionary of roles by name
            permissions: Dictionary of permissions by name
        """
        self.logger.info("Assigning permissions to roles...")

        # Define role-permission mappings
        role_permissions = {
            "system_admin": [
                # System admin gets all permissions
                "system:manage:global",
                "user:manage:global",
                "rbac:manage:global",
            ],
            "admin": [
                # Admin gets most permissions except system management
                "user:manage:global",
                "note:manage:global",
                "todo:manage:global",
                "email:manage:global",
                "rag_document:manage:global",
                "ecs_world:manage:global",
                "mcp_tool:manage:global",
            ],
            "manager": [
                # Manager gets team-level permissions
                "user:manage:team",
                "note:manage:team",
                "todo:manage:team",
                "email:manage:team",
                "rag_document:manage:team",
                "ecs_world:manage:team",
                "mcp_tool:manage:team",
            ],
            "user": [
                # User gets own and team read permissions
                "note:create:own",
                "note:read:own",
                "note:update:own",
                "note:delete:own",
                "note:read:team",
                "todo:create:own",
                "todo:read:own",
                "todo:update:own",
                "todo:delete:own",
                "todo:read:team",
                "email:read:own",
                "email:create:own",
                "rag_document:read:own",
                "rag_document:create:own",
                "ecs_world:read:own",
                "mcp_tool:execute:own",
            ],
            "guest": [
                # Guest gets limited read permissions
                "note:read:own",
                "todo:read:own",
                "email:read:own",
                "rag_document:read:own",
                "ecs_world:read:own",
            ],
            "project_admin": [
                # Project admin gets project-level permissions
                "note:manage:team",
                "todo:manage:team",
                "email:manage:team",
                "rag_document:manage:team",
                "ecs_world:manage:team",
                "mcp_tool:manage:team",
            ],
            "project_member": [
                # Project member gets project access
                "note:create:own",
                "note:read:own",
                "note:update:own",
                "note:read:team",
                "todo:create:own",
                "todo:read:own",
                "todo:update:own",
                "todo:read:team",
                "email:read:own",
                "email:create:own",
                "rag_document:read:own",
                "rag_document:create:own",
                "ecs_world:read:own",
                "mcp_tool:execute:own",
            ],
            "project_viewer": [
                # Project viewer gets read-only access
                "note:read:own",
                "note:read:team",
                "todo:read:own",
                "todo:read:team",
                "email:read:own",
                "rag_document:read:own",
                "ecs_world:read:own",
            ],
        }

        # Assign permissions to roles
        for role_name, permission_names in role_permissions.items():
            if role_name not in roles:
                self.logger.warning(
                    f"Role '{role_name}' not found, skipping permission assignment"
                )
                continue

            role = roles[role_name]
            self.logger.info(f"Assigning permissions to role '{role_name}'...")

            for permission_name in permission_names:
                if permission_name in permissions:
                    permission = permissions[permission_name]

                    try:
                        # Note: We'd need a method to assign permissions to roles
                        # For now, we'll log the assignment
                        self.logger.info(
                            f"Would assign permission '{permission.name}' to role '{role.name}'"
                        )

                    except Exception as e:
                        self.logger.error(
                            f"Failed to assign permission '{permission_name}' to role '{role_name}': {e}"
                        )
                else:
                    self.logger.warning(f"Permission '{permission_name}' not found")

    async def bootstrap_system(self) -> Dict[str, Any]:
        """Bootstrap the entire RBAC system with default data.

        Returns:
            Dict[str, Any]: Summary of bootstrap results
        """
        self.logger.info("Starting RBAC system bootstrap...")

        try:
            # Create default roles
            roles = await self.create_default_roles()

            # Create default permissions
            permissions = await self.create_default_permissions()

            # Assign permissions to roles
            await self.assign_permissions_to_roles(roles, permissions)

            result = {
                "success": True,
                "roles_created": len(roles),
                "permissions_created": len(permissions),
                "roles": {name: role.name for name, role in roles.items()},
                "permissions": {name: perm.name for name, perm in permissions.items()},
            }

            self.logger.info("RBAC system bootstrap completed successfully")
            return result

        except Exception as e:
            self.logger.error(f"RBAC system bootstrap failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "roles_created": 0,
                "permissions_created": 0,
            }
