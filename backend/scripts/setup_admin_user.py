#!/usr/bin/env python3
"""Script to set up an admin user with full RBAC permissions.

This script creates an admin user and assigns them the system_admin role
with full permissions to manage the RBAC system.
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.gatekeeper_config import get_auth_manager
from gatekeeper.models.rbac import RoleCreate
from gatekeeper.models.user import UserCreate, UserRole

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def setup_admin_user():
    """Set up an admin user with full RBAC permissions."""

    logger.info("Setting up admin user with RBAC permissions...")

    try:
        # Get the auth manager
        auth_manager = get_auth_manager()

        # Check if system_admin role exists
        system_admin_role = await auth_manager.get_role_by_name("system_admin")
        if not system_admin_role:
            logger.error(
                "system_admin role not found. Please run the RBAC bootstrap first."
            )
            return False

        # Create admin user
        admin_user_data = UserCreate(
            username="admin",
            password=os.getenv(
                "ADMIN_USER_PASSWORD", "admin123!@#"
            ),  # In production, this should be a secure password
            email="admin@reynard.local",
            role=UserRole.ADMIN,
            rbac_enabled=True,
            default_role="system_admin",
        )

        # Check if admin user already exists
        try:
            existing_user = await auth_manager.get_user_by_username("admin")
            if existing_user:
                logger.info("Admin user already exists, updating RBAC settings...")

                # Enable RBAC for existing user
                success = await auth_manager.enable_rbac_for_user(
                    "admin", "system_admin"
                )
                if success:
                    logger.info("Successfully enabled RBAC for existing admin user")
                    return True
                else:
                    logger.error("Failed to enable RBAC for existing admin user")
                    return False
        except Exception:
            # User doesn't exist, create new one
            pass

        # Create new admin user
        try:
            admin_user = await auth_manager.create_user(admin_user_data)
            logger.info(f"Created admin user: {admin_user.username}")
        except Exception as e:
            logger.error(f"Failed to create admin user: {e}")
            return False

        # Assign system_admin role
        success = await auth_manager.assign_role_to_user("admin", "system_admin")
        if success:
            logger.info("Successfully assigned system_admin role to admin user")
        else:
            logger.error("Failed to assign system_admin role to admin user")
            return False

        # Verify the setup
        user_roles = await auth_manager.get_user_roles("admin")
        logger.info(f"Admin user roles: {[role['role_name'] for role in user_roles]}")

        # Test permission check
        permission_result = await auth_manager.check_permission(
            "admin", "system", "rbac", "manage"
        )
        logger.info(f"Admin permission check result: {permission_result.granted}")

        logger.info("Admin user setup completed successfully!")
        logger.info("Admin credentials:")
        logger.info("  Username: admin")
        logger.info("  Password: admin123!@#")
        logger.info("  Role: system_admin")
        logger.info("  RBAC Enabled: Yes")

        return True

    except Exception as e:
        logger.error(f"Failed to setup admin user: {e}")
        return False

    finally:
        # Close the auth manager
        if 'auth_manager' in locals():
            await auth_manager.close()


async def main():
    """Main function."""
    logger.info("Starting admin user setup...")

    success = await setup_admin_user()

    if success:
        logger.info("Admin user setup completed successfully!")
        sys.exit(0)
    else:
        logger.error("Admin user setup failed!")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
