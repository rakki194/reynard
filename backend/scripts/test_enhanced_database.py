#!/usr/bin/env python3
"""
Test Enhanced Database System
============================

Test script for the enhanced database logging and management system.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database_logger import get_all_database_health
from app.core.database_manager import get_database_manager, initialize_all_databases

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_database_connection():
    """Test basic database connection."""
    logger.info("🔗 Testing database connection...")

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError(
            "DATABASE_URL environment variable is required. "
            "Please set it in your .env file with the proper database connection string."
        )

    try:
        manager = get_database_manager(database_url, "test")

        # Test connection
        if manager._test_connection():
            logger.info("✅ Database connection successful")
        else:
            logger.error("❌ Database connection failed")
            return False

        # Test health status
        health = manager.get_health_status()
        logger.info(f"📊 Database health: {health['status']}")

        return True

    except Exception as e:
        logger.error(f"❌ Database test failed: {e}")
        return False


def test_database_initialization():
    """Test database initialization with permissions and extensions."""
    logger.info("🏗️ Testing database initialization...")

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError(
            "DATABASE_URL environment variable is required. "
            "Please set it in your .env file with the proper database connection string."
        )

    try:
        manager = get_database_manager(database_url, "test_init")

        # Initialize database
        success = manager.initialize_database()

        if success:
            logger.info("✅ Database initialization successful")
        else:
            logger.warning("⚠️ Database initialization had issues")

        return success

    except Exception as e:
        logger.error(f"❌ Database initialization test failed: {e}")
        return False


def test_query_execution():
    """Test query execution with logging."""
    logger.info("📝 Testing query execution...")

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError(
            "DATABASE_URL environment variable is required. "
            "Please set it in your .env file with the proper database connection string."
        )

    try:
        manager = get_database_manager(database_url, "test_query")

        # Test simple query
        result = manager.execute_query("SELECT 1 as test_value")
        logger.info(f"✅ Query result: {result}")

        # Test query with error (should be handled gracefully)
        try:
            manager.execute_query("SELECT * FROM non_existent_table")
        except Exception as e:
            logger.info(f"✅ Error handling works: {type(e).__name__}")

        return True

    except Exception as e:
        logger.error(f"❌ Query execution test failed: {e}")
        return False


def test_health_monitoring():
    """Test health monitoring and logging."""
    logger.info("📈 Testing health monitoring...")

    try:
        # Get health for all databases
        health_summary = get_all_database_health()

        logger.info("📊 Database Health Summary:")
        for db_name, health in health_summary.items():
            logger.info(f"  {db_name}: {health.get('status', 'unknown')}")

        return True

    except Exception as e:
        logger.error(f"❌ Health monitoring test failed: {e}")
        return False


def main():
    """Run all database tests."""
    logger.info("🚀 Starting Enhanced Database System Tests")

    tests = [
        ("Database Connection", test_database_connection),
        ("Database Initialization", test_database_initialization),
        ("Query Execution", test_query_execution),
        ("Health Monitoring", test_health_monitoring),
    ]

    results = {}

    for test_name, test_func in tests:
        logger.info(f"\n🧪 Running test: {test_name}")
        try:
            results[test_name] = test_func()
        except Exception as e:
            logger.error(f"❌ Test {test_name} crashed: {e}")
            results[test_name] = False

    # Summary
    logger.info("\n📊 Test Results Summary:")
    passed = 0
    total = len(results)

    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        logger.info(f"  {test_name}: {status}")
        if success:
            passed += 1

    logger.info(f"\n🎯 Overall: {passed}/{total} tests passed ({passed/total:.1%})")

    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
