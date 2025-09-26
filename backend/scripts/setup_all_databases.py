#!/usr/bin/env python3
"""Comprehensive database setup script for Reynard Backend.

This script sets up all databases with their appropriate schemas:
- Main database (reynard): RAG/Vector store + Gatekeeper auth
- ECS database (reynard_ecs): ECS world simulation
- E2E database (reynard_e2e): Testing mirror of main database
- ECS E2E database (reynard_ecs_e2e): Testing mirror of ECS database
"""

import logging
import os
import sys
from pathlib import Path
from typing import Any

# Add backend to Python path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Database configurations
DATABASES = {
    "main": {
        "name": "reynard",
        "url": "postgresql://postgres:password@localhost:5432/reynard",
        "description": "Main application database (RAG/Vector store)",
        "migration_type": "sql",  # Uses SQL migrations
        "alembic_config": "alembic_main.ini",
    },
    "auth": {
        "name": "reynard_auth",
        "url": "postgresql://postgres:password@localhost:5432/reynard_auth",
        "description": "Authentication database (Gatekeeper)",
        "migration_type": "gatekeeper",  # Gatekeeper manages its own schema
        "alembic_config": "alembic_auth.ini",
    },
    "ecs": {
        "name": "reynard_ecs",
        "url": "postgresql://postgres:password@localhost:5432/reynard_ecs",
        "description": "ECS world simulation database",
        "migration_type": "alembic",
        "alembic_config": "alembic_ecs.ini",
    },
    "e2e": {
        "name": "reynard_e2e",
        "url": "postgresql://postgres:password@localhost:5432/reynard_e2e",
        "description": "E2E testing database (mirror of main)",
        "migration_type": "sql",  # Uses SQL migrations
        "alembic_config": "alembic_e2e.ini",
    },
    "ecs_e2e": {
        "name": "reynard_ecs_e2e",
        "url": "postgresql://postgres:password@localhost:5432/reynard_ecs_e2e",
        "description": "ECS E2E testing database (mirror of ECS)",
        "migration_type": "alembic",
        "alembic_config": "alembic_ecs_e2e.ini",
    },
}


def test_database_connection(database_url: str, database_name: str) -> bool:
    """Test database connection."""
    try:
        engine = create_engine(database_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ %s connection successful", database_name)
        return True
    except Exception as e:
        logger.error("❌ %s connection failed: %s", database_name, e)
        return False


def enable_pgvector_extension(database_url: str, database_name: str) -> bool:
    """Enable pgvector extension in database."""
    try:
        engine = create_engine(database_url)
        with engine.connect() as conn:
            # Enable pgvector extension
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
        logger.info("✅ pgvector extension enabled in %s", database_name)
        return True
    except Exception as e:
        logger.error("❌ Failed to enable pgvector in %s: %s", database_name, e)
        return False


def run_sql_migrations(database_url: str, database_name: str) -> bool:
    """Run SQL migrations for main/E2E databases."""
    try:
        # Import and run the SQL migration script
        from run_migrations import main as run_migrations

        # Temporarily set the database URL
        original_url = os.environ.get("DATABASE_URL")
        os.environ["DATABASE_URL"] = database_url

        try:
            run_migrations()
            logger.info("✅ SQL migrations completed for %s", database_name)
            return True
        finally:
            # Restore original URL
            if original_url:
                os.environ["DATABASE_URL"] = original_url
            else:
                os.environ.pop("DATABASE_URL", None)

    except Exception as e:
        logger.error("❌ SQL migrations failed for %s: %s", database_name, e)
        return False


def initialize_gatekeeper(database_url: str, database_name: str) -> bool:
    """Initialize Gatekeeper authentication system."""
    try:
        # Temporarily set the auth database URL
        original_url = os.environ.get("AUTH_DATABASE_URL")
        os.environ["AUTH_DATABASE_URL"] = database_url

        try:
            # Import and run the auth database verification script
            from init_auth_database import (
                verify_database_connection,
                verify_gatekeeper_setup,
            )

            # Verify database connection
            if not verify_database_connection():
                logger.error(
                    "❌ Failed to connect to auth database for %s",
                    database_name,
                )
                return False

            # Verify Gatekeeper setup (Gatekeeper manages its own table creation)
            if not verify_gatekeeper_setup():
                logger.error("❌ Gatekeeper verification failed for %s", database_name)
                return False

            logger.info("✅ Gatekeeper initialized for %s", database_name)
            logger.info("ℹ️ Gatekeeper manages its own table creation automatically")
            return True
        finally:
            # Restore original URL
            if original_url:
                os.environ["AUTH_DATABASE_URL"] = original_url
            else:
                os.environ.pop("AUTH_DATABASE_URL", None)

    except Exception as e:
        logger.error("❌ Gatekeeper initialization failed for %s: %s", database_name, e)
        return False


def run_alembic_migrations(alembic_config_path: str, database_name: str) -> bool:
    """Run Alembic migrations."""
    try:
        config_path = backend_path / alembic_config_path
        if not config_path.exists():
            logger.error("❌ Alembic config not found: %s", config_path)
            return False

        alembic_cfg = Config(str(config_path))
        command.upgrade(alembic_cfg, "head")
        logger.info("✅ Alembic migrations completed for %s", database_name)
        return True
    except Exception as e:
        logger.error("❌ Alembic migrations failed for %s: %s", database_name, e)
        return False


def setup_database(db_key: str, db_config: dict[str, Any]) -> bool:
    """Set up a single database."""
    database_name = db_config["name"]
    database_url = db_config["url"]
    description = db_config["description"]
    migration_type = db_config["migration_type"]
    alembic_config = db_config["alembic_config"]

    logger.info("🔧 Setting up %s: %s", database_name, description)

    # Test connection
    if not test_database_connection(database_url, database_name):
        return False

    # Enable pgvector extension
    if not enable_pgvector_extension(database_url, database_name):
        return False

    # Run migrations based on type
    if migration_type == "sql":
        if not run_sql_migrations(database_url, database_name):
            return False
    elif migration_type == "alembic" and alembic_config:
        if not run_alembic_migrations(alembic_config, database_name):
            return False
    elif migration_type == "gatekeeper":
        # Gatekeeper manages its own schema, just initialize it
        if not initialize_gatekeeper(database_url, database_name):
            return False

    logger.info("✅ %s setup completed successfully", database_name)
    return True


def main():
    """Main setup function."""
    logger.info("🚀 Starting comprehensive database setup for Reynard Backend")

    success_count = 0
    total_count = len(DATABASES)

    for db_key, db_config in DATABASES.items():
        if setup_database(db_key, db_config):
            success_count += 1
        else:
            logger.error("❌ Failed to setup %s", db_config["name"])

    logger.info(
        "📊 Setup Summary: %d/%d databases configured successfully",
        success_count,
        total_count,
    )

    if success_count == total_count:
        logger.info("🎉 All databases configured successfully!")
        return 0
    logger.error("💥 Some databases failed to configure")
    return 1


if __name__ == "__main__":
    sys.exit(main())
