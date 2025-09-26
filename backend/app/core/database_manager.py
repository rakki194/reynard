#!/usr/bin/env python3
"""
Database Manager for Reynard Backend
====================================

Enhanced database connection management with automatic error recovery,
permission fixing, and extension installation.

Features:
- Automatic permission fixes for schema access
- Extension installation with proper error handling
- Connection retry logic with exponential backoff
- Superuser privilege detection and handling
- Comprehensive error logging and recovery suggestions

Author: Reynard Development Team
Version: 2.0.0
"""

import asyncio
import logging
import os
import time
from contextlib import contextmanager
from typing import Any, Dict, List, Optional, Tuple, Union

from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError, ProgrammingError, SQLAlchemyError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

from app.core.database_logger import (
    get_database_logger,
    log_database_operation,
    log_extension_operation,
    log_permission_operation,
    setup_connection_pool_logging,
    setup_sqlalchemy_logging,
)

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Enhanced database manager with automatic error recovery."""

    def __init__(
        self,
        database_url: str,
        database_name: str = "unknown",
        pool_size: int = 20,
        max_overflow: int = 30,
        pool_timeout: int = 30,
        pool_recycle: int = 3600,
        enable_logging: bool = True,
    ):
        self.database_url = database_url
        self.database_name = database_name
        self.pool_size = pool_size
        self.max_overflow = max_overflow
        self.pool_timeout = pool_timeout
        self.pool_recycle = pool_recycle

        # Setup logging
        self.db_logger = get_database_logger(database_name)

        # Create engine with enhanced configuration
        self.engine = self._create_engine()

        # Setup logging for the engine
        if enable_logging:
            setup_sqlalchemy_logging(self.engine, database_name)
            setup_connection_pool_logging(self.engine, database_name)

        # Session factory
        self.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )

        # Connection retry configuration
        self.max_retries = 3
        self.retry_delay = 1.0
        self.retry_backoff = 2.0

    def _create_engine(self) -> Engine:
        """Create SQLAlchemy engine with optimized settings."""
        return create_engine(
            self.database_url,
            poolclass=QueuePool,
            pool_size=self.pool_size,
            max_overflow=self.max_overflow,
            pool_timeout=self.pool_timeout,
            pool_recycle=self.pool_recycle,
            pool_pre_ping=True,  # Verify connections before use
            echo=False,  # Set to True for SQL logging
            future=True,
        )

    def _is_superuser(self) -> bool:
        """Check if the current database user has superuser privileges."""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT current_setting('is_superuser')"))
                return result.scalar() == 'on'
        except Exception as e:
            self.db_logger.log_connection_event("superuser_check_failed", error=e)
            return False

    def _fix_permissions(self) -> bool:
        """Fix database permissions for the current user."""
        try:
            with log_database_operation("fix_permissions", self.database_name):
                with self.engine.connect() as conn:
                    # Get current user
                    user_result = conn.execute(text("SELECT current_user"))
                    current_user = user_result.scalar()

                    # Grant permissions to current user on public schema
                    permission_queries = [
                        f"GRANT ALL ON SCHEMA public TO {current_user}",
                        f"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {current_user}",
                        f"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {current_user}",
                        f"GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO {current_user}",
                        f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {current_user}",
                        f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {current_user}",
                        f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO {current_user}",
                    ]

                    for query in permission_queries:
                        try:
                            conn.execute(text(query))
                            log_permission_operation(
                                "grant", "public", database_name=self.database_name
                            )
                        except Exception as e:
                            log_permission_operation(
                                "grant",
                                "public",
                                database_name=self.database_name,
                                error=e,
                            )
                            # Continue with other permissions even if some fail

                    conn.commit()
                    return True

        except Exception as e:
            log_permission_operation(
                "fix_permissions", "public", database_name=self.database_name, error=e
            )
            return False

    def _install_extension(
        self, extension_name: str, require_superuser: bool = False
    ) -> bool:
        """Install a PostgreSQL extension with proper error handling."""
        try:
            with log_database_operation(
                f"install_extension_{extension_name}", self.database_name
            ):
                # Check if extension is already installed
                with self.engine.connect() as conn:
                    check_query = text(
                        "SELECT 1 FROM pg_extension WHERE extname = :extname"
                    )
                    result = conn.execute(check_query, {"extname": extension_name})

                    if result.fetchone():
                        log_extension_operation(
                            extension_name,
                            "already_installed",
                            self.database_name,
                            True,
                        )
                        return True

                # Check superuser requirement
                if require_superuser and not self._is_superuser():
                    error_msg = (
                        f"Extension {extension_name} requires superuser privileges"
                    )
                    log_extension_operation(
                        extension_name,
                        "install_failed",
                        self.database_name,
                        False,
                        Exception(error_msg),
                    )
                    return False

                # Install extension
                with self.engine.connect() as conn:
                    # Use proper quoting for extension names with hyphens
                    if '-' in extension_name:
                        install_query = text(
                            f'CREATE EXTENSION IF NOT EXISTS "{extension_name}"'
                        )
                    else:
                        install_query = text(
                            f"CREATE EXTENSION IF NOT EXISTS {extension_name}"
                        )

                    conn.execute(install_query)
                    conn.commit()

                    log_extension_operation(
                        extension_name, "installed", self.database_name, True
                    )
                    return True

        except Exception as e:
            log_extension_operation(
                extension_name, "install_failed", self.database_name, False, e
            )
            return False

    def _test_connection(self) -> bool:
        """Test database connection with retry logic."""
        for attempt in range(self.max_retries):
            try:
                with self.engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                self.db_logger.log_connection_event("test_successful")
                return True
            except Exception as e:
                self.db_logger.log_connection_event(
                    f"test_failed_attempt_{attempt + 1}", error=e
                )
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (self.retry_backoff**attempt))
                else:
                    return False
        return False

    def initialize_database(
        self, required_extensions: Optional[List[str]] = None
    ) -> bool:
        """Initialize database with permissions and extensions."""
        if required_extensions is None:
            required_extensions = ["uuid-ossp", "pgcrypto", "vector"]

        try:
            # Test connection first
            if not self._test_connection():
                return False

            # Fix permissions
            self._fix_permissions()

            # Install required extensions
            extension_results = {}
            for extension in required_extensions:
                # Vector extension requires superuser
                require_superuser = extension == "vector"
                success = self._install_extension(extension, require_superuser)
                extension_results[extension] = success

            # Log results
            failed_extensions = [
                ext for ext, success in extension_results.items() if not success
            ]
            if failed_extensions:
                logger.warning(f"Failed to install extensions: {failed_extensions}")
                # Don't fail completely if only vector extension failed (common in non-superuser setups)
                if failed_extensions == ["vector"]:
                    logger.info(
                        "Vector extension failed - continuing without it (requires superuser)"
                    )
                    return True

            return all(extension_results.values())

        except Exception as e:
            self.db_logger.log_connection_event("initialization_failed", error=e)
            return False

    @contextmanager
    def get_session(self):
        """Get database session with automatic error handling."""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            self.db_logger.log_connection_event("session_error", error=e)
            raise
        finally:
            session.close()

    def execute_query(
        self, query: str, params: Optional[Dict[str, Any]] = None, fetch: bool = True
    ) -> Any:
        """Execute a query with automatic error handling and logging."""
        start_time = time.time()
        error = None

        try:
            with self.get_session() as session:
                result = session.execute(text(query), params or {})

                if fetch:
                    if query.strip().upper().startswith('SELECT'):
                        return result.fetchall()
                    else:
                        return result.rowcount
                else:
                    return result

        except Exception as e:
            error = e
            self.db_logger.log_query_event(
                query, (time.time() - start_time) * 1000, error=error
            )
            raise
        finally:
            if not error:
                self.db_logger.log_query_event(query, (time.time() - start_time) * 1000)

    def get_health_status(self) -> Dict[str, Any]:
        """Get database health status."""
        try:
            with self.get_session() as session:
                # Test basic connectivity
                session.execute(text("SELECT 1"))

                # Get connection pool status
                pool = self.engine.pool
                pool_status = {
                    "size": pool.size(),
                    "checked_out": pool.checkedout(),
                    "overflow": pool.overflow(),
                    "checked_in": pool.checkedin(),
                }

                # Get database info
                db_info = session.execute(
                    text(
                        """
                    SELECT 
                        current_database() as database_name,
                        current_user as user_name,
                        version() as version,
                        current_setting('is_superuser') as is_superuser
                """
                    )
                ).fetchone()

                return {
                    "status": "healthy",
                    "database_name": self.database_name,
                    "pool_status": pool_status,
                    "database_info": dict(db_info._mapping) if db_info else {},
                    "logger_health": self.db_logger.get_health_summary(),
                }

        except Exception as e:
            return {
                "status": "unhealthy",
                "database_name": self.database_name,
                "error": str(e),
                "logger_health": self.db_logger.get_health_summary(),
            }

    def close(self):
        """Close database connections."""
        try:
            self.engine.dispose()
            self.db_logger.log_connection_event("closed")
        except Exception as e:
            self.db_logger.log_connection_event("close_error", error=e)


# Global database managers
_db_managers: Dict[str, DatabaseManager] = {}


def get_database_manager(
    database_url: str, database_name: str = "unknown", **kwargs
) -> DatabaseManager:
    """Get or create database manager instance."""
    if database_name not in _db_managers:
        _db_managers[database_name] = DatabaseManager(
            database_url, database_name, **kwargs
        )
    return _db_managers[database_name]


def initialize_all_databases() -> Dict[str, bool]:
    """Initialize all configured databases."""
    results = {}

    # Main database
    main_url = os.getenv("DATABASE_URL")
    if main_url:
        main_manager = get_database_manager(main_url, "main")
        results["main"] = main_manager.initialize_database()

    # Auth database
    auth_url = os.getenv("AUTH_DATABASE_URL")
    if auth_url:
        auth_manager = get_database_manager(auth_url, "auth")
        results["auth"] = auth_manager.initialize_database()

    # ECS database
    ecs_url = os.getenv("ECS_DATABASE_URL")
    if ecs_url:
        ecs_manager = get_database_manager(ecs_url, "ecs")
        results["ecs"] = ecs_manager.initialize_database()

    return results


def get_all_database_health() -> Dict[str, Dict[str, Any]]:
    """Get health status for all database managers."""
    return {name: manager.get_health_status() for name, manager in _db_managers.items()}


def close_all_databases():
    """Close all database connections."""
    for manager in _db_managers.values():
        manager.close()
    _db_managers.clear()
