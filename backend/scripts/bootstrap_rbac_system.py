#!/usr/bin/env python3
"""Script to bootstrap the entire RBAC system.

This script sets up the complete RBAC system including:
1. Running database migrations
2. Creating default roles and permissions
3. Setting up an admin user
4. Verifying the system is working correctly
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.gatekeeper_config import get_auth_manager
from gatekeeper.core.rbac_bootstrap import RBACBootstrapService

# Set up logging
logging.basicConfig(
    level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def run_migrations():
    """Run database migrations for RBAC tables."""
    logger.info("Running database migrations...")

    try:
        import os
        import subprocess

        # Change to backend directory
        os.chdir(backend_dir)

        # Run the RBAC migration
        result = subprocess.run(
            ["alembic", "-c", "alembic_auth.ini", "upgrade", "head"],
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            logger.info("Database migrations completed successfully")
            return True
        else:
            logger.error(f"Migration failed: {result.stderr}")
            return False

    except Exception as e:
        logger.error(f"Failed to run migrations: {e}")
        return False


async def bootstrap_rbac_data():
    """Bootstrap RBAC system with default data."""
    logger.info("Bootstrapping RBAC system with default data...")

    try:
        # Get the auth manager
        auth_manager = get_auth_manager()

        # Create bootstrap service
        bootstrap_service = RBACBootstrapService(auth_manager)

        # Bootstrap the system
        result = await bootstrap_service.bootstrap_system()

        if result["success"]:
            logger.info(f"RBAC bootstrap completed successfully!")
            logger.info(f"  Roles created: {result['roles_created']}")
            logger.info(f"  Permissions created: {result['permissions_created']}")
            return True
        else:
            logger.error(
                f"RBAC bootstrap failed: {result.get('error', 'Unknown error')}"
            )
            return False

    except Exception as e:
        logger.error(f"Failed to bootstrap RBAC data: {e}")
        return False

    finally:
        # Close the auth manager
        if 'auth_manager' in locals():
            await auth_manager.close()


async def setup_admin_user():
    """Set up an admin user with full permissions."""
    logger.info("Setting up admin user...")

    try:
        # Import and run the admin user setup
        from setup_admin_user import setup_admin_user as setup_admin

        success = await setup_admin()
        return success

    except Exception as e:
        logger.error(f"Failed to setup admin user: {e}")
        return False


async def verify_system():
    """Verify that the RBAC system is working correctly."""
    logger.info("Verifying RBAC system...")

    try:
        # Get the auth manager
        auth_manager = get_auth_manager()

        # Test role retrieval
        system_admin_role = await auth_manager.get_role_by_name("system_admin")
        if not system_admin_role:
            logger.error("system_admin role not found")
            return False

        logger.info(f"✓ system_admin role found (level: {system_admin_role.level})")

        # Test user roles
        admin_roles = await auth_manager.get_user_roles("admin")
        if not admin_roles:
            logger.error("Admin user has no roles assigned")
            return False

        logger.info(f"✓ Admin user has {len(admin_roles)} roles assigned")

        # Test permission check
        permission_result = await auth_manager.check_permission(
            "admin", "system", "rbac", "manage"
        )

        if permission_result.granted:
            logger.info("✓ Admin user has system management permissions")
        else:
            logger.error(
                f"✗ Admin user permission check failed: {permission_result.reason}"
            )
            return False

        # Test RBAC-enabled user
        admin_user = await auth_manager.get_user_by_username("admin")
        if admin_user and admin_user.rbac_enabled:
            logger.info("✓ Admin user has RBAC enabled")
        else:
            logger.error("✗ Admin user does not have RBAC enabled")
            return False

        logger.info("RBAC system verification completed successfully!")
        return True

    except Exception as e:
        logger.error(f"Failed to verify RBAC system: {e}")
        return False

    finally:
        # Close the auth manager
        if 'auth_manager' in locals():
            await auth_manager.close()


async def main():
    """Main function to bootstrap the entire RBAC system."""
    logger.info("Starting RBAC system bootstrap...")

    steps = [
        ("Database Migrations", run_migrations),
        ("RBAC Data Bootstrap", bootstrap_rbac_data),
        ("Admin User Setup", setup_admin_user),
        ("System Verification", verify_system),
    ]

    for step_name, step_func in steps:
        logger.info(f"\n{'='*50}")
        logger.info(f"Step: {step_name}")
        logger.info(f"{'='*50}")

        try:
            success = await step_func()
            if not success:
                logger.error(f"Step '{step_name}' failed!")
                sys.exit(1)
        except Exception as e:
            logger.error(f"Step '{step_name}' failed with exception: {e}")
            sys.exit(1)

    logger.info(f"\n{'='*50}")
    logger.info("🎉 RBAC System Bootstrap Completed Successfully!")
    logger.info(f"{'='*50}")
    logger.info("The RBAC system is now ready for use.")
    logger.info("\nAdmin User Credentials:")
    logger.info("  Username: admin")
    logger.info("  Password: admin123!@#")
    logger.info("  Role: system_admin")
    logger.info("  RBAC Enabled: Yes")
    logger.info("\nYou can now start using the RBAC system for access control!")


if __name__ == "__main__":
    asyncio.run(main())
