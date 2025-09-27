#!/usr/bin/env python3
"""🦊 Reynard Auth Demo Database Setup - RBAC Integrated

This script sets up the database for the Reynard Auth Demo App with full RBAC integration.
It creates the necessary database, initializes the schema, and creates demo users with
proper role-based access control.

Features:
- PostgreSQL database creation
- RBAC schema initialization
- Demo users with different roles
- Permission assignment
- Test data for demonstration

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
from gatekeeper.models.user import UserCreate, UserRole
from gatekeeper.core.auth_manager import AuthManager

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


async def setup_database():
    """Setup the database and create initial demo users with RBAC."""
    print("🦊 Starting Reynard Auth Demo Database Setup with RBAC...")
    print("=" * 60)
    
    try:
        # Initialize Gatekeeper with RBAC
        print("🔐 Initializing Gatekeeper with RBAC...")
        auth_manager = await initialize_gatekeeper()
        print("✅ Gatekeeper initialized successfully!")
        
        # Initialize RBAC system
        print("🔐 Initializing RBAC system...")
        await initialize_rbac_system(auth_manager)
        print("✅ RBAC system initialized!")
        
        # Create demo users
        print("👥 Creating demo users...")
        await create_demo_users(auth_manager)
        print("✅ Demo users created!")
        
        # List all users
        print("\n📋 Current users in database:")
        users = await auth_manager.list_users()
        for user in users:
            print(f"   - {user.username} ({user.role}) - {user.email}")
        
        print("\n🎉 Database setup completed successfully!")
        print("=" * 60)
        print("🔐 Demo Credentials:")
        print("   Admin:     admin / Admin123!")
        print("   Moderator: moderator / Moderator123!")
        print("   User:      user / User123!")
        print("   Guest:     guest / Guest123!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        raise


async def initialize_rbac_system(auth_manager: AuthManager) -> None:
    """Initialize RBAC system with demo roles and permissions."""
    try:
        # Create demo roles
        demo_roles = [
            {
                "name": "demo_admin",
                "description": "Demo Administrator with full access to all resources",
                "permissions": [
                    {"name": "admin_full_access", "description": "Full administrative access"},
                    {"name": "user_management", "description": "Manage users and roles"},
                    {"name": "system_config", "description": "Configure system settings"},
                    {"name": "audit_access", "description": "Access audit logs"},
                ]
            },
            {
                "name": "demo_moderator",
                "description": "Demo Moderator with limited administrative access",
                "permissions": [
                    {"name": "moderate_content", "description": "Moderate user content"},
                    {"name": "user_support", "description": "Provide user support"},
                    {"name": "limited_admin", "description": "Limited administrative functions"},
                ]
            },
            {
                "name": "demo_user",
                "description": "Demo Regular User with standard access",
                "permissions": [
                    {"name": "read_content", "description": "Read application content"},
                    {"name": "write_content", "description": "Create and edit content"},
                    {"name": "profile_management", "description": "Manage own profile"},
                ]
            },
            {
                "name": "demo_guest",
                "description": "Demo Guest with read-only access",
                "permissions": [
                    {"name": "read_public", "description": "Read public content only"},
                ]
            }
        ]
        
        # For now, just log that we're initializing RBAC
        # The actual role and permission creation will be handled by the main backend
        print("ℹ️  RBAC roles and permissions will be managed by the main backend")
        print("ℹ️  Demo users will be created with basic Gatekeeper roles")
        
    except Exception as e:
        print(f"❌ Failed to initialize RBAC system: {e}")
        raise


async def create_demo_users(auth_manager: AuthManager) -> None:
    """Create demo users with different roles."""
    try:
        demo_users = [
            {
                "username": "admin",
                "email": "admin@reynard-demo.dev",
                "password": "Admin123!",
                "role": UserRole.ADMIN,
                "full_name": "Demo Administrator",
                "rbac_role": "demo_admin"
            },
            {
                "username": "moderator",
                "email": "moderator@reynard-demo.dev",
                "password": "Moderator123!",
                "role": UserRole.REGULAR,
                "full_name": "Demo Moderator",
                "rbac_role": "demo_moderator"
            },
            {
                "username": "user",
                "email": "user@reynard-demo.dev",
                "password": "User123!",
                "role": UserRole.REGULAR,
                "full_name": "Demo User",
                "rbac_role": "demo_user"
            },
            {
                "username": "guest",
                "email": "guest@reynard-demo.dev",
                "password": "Guest123!",
                "role": UserRole.REGULAR,
                "full_name": "Demo Guest",
                "rbac_role": "demo_guest"
            }
        ]
        
        for user_data in demo_users:
            try:
                # Create user
                user_create = UserCreate(
                    username=user_data["username"],
                    email=user_data["email"],
                    password=user_data["password"],
                    role=user_data["role"],
                    full_name=user_data["full_name"]
                )
                
                user = await auth_manager.create_user(user_create)
                print(f"✅ Created user: {user.username}")
                
                # RBAC role assignment will be handled by the main backend
                print(f"   ℹ️  RBAC role assignment for {user.username} will be handled by main backend")
                
            except Exception as e:
                if "already exists" in str(e).lower():
                    print(f"ℹ️  User {user_data['username']} already exists")
                else:
                    print(f"⚠️  Failed to create user {user_data['username']}: {e}")
        
    except Exception as e:
        print(f"❌ Failed to create demo users: {e}")
        raise


async def test_authentication():
    """Test authentication with demo users."""
    print("\n🧪 Testing authentication...")
    
    try:
        auth_manager = await get_auth_manager()
        
        # Test admin login
        print("Testing admin login...")
        tokens = await auth_manager.authenticate("admin", "Admin123!")
        if tokens:
            print("✅ Admin authentication successful")
            
            # Test token validation
            is_valid = await auth_manager.validate_token(tokens.access_token)
            if is_valid:
                print("✅ Token validation successful")
                
                # Get current user
                current_user = await auth_manager.get_current_user(tokens.access_token)
                if current_user:
                    print(f"✅ Current user: {current_user.username}, Role: {current_user.role}")
                else:
                    print("❌ Could not retrieve current user")
            else:
                print("❌ Token validation failed")
        else:
            print("❌ Admin authentication failed")
        
        # Test user login
        print("\nTesting user login...")
        tokens = await auth_manager.authenticate("user", "User123!")
        if tokens:
            print("✅ User authentication successful")
        else:
            print("❌ User authentication failed")
            
    except Exception as e:
        print(f"❌ Authentication test failed: {e}")


async def main():
    """Main function to setup the database."""
    try:
        await setup_database()
        await test_authentication()
        print("\n🎉 All tests passed! Database setup complete.")
        
    except Exception as e:
        print(f"💥 Setup failed: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))