#!/usr/bin/env python3
"""
Database Logger for Reynard Backend
===================================

Comprehensive database logging with structured output, error handling,
and performance monitoring for PostgreSQL operations.

Features:
- Structured JSON logging for better analysis
- Connection pool monitoring
- Query performance tracking
- Error categorization and recovery suggestions
- Real-time database health monitoring
- Extension installation tracking
- Permission issue detection and resolution

Author: Reynard Development Team
Version: 2.0.0
"""

import asyncio
import json
import logging
import os
import time
import traceback
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timezone
from enum import Enum
from functools import wraps
from typing import Any, Dict, List, Optional, Union

from sqlalchemy import event, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError, ProgrammingError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy.pool import Pool

# Enhanced logging configuration
ENHANCED_LOGGING_ENABLED = (
    os.getenv("ENHANCED_DB_LOGGING_ENABLED", "true").lower() == "true"
)
STRUCTURED_LOGGING = os.getenv("STRUCTURED_DB_LOGGING", "true").lower() == "true"
PERFORMANCE_MONITORING = (
    os.getenv("DB_PERFORMANCE_MONITORING", "true").lower() == "true"
)
ERROR_RECOVERY_ENABLED = (
    os.getenv("DB_ERROR_RECOVERY_ENABLED", "true").lower() == "true"
)

# Performance thresholds
SLOW_QUERY_THRESHOLD_MS = float(os.getenv("SLOW_QUERY_THRESHOLD_MS", "100"))
CONNECTION_TIMEOUT_MS = float(os.getenv("CONNECTION_TIMEOUT_MS", "5000"))
POOL_WARNING_THRESHOLD = float(os.getenv("POOL_WARNING_THRESHOLD", "0.8"))

# Create enhanced loggers
enhanced_logger = logging.getLogger("reynard.db.enhanced")
connection_logger = logging.getLogger("reynard.db.connections")
query_logger = logging.getLogger("reynard.db.queries")
error_logger = logging.getLogger("reynard.db.errors")
performance_logger = logging.getLogger("reynard.db.performance")
extension_logger = logging.getLogger("reynard.db.extensions")


class DatabaseEventType(str, Enum):
    """Database event types for structured logging."""

    CONNECTION = "connection"
    QUERY = "query"
    TRANSACTION = "transaction"
    EXTENSION = "extension"
    PERMISSION = "permission"
    ERROR = "error"
    PERFORMANCE = "performance"
    POOL = "pool"


class ErrorSeverity(str, Enum):
    """Error severity levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DatabaseErrorCategory(str, Enum):
    """Database error categories."""

    CONNECTION = "connection"
    PERMISSION = "permission"
    SYNTAX = "syntax"
    EXTENSION = "extension"
    CONSTRAINT = "constraint"
    TIMEOUT = "timeout"
    LOCK = "lock"
    UNKNOWN = "unknown"


class DatabaseLogger:
    """Enhanced database logger with structured output and error analysis."""

    def __init__(self, database_name: str = "unknown"):
        self.database_name = database_name
        self.query_count = 0
        self.error_count = 0
        self.connection_count = 0
        self.start_time = time.time()

        # Setup structured logging
        if STRUCTURED_LOGGING:
            self._setup_structured_logging()

    def _setup_structured_logging(self):
        """Setup structured JSON logging."""
        for logger in [
            enhanced_logger,
            connection_logger,
            query_logger,
            error_logger,
            performance_logger,
            extension_logger,
        ]:
            if not logger.handlers:
                handler = logging.StreamHandler()
                formatter = logging.Formatter(
                    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
                )
                handler.setFormatter(formatter)
                logger.addHandler(handler)
                logger.setLevel(logging.INFO)

    def _create_log_entry(
        self,
        event_type: DatabaseEventType,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        error: Optional[Exception] = None,
        severity: ErrorSeverity = ErrorSeverity.LOW,
    ) -> Dict[str, Any]:
        """Create structured log entry."""
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "database": self.database_name,
            "event_type": event_type.value,
            "message": message,
            "severity": severity.value,
            "data": data or {},
            "metrics": {
                "query_count": self.query_count,
                "error_count": self.error_count,
                "connection_count": self.connection_count,
                "uptime_seconds": time.time() - self.start_time,
            },
        }

        if error:
            entry["error"] = {
                "type": type(error).__name__,
                "message": str(error),
                "category": self._categorize_error(error),
                "recovery_suggestion": self._get_recovery_suggestion(error),
            }

        return entry

    def _categorize_error(self, error: Exception) -> DatabaseErrorCategory:
        """Categorize database errors for better handling."""
        error_str = str(error).lower()

        if "permission denied" in error_str or "access denied" in error_str:
            return DatabaseErrorCategory.PERMISSION
        elif "syntax error" in error_str or "invalid syntax" in error_str:
            return DatabaseErrorCategory.SYNTAX
        elif "extension" in error_str and (
            "not found" in error_str or "create" in error_str
        ):
            return DatabaseErrorCategory.EXTENSION
        elif "connection" in error_str or "timeout" in error_str:
            return DatabaseErrorCategory.CONNECTION
        elif "constraint" in error_str or "violates" in error_str:
            return DatabaseErrorCategory.CONSTRAINT
        elif "lock" in error_str or "deadlock" in error_str:
            return DatabaseErrorCategory.LOCK
        else:
            return DatabaseErrorCategory.UNKNOWN

    def _get_recovery_suggestion(self, error: Exception) -> str:
        """Get recovery suggestion for database errors."""
        category = self._categorize_error(error)
        error_str = str(error).lower()

        suggestions = {
            DatabaseErrorCategory.PERMISSION: (
                "Grant necessary permissions to the database user. "
                "Run: GRANT ALL ON SCHEMA public TO your_user;"
            ),
            DatabaseErrorCategory.SYNTAX: (
                "Check SQL syntax, especially extension names with hyphens. "
                "Use quotes for extensions like 'uuid-ossp'."
            ),
            DatabaseErrorCategory.EXTENSION: (
                "Install required PostgreSQL extensions. "
                "For vector extension, ensure you have superuser privileges."
            ),
            DatabaseErrorCategory.CONNECTION: (
                "Check database connectivity and credentials. "
                "Verify database is running and accessible."
            ),
            DatabaseErrorCategory.CONSTRAINT: (
                "Check data constraints and foreign key relationships. "
                "Ensure referenced data exists."
            ),
            DatabaseErrorCategory.LOCK: (
                "Retry the operation after a short delay. "
                "Check for long-running transactions."
            ),
            DatabaseErrorCategory.UNKNOWN: (
                "Check database logs for more details. "
                "Consider database restart if issue persists."
            ),
        }

        return suggestions.get(category, suggestions[DatabaseErrorCategory.UNKNOWN])

    def log_connection_event(
        self,
        event: str,
        connection_id: Optional[str] = None,
        pool_size: Optional[int] = None,
        checked_out: Optional[int] = None,
        error: Optional[Exception] = None,
    ):
        """Log database connection events."""
        if not ENHANCED_LOGGING_ENABLED:
            return

        data = {
            "connection_id": connection_id,
            "pool_size": pool_size,
            "checked_out": checked_out,
            "pool_utilization": (
                checked_out / pool_size if pool_size and checked_out else None
            ),
        }

        severity = ErrorSeverity.HIGH if error else ErrorSeverity.LOW
        entry = self._create_log_entry(
            DatabaseEventType.CONNECTION, f"Connection {event}", data, error, severity
        )

        if error:
            self.error_count += 1
            error_logger.error(json.dumps(entry))
        else:
            self.connection_count += 1
            connection_logger.info(json.dumps(entry))

    def log_query_event(
        self,
        query: str,
        duration_ms: float,
        rows_affected: Optional[int] = None,
        error: Optional[Exception] = None,
    ):
        """Log database query events."""
        if not ENHANCED_LOGGING_ENABLED:
            return

        # Truncate long queries for logging
        query_preview = query[:200] + "..." if len(query) > 200 else query

        data = {
            "query_preview": query_preview,
            "query_length": len(query),
            "duration_ms": duration_ms,
            "rows_affected": rows_affected,
            "is_slow": duration_ms > SLOW_QUERY_THRESHOLD_MS,
        }

        severity = (
            ErrorSeverity.MEDIUM
            if error
            else (
                ErrorSeverity.LOW
                if duration_ms <= SLOW_QUERY_THRESHOLD_MS
                else ErrorSeverity.MEDIUM
            )
        )

        entry = self._create_log_entry(
            DatabaseEventType.QUERY,
            f"Query executed in {duration_ms:.2f}ms",
            data,
            error,
            severity,
        )

        if error:
            self.error_count += 1
            error_logger.error(json.dumps(entry))
        elif duration_ms > SLOW_QUERY_THRESHOLD_MS:
            performance_logger.warning(json.dumps(entry))
        else:
            self.query_count += 1
            query_logger.info(json.dumps(entry))

    def log_extension_event(
        self,
        extension_name: str,
        operation: str,
        success: bool,
        error: Optional[Exception] = None,
    ):
        """Log PostgreSQL extension events."""
        if not ENHANCED_LOGGING_ENABLED:
            return

        data = {
            "extension_name": extension_name,
            "operation": operation,
            "success": success,
        }

        severity = ErrorSeverity.HIGH if error else ErrorSeverity.LOW
        entry = self._create_log_entry(
            DatabaseEventType.EXTENSION,
            f"Extension {operation}: {extension_name}",
            data,
            error,
            severity,
        )

        if error:
            self.error_count += 1
            error_logger.error(json.dumps(entry))
        else:
            extension_logger.info(json.dumps(entry))

    def log_permission_event(
        self,
        operation: str,
        schema: str,
        table: Optional[str] = None,
        error: Optional[Exception] = None,
    ):
        """Log database permission events."""
        if not ENHANCED_LOGGING_ENABLED:
            return

        data = {"operation": operation, "schema": schema, "table": table}

        severity = ErrorSeverity.HIGH if error else ErrorSeverity.LOW
        entry = self._create_log_entry(
            DatabaseEventType.PERMISSION,
            f"Permission {operation} on {schema}.{table or 'schema'}",
            data,
            error,
            severity,
        )

        if error:
            self.error_count += 1
            error_logger.error(json.dumps(entry))
        else:
            enhanced_logger.info(json.dumps(entry))

    def get_health_summary(self) -> Dict[str, Any]:
        """Get database health summary."""
        uptime = time.time() - self.start_time
        return {
            "database": self.database_name,
            "uptime_seconds": uptime,
            "query_count": self.query_count,
            "error_count": self.error_count,
            "connection_count": self.connection_count,
            "queries_per_second": self.query_count / uptime if uptime > 0 else 0,
            "error_rate": self.error_count / max(self.query_count, 1),
            "status": (
                "healthy"
                if self.error_count == 0
                else "degraded" if self.error_count < 10 else "unhealthy"
            ),
        }


# Global logger instances
_db_loggers: Dict[str, DatabaseLogger] = {}


def get_database_logger(database_name: str) -> DatabaseLogger:
    """Get or create database logger instance."""
    if database_name not in _db_loggers:
        _db_loggers[database_name] = DatabaseLogger(database_name)
    return _db_loggers[database_name]


def setup_sqlalchemy_logging(engine: Engine, database_name: str):
    """Setup SQLAlchemy logging for an engine."""
    logger = get_database_logger(database_name)

    @event.listens_for(engine, "connect")
    def on_connect(dbapi_connection, connection_record):
        logger.log_connection_event("established", str(id(dbapi_connection)))

    @event.listens_for(engine, "checkout")
    def on_checkout(dbapi_connection, connection_record, connection_proxy):
        pool = engine.pool
        logger.log_connection_event(
            "checked_out", str(id(dbapi_connection)), pool.size(), pool.checkedout()
        )

    @event.listens_for(engine, "checkin")
    def on_checkin(dbapi_connection, connection_record):
        pool = engine.pool
        logger.log_connection_event(
            "checked_in", str(id(dbapi_connection)), pool.size(), pool.checkedout()
        )

    @event.listens_for(engine, "close")
    def on_close(dbapi_connection, connection_record):
        logger.log_connection_event("closed", str(id(dbapi_connection)))


def setup_connection_pool_logging(engine: Engine, database_name: str):
    """Setup connection pool logging."""
    logger = get_database_logger(database_name)

    @event.listens_for(engine.pool, "connect")
    def on_pool_connect(dbapi_connection, connection_record):
        logger.log_connection_event("pool_connect", str(id(dbapi_connection)))

    @event.listens_for(engine.pool, "invalidate")
    def on_pool_invalidate(dbapi_connection, connection_record, exception):
        logger.log_connection_event(
            "pool_invalidate", str(id(dbapi_connection)), error=exception
        )


@contextmanager
def log_database_operation(
    operation: str, database_name: str = "unknown", log_query: bool = True
):
    """Context manager for logging database operations."""
    logger = get_database_logger(database_name)
    start_time = time.time()
    error = None

    try:
        yield logger
    except Exception as e:
        error = e
        raise
    finally:
        duration_ms = (time.time() - start_time) * 1000

        if log_query:
            logger.log_query_event(operation, duration_ms, error=error)
        else:
            entry = logger._create_log_entry(
                DatabaseEventType.PERFORMANCE,
                f"Operation {operation} completed",
                {"duration_ms": duration_ms, "operation": operation},
                error,
            )
            if error:
                error_logger.error(json.dumps(entry))
            else:
                performance_logger.info(json.dumps(entry))


def log_extension_operation(
    extension_name: str,
    operation: str,
    database_name: str = "unknown",
    success: bool = True,
    error: Optional[Exception] = None,
):
    """Log PostgreSQL extension operations."""
    logger = get_database_logger(database_name)
    logger.log_extension_event(extension_name, operation, success, error)


def log_permission_operation(
    operation: str,
    schema: str,
    table: Optional[str] = None,
    database_name: str = "unknown",
    error: Optional[Exception] = None,
):
    """Log database permission operations."""
    logger = get_database_logger(database_name)
    logger.log_permission_event(operation, schema, table, error)


# Decorator for automatic query logging
def log_queries(database_name: str = "unknown"):
    """Decorator to automatically log database queries."""

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            with log_database_operation(
                f"{func.__name__}", database_name, log_query=True
            ) as logger:
                return func(*args, **kwargs)

        return wrapper

    return decorator


# Health monitoring functions
def get_all_database_health() -> Dict[str, Dict[str, Any]]:
    """Get health summary for all database loggers."""
    return {name: logger.get_health_summary() for name, logger in _db_loggers.items()}


def reset_database_logger(database_name: str):
    """Reset database logger statistics."""
    if database_name in _db_loggers:
        _db_loggers[database_name] = DatabaseLogger(database_name)
