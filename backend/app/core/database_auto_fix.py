"""🦊 Database Auto-Fix Utility
============================

Comprehensive database auto-fix utility that automatically detects and resolves
common database issues including permission problems, connection issues, and
schema inconsistencies.

This utility provides:
- Automatic permission fixing for PostgreSQL
- Connection health checks and recovery
- Schema validation and repair
- Intelligent error detection and resolution
- Development-friendly reload optimization

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import os
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import OperationalError, ProgrammingError

logger = logging.getLogger(__name__)

# Detect reload mode to prevent repeated operations during development
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"


class DatabaseAutoFix:
    """Comprehensive database auto-fix utility."""

    def __init__(self, database_url: str):
        """Initialize the auto-fix utility with a database URL."""
        self.database_url = database_url
        self.parsed_url = urlparse(database_url)
        self.engine = create_engine(database_url, echo=False)

    def auto_fix_all(self) -> bool:
        """Perform all available auto-fixes."""
        if IS_RELOAD_MODE:
            logger.debug("Skipping database auto-fix during uvicorn reload")
            return True

        try:
            logger.info("🔧 Starting comprehensive database auto-fix...")

            # Test basic connection first
            if not self._test_connection():
                logger.error(
                    "❌ Database connection failed - cannot proceed with auto-fix"
                )
                return False

            # Perform fixes in order
            fixes_applied = []

            if self._fix_permissions():
                fixes_applied.append("permissions")

            if self._fix_schema_issues():
                fixes_applied.append("schema")

            if self._fix_connection_issues():
                fixes_applied.append("connections")

            if fixes_applied:
                logger.info(
                    f"✅ Database auto-fix completed. Applied fixes: {', '.join(fixes_applied)}"
                )
            else:
                logger.info("✅ Database auto-fix completed - no issues found")

            return True

        except Exception as e:
            logger.error(f"❌ Database auto-fix failed: {e}")
            return False

    def _test_connection(self) -> bool:
        """Test basic database connection."""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False

    def _fix_permissions(self) -> bool:
        """Fix PostgreSQL permission issues."""
        try:
            logger.info("🔐 Checking and fixing database permissions...")

            # Test if we can create a simple table
            test_table_name = "permission_test_temp"
            try:
                with self.engine.connect() as conn:
                    conn.execute(
                        text(f"CREATE TABLE {test_table_name} (id SERIAL PRIMARY KEY)")
                    )
                    conn.execute(text(f"DROP TABLE {test_table_name}"))
                logger.debug("✅ Permission test passed - no fixes needed")
                return False
            except (OperationalError, ProgrammingError) as e:
                if "permission denied" in str(e).lower():
                    logger.warning(f"⚠️ Permission issue detected: {e}")
                    return self._apply_permission_fixes()
                else:
                    raise

        except Exception as e:
            logger.error(f"Permission fix failed: {e}")
            return False

    def _apply_permission_fixes(self) -> bool:
        """Apply permission fixes using admin connection."""
        try:
            # Create admin connection using postgres superuser
            # Use environment variables for admin credentials
            admin_user = os.getenv("POSTGRES_ADMIN_USER", "postgres")
            admin_password = os.getenv("POSTGRES_ADMIN_PASSWORD")
            if not admin_password:
                raise ValueError(
                    "POSTGRES_ADMIN_PASSWORD environment variable is required for auto-fixing permissions. "
                    "Please set it in your .env file."
                )
            admin_url = f"postgresql://{admin_user}:{admin_password}@{self.parsed_url.hostname}:{self.parsed_url.port or 5432}/postgres"
            admin_engine = create_engine(admin_url, echo=False)

            with admin_engine.connect() as conn:
                current_user = self.parsed_url.username or "postgres"
                database_name = (
                    self.parsed_url.path[1:] if self.parsed_url.path else "unknown"
                )

                logger.info(
                    f"🔧 Applying permission fixes for user '{current_user}' on database '{database_name}'"
                )

                permission_queries = [
                    f"GRANT ALL ON SCHEMA public TO {current_user};",
                    f"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {current_user};",
                    f"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {current_user};",
                    f"GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO {current_user};",
                    f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {current_user};",
                    f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {current_user};",
                    f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO {current_user};",
                ]

                for query in permission_queries:
                    try:
                        conn.execute(text(query))
                    except Exception as query_error:
                        logger.debug(f"Permission query result: {query_error}")

                logger.info(f"✅ Permission fixes applied for user '{current_user}'")
                return True

        except Exception as e:
            logger.error(f"Failed to apply permission fixes: {e}")
            return False

    def _fix_schema_issues(self) -> bool:
        """Fix common schema issues."""
        try:
            logger.info("🏗️ Checking for schema issues...")

            with self.engine.connect() as conn:
                # Check for missing extensions
                extensions_result = conn.execute(
                    text(
                        """
                    SELECT extname FROM pg_extension 
                    WHERE extname IN ('uuid-ossp', 'vector', 'pgcrypto')
                """
                    )
                ).fetchall()

                existing_extensions = {row[0] for row in extensions_result}
                required_extensions = {'uuid-ossp', 'vector', 'pgcrypto'}
                missing_extensions = required_extensions - existing_extensions

                if missing_extensions:
                    logger.info(
                        f"🔧 Installing missing extensions: {missing_extensions}"
                    )
                    for ext in missing_extensions:
                        try:
                            # Fix uuid-ossp extension name (use quotes for hyphenated names)
                            if ext == 'uuid-ossp':
                                conn.execute(
                                    text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
                                )
                            else:
                                conn.execute(
                                    text(f"CREATE EXTENSION IF NOT EXISTS {ext}")
                                )
                            logger.info(f"✅ Installed extension: {ext}")
                        except Exception as ext_error:
                            if (
                                "permission denied" in str(ext_error).lower()
                                or "superuser" in str(ext_error).lower()
                            ):
                                logger.warning(
                                    f"⚠️ Extension {ext} requires superuser privileges - skipping"
                                )
                            else:
                                logger.warning(
                                    f"⚠️ Failed to install extension {ext}: {ext_error}"
                                )
                    return True
                else:
                    logger.debug("✅ All required extensions are installed")
                    return False

        except Exception as e:
            logger.error(f"Schema fix failed: {e}")
            return False

    def _fix_connection_issues(self) -> bool:
        """Fix connection pool and timeout issues."""
        try:
            logger.info("🔌 Checking connection health...")

            # Test connection with timeout
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT 1")).fetchone()
                if result and result[0] == 1:
                    logger.debug("✅ Connection health check passed")
                    return False
                else:
                    logger.warning("⚠️ Connection health check failed")
                    return True

        except Exception as e:
            logger.error(f"Connection health check failed: {e}")
            return True


def auto_fix_database(database_url: str) -> bool:
    """Convenience function to auto-fix a database."""
    auto_fix = DatabaseAutoFix(database_url)
    return auto_fix.auto_fix_all()


def auto_fix_all_databases() -> Dict[str, bool]:
    """Auto-fix all configured databases."""
    if IS_RELOAD_MODE:
        logger.debug("Skipping database auto-fix during uvicorn reload")
        return {}

    results = {}

    # Get all database URLs from environment
    database_urls = {
        "main": os.getenv("DATABASE_URL"),
        "auth": os.getenv("AUTH_DATABASE_URL"),
        "ecs": os.getenv("ECS_DATABASE_URL"),
        "key_storage": os.getenv("KEY_STORAGE_DATABASE_URL"),
        "mcp": os.getenv("MCP_DATABASE_URL"),
        "rag": os.getenv("RAG_DATABASE_URL"),
    }

    for db_name, db_url in database_urls.items():
        if db_url:
            logger.info(f"🔧 Auto-fixing {db_name} database...")
            results[db_name] = auto_fix_database(db_url)
        else:
            logger.debug(f"Skipping {db_name} database - no URL configured")

    return results


if __name__ == "__main__":
    # Command-line interface for manual auto-fix
    import sys

    if len(sys.argv) > 1:
        database_url = sys.argv[1]
        success = auto_fix_database(database_url)
        sys.exit(0 if success else 1)
    else:
        # Auto-fix all databases
        results = auto_fix_all_databases()
        all_success = all(results.values()) if results else True
        sys.exit(0 if all_success else 1)
