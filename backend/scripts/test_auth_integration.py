#!/usr/bin/env python3
"""
Test authentication integration through the codebase.

This script tests that the authentication system works correctly
with the created admin account.
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from app.gatekeeper_config import get_auth_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def test_auth_integration():
    """Test authentication integration."""
    try:
        logger.info("🧪 Testing authentication integration...")

        # Get auth manager
        auth_manager = await get_auth_manager()
        logger.info("✅ Auth manager initialized")

        # Test credentials from the private file
        username = "reynard-ai-admin-2025"
        password = "F#avRF*KoRUoFOv8ptsW"

        # Test authentication
        logger.info(f"Testing authentication for user: {username}")
        tokens = await auth_manager.authenticate(username, password)

        if tokens:
            logger.info("✅ Authentication successful")
            logger.info(f"Access token: {tokens.access_token[:30]}...")
            logger.info(f"Refresh token: {tokens.refresh_token[:30]}...")

            # Test token validation
            is_valid = await auth_manager.validate_token(tokens.access_token)
            if is_valid:
                logger.info("✅ Token validation successful")

                # Test getting current user
                current_user = await auth_manager.get_current_user(tokens.access_token)
                if current_user:
                    logger.info(f"✅ Current user: {current_user.username}")
                    logger.info(f"✅ User role: {current_user.role}")
                    logger.info(f"✅ User email: {current_user.email}")
                    logger.info(f"✅ User active: {current_user.is_active}")

                    # Test role validation
                    is_admin = await auth_manager.validate_token(
                        tokens.access_token, "admin"
                    )
                    if is_admin:
                        logger.info("✅ Admin role validation successful")
                    else:
                        logger.error("❌ Admin role validation failed")
                        return False
                else:
                    logger.error("❌ Could not get current user")
                    return False
            else:
                logger.error("❌ Token validation failed")
                return False
        else:
            logger.error("❌ Authentication failed")
            return False

        logger.info("🎉 All authentication tests passed!")
        return True

    except Exception as e:
        logger.error(f"❌ Authentication integration test failed: {e}")
        return False


async def test_user_management():
    """Test user management operations."""
    try:
        logger.info("🧪 Testing user management operations...")

        # Get auth manager
        auth_manager = await get_auth_manager()

        # Test getting user by username
        user = await auth_manager.get_user_by_username("reynard-ai-admin-2025")
        if user:
            logger.info(f"✅ Retrieved user: {user.username}")
            logger.info(f"✅ User ID: {user.id}")
            logger.info(f"✅ User role: {user.role}")
        else:
            logger.error("❌ Could not retrieve user")
            return False

        # Test listing users (if method exists)
        try:
            users = await auth_manager.list_users()
            logger.info(f"✅ Listed {len(users)} users")
        except AttributeError:
            logger.info("ℹ️ list_users method not available")

        logger.info("🎉 User management tests passed!")
        return True

    except Exception as e:
        logger.error(f"❌ User management test failed: {e}")
        return False


async def main():
    """Main test function."""
    logger.info("🚀 Starting Reynard Authentication Integration Tests")

    # Test authentication
    auth_success = await test_auth_integration()
    if not auth_success:
        logger.error("💥 Authentication integration test failed")
        return 1

    # Test user management
    user_mgmt_success = await test_user_management()
    if not user_mgmt_success:
        logger.error("💥 User management test failed")
        return 1

    logger.info("🎉 All tests passed! Authentication system is working correctly.")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
