#!/usr/bin/env python3
"""🦊 Reynard Auth Demo RBAC Initialization

This script initializes the RBAC system with proper roles, permissions, and assignments
for the Reynard Auth Demo App.

Features:
- Creates RBAC roles with hierarchical structure
- Defines granular permissions
- Assigns permissions to roles
- Assigns roles to demo users
- Tests RBAC functionality

Author: Strategic-Prime-13 (Fox Specialist)
Version: 2.0.0 - RBAC Integrated
"""

import asyncio
import os
import sys
from pathlib import Path

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Add the main backend to the path for imports
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.gatekeeper_config import get_config, get_auth_manager, initialize_gatekeeper
from gatekeeper.models.user import UserRole
from gatekeeper.core.auth_manager import AuthManager
from gatekeeper.models.rbac import ResourceType, Operation, PermissionScope, RoleCreate, PermissionCreate

# Database configuration for auth-app
AUTH_APP_DATABASE_URL = os.getenv("AUTH_APP_DATABASE_URL")
if not AUTH_APP_DATABASE_URL:
    raise ValueError(
        "AUTH_APP_DATABASE_URL environment variable is required. "
        "Please set it in your .env file with the proper database connection string."
    )

# Override the main backend's database URL for this demo
os.environ["AUTH_DATABASE_URL"] = AUTH_APP_DATABASE_URL
os.environ["GATEKEEPER_USE_MEMORY_BACKEND"] = "false"


async def initialize_rbac_system():
    """Initialize the complete RBAC system with roles, permissions, and assignments."""
    print("🦊 Starting Reynard Auth Demo RBAC Initialization...")
    print("=" * 60)
    
    try:
        # Initialize Gatekeeper with RBAC
        print("🔐 Initializing Gatekeeper with RBAC...")
        auth_manager = await initialize_gatekeeper()
        print("✅ Gatekeeper initialized successfully!")
        
        # Create RBAC roles
        print("🔐 Creating RBAC roles...")
        await create_rbac_roles(auth_manager)
        print("✅ RBAC roles created!")
        
        # Create RBAC permissions
        print("🔐 Creating RBAC permissions...")
        await create_rbac_permissions(auth_manager)
        print("✅ RBAC permissions created!")
        
        # Assign permissions to roles
        print("🔐 Assigning permissions to roles...")
        await assign_permissions_to_roles(auth_manager)
        print("✅ Permissions assigned to roles!")
        
        # Assign roles to users
        print("🔐 Assigning roles to users...")
        await assign_roles_to_users(auth_manager)
        print("✅ Roles assigned to users!")
        
        # Test RBAC functionality
        print("🧪 Testing RBAC functionality...")
        await test_rbac_functionality(auth_manager)
        print("✅ RBAC functionality tested!")
        
        print("\n🎉 RBAC system initialization completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ RBAC initialization failed: {e}")
        raise


async def create_rbac_roles(auth_manager: AuthManager) -> None:
    """Create RBAC roles with hierarchical structure."""
    try:
        # Define role hierarchy
        roles = [
            {
                "name": "demo_admin",
                "description": "Demo Administrator with full system access",
                "level": 100,
                "is_system_role": False,
                "parent_role": None
            },
            {
                "name": "demo_moderator",
                "description": "Demo Moderator with content management access",
                "level": 75,
                "is_system_role": False,
                "parent_role": "demo_admin"
            },
            {
                "name": "demo_user",
                "description": "Demo Regular User with standard access",
                "level": 50,
                "is_system_role": False,
                "parent_role": "demo_moderator"
            },
            {
                "name": "demo_guest",
                "description": "Demo Guest with read-only access",
                "level": 25,
                "is_system_role": False,
                "parent_role": "demo_user"
            }
        ]
        
        for role_data in roles:
            try:
                # Create role using the AuthManager
                role_create = RoleCreate(
                    name=role_data["name"],
                    description=role_data["description"],
                    level=role_data["level"],
                    is_system_role=role_data["is_system_role"],
                    parent_role_id=None  # Will be set later if needed
                )
                await auth_manager.create_role(role_create)
                print(f"✅ Created role: {role_data['name']}")
                
            except Exception as e:
                if "already exists" in str(e).lower():
                    print(f"ℹ️  Role {role_data['name']} already exists")
                else:
                    print(f"⚠️  Failed to create role {role_data['name']}: {e}")
        
    except Exception as e:
        print(f"❌ Failed to create RBAC roles: {e}")
        raise


async def create_rbac_permissions(auth_manager: AuthManager) -> None:
    """Create RBAC permissions for different operations."""
    try:
        # Define permissions
        permissions = [
            # Admin permissions
            {
                "name": "admin_full_access",
                "resource_type": ResourceType.SYSTEM,
                "operation": Operation.MANAGE,
                "scope": PermissionScope.GLOBAL,
                "description": "Full administrative access to all system resources"
            },
            {
                "name": "user_management",
                "resource_type": ResourceType.USER,
                "operation": Operation.MANAGE,
                "scope": PermissionScope.GLOBAL,
                "description": "Manage users, roles, and permissions"
            },
            {
                "name": "system_config",
                "resource_type": ResourceType.SYSTEM,
                "operation": Operation.UPDATE,
                "scope": PermissionScope.GLOBAL,
                "description": "Configure system settings and parameters"
            },
            {
                "name": "audit_access",
                "resource_type": ResourceType.SYSTEM,
                "operation": Operation.READ,
                "scope": PermissionScope.GLOBAL,
                "description": "Access audit logs and security reports"
            },
            
            # Moderator permissions
            {
                "name": "moderate_content",
                "resource_type": ResourceType.RAG_DOCUMENT,
                "operation": Operation.UPDATE,
                "scope": PermissionScope.GLOBAL,
                "description": "Moderate user-generated content"
            },
            {
                "name": "user_support",
                "resource_type": ResourceType.USER,
                "operation": Operation.READ,
                "scope": PermissionScope.GLOBAL,
                "description": "Provide user support and assistance"
            },
            {
                "name": "limited_admin",
                "resource_type": ResourceType.SYSTEM,
                "operation": Operation.READ,
                "scope": PermissionScope.GLOBAL,
                "description": "Limited administrative functions"
            },
            
            # User permissions
            {
                "name": "read_content",
                "resource_type": ResourceType.RAG_DOCUMENT,
                "operation": Operation.READ,
                "scope": PermissionScope.GLOBAL,
                "description": "Read application content"
            },
            {
                "name": "write_content",
                "resource_type": ResourceType.RAG_DOCUMENT,
                "operation": Operation.CREATE,
                "scope": PermissionScope.OWN,
                "description": "Create and edit own content"
            },
            {
                "name": "profile_management",
                "resource_type": ResourceType.USER,
                "operation": Operation.UPDATE,
                "scope": PermissionScope.OWN,
                "description": "Manage own profile and settings"
            },
            
            # Guest permissions
            {
                "name": "read_public",
                "resource_type": ResourceType.RAG_DOCUMENT,
                "operation": Operation.READ,
                "scope": PermissionScope.GLOBAL,
                "description": "Read public content only"
            }
        ]
        
        for perm_data in permissions:
            try:
                # Create permission using the AuthManager
                permission_create = PermissionCreate(
                    name=perm_data["name"],
                    resource_type=perm_data["resource_type"],
                    operation=perm_data["operation"],
                    scope=perm_data["scope"],
                    description=perm_data["description"]
                )
                await auth_manager.create_permission(permission_create)
                print(f"✅ Created permission: {perm_data['name']}")
                
            except Exception as e:
                if "already exists" in str(e).lower():
                    print(f"ℹ️  Permission {perm_data['name']} already exists")
                else:
                    print(f"⚠️  Failed to create permission {perm_data['name']}: {e}")
        
    except Exception as e:
        print(f"❌ Failed to create RBAC permissions: {e}")
        raise


async def assign_permissions_to_roles(auth_manager: AuthManager) -> None:
    """Assign permissions to roles based on role hierarchy."""
    try:
        # Define role-permission assignments
        role_permissions = {
            "demo_admin": [
                "admin_full_access",
                "user_management", 
                "system_config",
                "audit_access",
                "moderate_content",
                "user_support",
                "limited_admin",
                "read_content",
                "write_content",
                "profile_management",
                "read_public"
            ],
            "demo_moderator": [
                "moderate_content",
                "user_support",
                "limited_admin",
                "read_content",
                "write_content",
                "profile_management",
                "read_public"
            ],
            "demo_user": [
                "read_content",
                "write_content",
                "profile_management",
                "read_public"
            ],
            "demo_guest": [
                "read_public"
            ]
        }
        
        for role_name, permission_names in role_permissions.items():
            for permission_name in permission_names:
                try:
                    await auth_manager.assign_permission_to_role(
                        role_name=role_name,
                        permission_name=permission_name
                    )
                    print(f"✅ Assigned permission {permission_name} to role {role_name}")
                    
                except Exception as e:
                    if "already assigned" in str(e).lower():
                        print(f"ℹ️  Permission {permission_name} already assigned to {role_name}")
                    else:
                        print(f"⚠️  Failed to assign permission {permission_name} to {role_name}: {e}")
        
    except Exception as e:
        print(f"❌ Failed to assign permissions to roles: {e}")
        raise


async def assign_roles_to_users(auth_manager: AuthManager) -> None:
    """Assign RBAC roles to demo users."""
    try:
        # Define user-role assignments
        user_roles = {
            "admin": "demo_admin",
            "moderator": "demo_moderator",
            "user": "demo_user",
            "guest": "demo_guest"
        }
        
        for username, role_name in user_roles.items():
            try:
                await auth_manager.assign_role_to_user(
                    username=username,
                    role_name=role_name
                )
                print(f"✅ Assigned role {role_name} to user {username}")
                
            except Exception as e:
                if "already assigned" in str(e).lower():
                    print(f"ℹ️  Role {role_name} already assigned to {username}")
                else:
                    print(f"⚠️  Failed to assign role {role_name} to {username}: {e}")
        
    except Exception as e:
        print(f"❌ Failed to assign roles to users: {e}")
        raise


async def test_rbac_functionality(auth_manager: AuthManager) -> None:
    """Test RBAC functionality with different users."""
    try:
        # Test admin permissions
        print("Testing admin permissions...")
        admin_tokens = await auth_manager.authenticate("admin", "Admin123!")
        if admin_tokens:
            admin_user = await auth_manager.get_current_user(admin_tokens.access_token)
            
            # Test admin permission check
            permission_result = await auth_manager.check_permission(
                username=admin_user.username,
                resource_type=ResourceType.SYSTEM,
                resource_id="config",
                operation=Operation.UPDATE
            )
            if permission_result and permission_result.granted:
                print("✅ Admin has system configuration permission")
            else:
                print("❌ Admin lacks system configuration permission")
        
        # Test user permissions
        print("Testing user permissions...")
        user_tokens = await auth_manager.authenticate("user", "User123!")
        if user_tokens:
            user_user = await auth_manager.get_current_user(user_tokens.access_token)
            
            # Test user permission check (should be denied for system config)
            permission_result = await auth_manager.check_permission(
                username=user_user.username,
                resource_type=ResourceType.SYSTEM,
                resource_id="config",
                operation=Operation.UPDATE
            )
            if not permission_result or not permission_result.granted:
                print("✅ User correctly denied system configuration permission")
            else:
                print("❌ User incorrectly granted system configuration permission")
            
            # Test user permission check (should be granted for own content)
            permission_result = await auth_manager.check_permission(
                username=user_user.username,
                resource_type=ResourceType.RAG_DOCUMENT,
                resource_id=user_user.username,
                operation=Operation.CREATE
            )
            if permission_result and permission_result.granted:
                print("✅ User has content creation permission")
            else:
                print("❌ User lacks content creation permission")
        
        # Test guest permissions
        print("Testing guest permissions...")
        guest_tokens = await auth_manager.authenticate("guest", "Guest123!")
        if guest_tokens:
            guest_user = await auth_manager.get_current_user(guest_tokens.access_token)
            
            # Test guest permission check (should be granted for public content)
            permission_result = await auth_manager.check_permission(
                username=guest_user.username,
                resource_type=ResourceType.RAG_DOCUMENT,
                resource_id="public",
                operation=Operation.READ
            )
            if permission_result and permission_result.granted:
                print("✅ Guest has public content read permission")
            else:
                print("❌ Guest lacks public content read permission")
            
            # Test guest permission check (should be denied for content creation)
            permission_result = await auth_manager.check_permission(
                username=guest_user.username,
                resource_type=ResourceType.RAG_DOCUMENT,
                resource_id="public",
                operation=Operation.CREATE
            )
            if not permission_result or not permission_result.granted:
                print("✅ Guest correctly denied content creation permission")
            else:
                print("❌ Guest incorrectly granted content creation permission")
        
    except Exception as e:
        print(f"❌ RBAC functionality test failed: {e}")
        raise


async def main():
    """Main function to initialize RBAC system."""
    try:
        await initialize_rbac_system()
        print("\n🎉 RBAC system initialization complete!")
        
    except Exception as e:
        print(f"💥 RBAC initialization failed: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
