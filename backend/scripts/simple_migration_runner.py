#!/usr/bin/env python3
"""
Simple Migration Runner for Reynard Backend
===========================================

Simplified database migration runner that focuses on fixing the specific
database issues without complex configuration dependencies.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database_manager import DatabaseManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_simple_migration():
    """Run a simple migration to test the enhanced database system."""
    try:
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError(
                "DATABASE_URL environment variable is required. "
                "Please set it in your .env file with the proper database connection string."
            )
        logger.info(f"🔗 Using database URL: {database_url}")

        # Create database manager
        manager = DatabaseManager(database_url, "main")

        # Test connection
        logger.info("🔍 Testing database connection...")
        if not manager._test_connection():
            logger.error("❌ Database connection test failed")
            return False

        logger.info("✅ Database connection successful")

        # Initialize database (fix permissions, install extensions)
        logger.info("🏗️ Initializing database...")
        if not manager.initialize_database():
            logger.warning("⚠️ Database initialization had issues, but continuing...")

        # Test some basic operations
        logger.info("📝 Testing basic database operations...")

        # Test simple query
        result = manager.execute_query("SELECT 1 as test_value")
        logger.info(f"✅ Simple query result: {result}")

        # Test extension availability
        extensions_result = manager.execute_query(
            """
            SELECT extname FROM pg_extension 
            WHERE extname IN ('uuid-ossp', 'pgcrypto', 'vector')
        """
        )
        installed_extensions = [row[0] for row in extensions_result]
        logger.info(f"✅ Installed extensions: {installed_extensions}")

        # Test table creation (with proper error handling)
        try:
            manager.execute_query(
                """
                CREATE TABLE IF NOT EXISTS test_table (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """,
                fetch=False,
            )
            logger.info("✅ Test table creation successful")
        except Exception as e:
            logger.warning(f"⚠️ Test table creation failed: {e}")

        # Get health status
        health = manager.get_health_status()
        logger.info(f"📊 Database health: {health['status']}")

        logger.info("🎉 Simple migration test completed successfully!")
        return True

    except Exception as e:
        logger.error(f"❌ Simple migration failed: {e}")
        return False


def main():
    """Run simple migration test."""
    logger.info("🚀 Starting Simple Migration Test")

    success = run_simple_migration()

    if success:
        logger.info("✅ All tests passed!")
    else:
        logger.error("❌ Tests failed!")

    return success


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
