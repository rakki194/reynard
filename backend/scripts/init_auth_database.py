#!/usr/bin/env python3
"""
Initialize the authentication database with Gatekeeper.

This script verifies that the Gatekeeper authentication system can connect
to the dedicated auth database. Gatekeeper manages its own table creation.
"""

import logging
import os
import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine, text

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Get database URL from environment
AUTH_DATABASE_URL = os.getenv(
    "AUTH_DATABASE_URL", "postgresql://postgres:password@localhost:5432/reynard_auth"
)


def verify_database_connection():
    """Verify that we can connect to the auth database."""
    try:
        logger.info(f"Connecting to auth database: {AUTH_DATABASE_URL}")
        engine = create_engine(AUTH_DATABASE_URL)

        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection successful")

        return True

    except Exception as e:
        logger.error(f"❌ Failed to connect to auth database: {e}")
        return False


def verify_gatekeeper_setup():
    """Verify that Gatekeeper can connect and use the database."""
    try:
        logger.info("Testing Gatekeeper initialization...")

        # Temporarily set the auth database URL
        original_url = os.environ.get("AUTH_DATABASE_URL")
        os.environ["AUTH_DATABASE_URL"] = AUTH_DATABASE_URL

        try:
            # Import and initialize Gatekeeper
            import asyncio

            from app.gatekeeper_config import initialize_gatekeeper

            # Run the async initialization
            auth_manager = asyncio.run(initialize_gatekeeper())
            logger.info("✅ Gatekeeper initialization successful")

            return True

        finally:
            # Restore original URL
            if original_url:
                os.environ["AUTH_DATABASE_URL"] = original_url
            else:
                os.environ.pop("AUTH_DATABASE_URL", None)

    except Exception as e:
        logger.error(f"❌ Gatekeeper verification failed: {e}")
        return False


def main():
    """Main initialization function."""
    logger.info("🚀 Verifying Reynard Auth Database Setup")

    # Verify database connection
    if not verify_database_connection():
        logger.error("💥 Failed to connect to auth database")
        return 1

    # Verify Gatekeeper setup
    if not verify_gatekeeper_setup():
        logger.error("💥 Gatekeeper verification failed")
        return 1

    logger.info("🎉 Auth database verification completed successfully!")
    logger.info("ℹ️ Gatekeeper manages its own table creation automatically")
    return 0


if __name__ == "__main__":
    sys.exit(main())
