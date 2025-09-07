#!/usr/bin/env python3
"""
Test script to demonstrate professional logging functionality
Run this script to see the logging system in action
"""

import os
import time

from logging_config import (
    get_app_logger,
    get_route_logger,
    get_service_logger,
    setup_logging,
)


def test_logging():
    """Test various logging scenarios"""

    # Setup logging
    setup_logging()

    # Get different loggers
    app_logger = get_app_logger()
    service_logger = get_service_logger("database")
    route_logger = get_route_logger("users")

    print("🦊> Testing Professional Logging System...")
    print("=" * 50)

    # Test different log levels
    app_logger.debug("This is a debug message - only visible if LOG_LEVEL=DEBUG")
    app_logger.info("Application started successfully")
    app_logger.warning("This is a warning message")
    app_logger.error("This is an error message")

    # Test service logging
    service_logger.info("Database connection established")
    service_logger.warning("Database connection pool is 80% full")
    service_logger.error("Database connection failed", exc_info=True)

    # Test route logging
    route_logger.info("User endpoint accessed")
    route_logger.info("User authentication successful")
    route_logger.warning("Rate limit approaching for user")

    # Test with exception
    try:
        raise ValueError("This is a test exception")
    except Exception as e:
        app_logger.error(f"Caught exception: {e}", exc_info=True)

    print("=" * 50)
    print("🦦> Logging test completed! Check the console output above.")
    print("📁 Log files are created in the 'logs/' directory")
    print("🔧 Try different LOG_LEVEL values (DEBUG, INFO, WARNING, ERROR)")
    print("📝 Check log_conf.yaml for detailed configuration options")


if __name__ == "__main__":
    test_logging()
