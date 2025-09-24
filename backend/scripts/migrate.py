#!/usr/bin/env python3
"""Comprehensive migration management script for Reynard Backend.

This script provides a unified interface for managing all database migrations
across the different database configurations.
"""

import argparse
import logging
import os
import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from alembic import command
from alembic.config import Config

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Database configurations
DATABASES = {
    "main": {
        "name": "reynard",
        "config": "alembic_main.ini",
        "description": "Main application database (RAG/Vector store)",
        "migration_type": "sql",
    },
    "auth": {
        "name": "reynard_auth",
        "config": "alembic_auth.ini",
        "description": "Authentication database (Gatekeeper)",
        "migration_type": "gatekeeper",
    },
    "ecs": {
        "name": "reynard_ecs",
        "config": "alembic_ecs.ini",
        "description": "ECS world simulation database",
        "migration_type": "alembic",
    },
    "e2e": {
        "name": "reynard_e2e",
        "config": "alembic_e2e.ini",
        "description": "E2E testing database (mirror of main)",
        "migration_type": "sql",
    },
    "ecs_e2e": {
        "name": "reynard_ecs_e2e",
        "config": "alembic_ecs_e2e.ini",
        "description": "ECS E2E testing database (mirror of ECS)",
        "migration_type": "alembic",
    },
}


def run_sql_migrations(database_name: str) -> bool:
    """Run SQL migrations for a database."""
    try:
        from scripts.run_migrations import main as run_migrations

        # Set the database URL
        db_config = DATABASES[database_name]
        os.environ["DATABASE_URL"] = (
            f"postgresql://postgres:password@localhost:5432/{db_config['name']}"
        )

        logger.info(f"Running SQL migrations for {db_config['name']}...")
        run_migrations()
        logger.info(f"✅ SQL migrations completed for {db_config['name']}")
        return True

    except Exception as e:
        logger.error(f"❌ SQL migrations failed for {db_config['name']}: {e}")
        return False


def run_alembic_migrations(database_name: str, target: str = "head") -> bool:
    """Run Alembic migrations for a database."""
    try:
        db_config = DATABASES[database_name]
        config_path = backend_path / db_config["config"]

        if not config_path.exists():
            logger.error(f"❌ Alembic config not found: {config_path}")
            return False

        alembic_cfg = Config(str(config_path))
        command.upgrade(alembic_cfg, target)
        logger.info(
            f"✅ Alembic migrations completed for {db_config['name']} to {target}",
        )
        return True

    except Exception as e:
        logger.error(f"❌ Alembic migrations failed for {db_config['name']}: {e}")
        return False


def create_alembic_migration(database_name: str, message: str) -> bool:
    """Create a new Alembic migration for a database."""
    try:
        db_config = DATABASES[database_name]
        config_path = backend_path / db_config["config"]

        if not config_path.exists():
            logger.error(f"❌ Alembic config not found: {config_path}")
            return False

        alembic_cfg = Config(str(config_path))
        command.revision(alembic_cfg, autogenerate=True, message=message)
        logger.info(f"✅ Created new migration for {db_config['name']}: {message}")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to create migration for {db_config['name']}: {e}")
        return False


def show_migration_history(database_name: str) -> bool:
    """Show migration history for a database."""
    try:
        db_config = DATABASES[database_name]
        config_path = backend_path / db_config["config"]

        if not config_path.exists():
            logger.error(f"❌ Alembic config not found: {config_path}")
            return False

        alembic_cfg = Config(str(config_path))
        command.history(alembic_cfg)
        return True

    except Exception as e:
        logger.error(f"❌ Failed to show history for {db_config['name']}: {e}")
        return False


def copy_migrations():
    """Copy migrations between database configurations."""
    try:
        from scripts.copy_migrations import main as copy_migrations_main

        return copy_migrations_main() == 0
    except Exception as e:
        logger.error(f"❌ Failed to copy migrations: {e}")
        return False


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Reynard Backend Migration Manager")
    parser.add_argument(
        "action",
        choices=["upgrade", "create", "history", "copy"],
        help="Action to perform",
    )
    parser.add_argument(
        "database", choices=list(DATABASES.keys()), help="Database to operate on",
    )
    parser.add_argument(
        "--target", default="head", help="Target revision for upgrade (default: head)",
    )
    parser.add_argument("--message", help="Message for new migration")

    args = parser.parse_args()

    logger.info(f"🚀 Performing {args.action} on {args.database} database")

    db_config = DATABASES[args.database]
    logger.info(f"Database: {db_config['name']} - {db_config['description']}")

    success = False

    if args.action == "upgrade":
        if db_config["migration_type"] == "alembic":
            success = run_alembic_migrations(args.database, args.target)
        else:
            success = run_sql_migrations(args.database)

    elif args.action == "create":
        if db_config["migration_type"] != "alembic":
            logger.error("❌ Can only create migrations for Alembic-managed databases")
            return 1

        if not args.message:
            logger.error("❌ --message is required for creating migrations")
            return 1

        success = create_alembic_migration(args.database, args.message)

    elif args.action == "history":
        if db_config["migration_type"] != "alembic":
            logger.error("❌ Can only show history for Alembic-managed databases")
            return 1

        success = show_migration_history(args.database)

    elif args.action == "copy":
        success = copy_migrations()

    if success:
        logger.info("✅ Operation completed successfully")
        return 0
    logger.error("❌ Operation failed")
    return 1


if __name__ == "__main__":
    sys.exit(main())
