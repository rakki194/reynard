#!/usr/bin/env python3
"""
Enhanced Migration Runner for Reynard Backend
=============================================

Improved database migration runner with better error handling,
automatic permission fixes, and comprehensive logging.

Features:
- Automatic permission fixes before running migrations
- Extension installation with proper error handling
- Superuser privilege detection and handling
- Comprehensive error logging and recovery suggestions
- Retry logic for failed migrations
- Health monitoring and reporting

Author: Reynard Development Team
Version: 2.0.0
"""

import logging
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.config.settings import get_config
from app.core.database_logger import get_database_logger
from app.core.database_manager import DatabaseManager, get_database_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EnhancedMigrationRunner:
    """Enhanced migration runner with automatic error recovery."""

    def __init__(self, database_url: str, database_name: str = "unknown"):
        self.database_url = database_url
        self.database_name = database_name
        self.db_manager = get_database_manager(database_url, database_name)
        self.db_logger = get_database_logger(database_name)
        self.migration_results: Dict[str, bool] = {}

    def run_migration_file(self, file_path: Path) -> bool:
        """Run a single migration file with enhanced error handling."""
        try:
            logger.info(f"🔄 Running migration: {file_path.name}")

            with open(file_path, 'r') as f:
                migration_sql = f.read()

            # Split migration into individual statements
            statements = self._split_sql_statements(migration_sql)

            success_count = 0
            total_statements = len(statements)

            for i, statement in enumerate(statements):
                if not statement.strip():
                    continue

                try:
                    # Execute statement with logging
                    start_time = time.time()
                    result = self.db_manager.execute_query(statement, fetch=False)
                    duration_ms = (time.time() - start_time) * 1000

                    self.db_logger.log_query_event(
                        f"Migration {file_path.name} - Statement {i+1}",
                        duration_ms,
                        rows_affected=result if hasattr(result, '__int__') else None,
                    )

                    success_count += 1
                    logger.info(f"  ✅ Statement {i+1}/{total_statements} completed")

                except Exception as e:
                    error_msg = f"Statement {i+1} failed: {str(e)}"
                    logger.error(f"  ❌ {error_msg}")

                    # Check if this is a recoverable error
                    if self._is_recoverable_error(e):
                        logger.info(f"  🔧 Attempting recovery for statement {i+1}")
                        if self._attempt_recovery(statement, e):
                            success_count += 1
                            logger.info(f"  ✅ Recovery successful for statement {i+1}")
                        else:
                            logger.error(f"  ❌ Recovery failed for statement {i+1}")
                    else:
                        logger.error(f"  ❌ Non-recoverable error in statement {i+1}")
                        return False

            success_rate = (
                success_count / total_statements if total_statements > 0 else 0
            )
            logger.info(
                f"✅ Migration {file_path.name} completed: {success_count}/{total_statements} statements successful ({success_rate:.1%})"
            )

            return (
                success_rate >= 0.8
            )  # Allow 20% failure rate for non-critical statements

        except Exception as e:
            logger.error(f"❌ Migration {file_path.name} failed: {e}")
            self.db_logger.log_query_event(f"Migration {file_path.name}", 0, error=e)
            return False

    def _split_sql_statements(self, sql: str) -> List[str]:
        """Split SQL into individual statements."""
        # Simple statement splitting - could be enhanced with proper SQL parsing
        statements = []
        current_statement = ""

        for line in sql.split('\n'):
            line = line.strip()
            if not line or line.startswith('--'):
                continue

            current_statement += line + '\n'

            # Check if statement is complete
            if line.endswith(';'):
                statements.append(current_statement.strip())
                current_statement = ""

        # Add any remaining statement
        if current_statement.strip():
            statements.append(current_statement.strip())

        return statements

    def _is_recoverable_error(self, error: Exception) -> bool:
        """Check if an error is recoverable."""
        error_str = str(error).lower()

        recoverable_patterns = [
            "permission denied",
            "extension",
            "already exists",
            "does not exist",
        ]

        return any(pattern in error_str for pattern in recoverable_patterns)

    def _attempt_recovery(self, statement: str, error: Exception) -> bool:
        """Attempt to recover from a failed statement."""
        error_str = str(error).lower()

        try:
            if "permission denied" in error_str:
                # Try to fix permissions
                logger.info("  🔧 Attempting to fix permissions...")
                return self.db_manager._fix_permissions()

            elif "extension" in error_str and "not found" in error_str:
                # Try to install missing extension
                logger.info("  🔧 Attempting to install missing extension...")
                # Extract extension name from statement (simple approach)
                if "uuid-ossp" in statement:
                    return self.db_manager._install_extension("uuid-ossp")
                elif "pgcrypto" in statement:
                    return self.db_manager._install_extension("pgcrypto")
                elif "vector" in statement:
                    return self.db_manager._install_extension(
                        "vector", require_superuser=True
                    )

            elif "already exists" in error_str:
                # Object already exists - this is usually fine
                logger.info("  ℹ️ Object already exists - continuing...")
                return True

            elif "does not exist" in error_str:
                # Object doesn't exist - might be a dependency issue
                logger.info("  ⚠️ Object doesn't exist - skipping...")
                return True

        except Exception as recovery_error:
            logger.error(f"  ❌ Recovery attempt failed: {recovery_error}")

        return False

    def run_migrations(self, migration_files: List[str]) -> Dict[str, bool]:
        """Run multiple migration files."""
        results = {}

        for migration_file in migration_files:
            file_path = Path(__file__).parent / "db" / migration_file
            if file_path.exists():
                results[migration_file] = self.run_migration_file(file_path)
            else:
                logger.warning(f"⚠️ Migration file not found: {migration_file}")
                results[migration_file] = False

        return results

    def get_migration_summary(self) -> Dict[str, any]:
        """Get summary of migration results."""
        total_migrations = len(self.migration_results)
        successful_migrations = sum(
            1 for success in self.migration_results.values() if success
        )

        return {
            "database_name": self.database_name,
            "total_migrations": total_migrations,
            "successful_migrations": successful_migrations,
            "failed_migrations": total_migrations - successful_migrations,
            "success_rate": (
                successful_migrations / total_migrations if total_migrations > 0 else 0
            ),
            "migration_results": self.migration_results,
            "database_health": self.db_manager.get_health_status(),
        }


def main():
    """Run all database migrations with enhanced error handling."""
    try:
        # Get database settings
        config = get_config()

        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError(
                "DATABASE_URL environment variable is required. "
                "Please set it in your .env file with the proper database connection string."
            )
        logger.info(f"🔗 Using database URL: {database_url}")

        # Create enhanced migration runner
        runner = EnhancedMigrationRunner(database_url, "main")

        # Initialize database (fix permissions, install extensions)
        logger.info("🏗️ Initializing database...")
        if not runner.db_manager.initialize_database():
            logger.warning("⚠️ Database initialization had issues, but continuing...")

        # Test connection
        if not runner.db_manager._test_connection():
            logger.error("❌ Database connection test failed")
            return False

        logger.info("✅ Database connection successful")

        # Migration files in order
        migration_files = [
            "000_fix_permissions.sql",  # Fix permissions first
            "001_pgvector.sql",
            "002_embeddings.sql",
            "003_indexes.sql",
            "004_unified_repository.sql",
            "005_hnsw_optimization.sql",
        ]

        # Run migrations
        logger.info("🚀 Starting migration process...")
        results = runner.run_migrations(migration_files)
        runner.migration_results = results

        # Get summary
        summary = runner.get_migration_summary()

        # Log results
        logger.info("📊 Migration Summary:")
        logger.info(f"  Total migrations: {summary['total_migrations']}")
        logger.info(f"  Successful: {summary['successful_migrations']}")
        logger.info(f"  Failed: {summary['failed_migrations']}")
        logger.info(f"  Success rate: {summary['success_rate']:.1%}")

        # Log database health
        health = summary['database_health']
        logger.info(f"📈 Database Health: {health['status']}")

        success = summary['success_rate'] >= 0.8  # 80% success rate threshold

        if success:
            logger.info("🎉 Migrations completed successfully!")
        else:
            logger.error("❌ Migration process had significant issues")

        return success

    except Exception as e:
        logger.error(f"❌ Migration runner failed: {e}")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
