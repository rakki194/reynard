"""Debug Logging Configuration for Reynard Backend

This module provides comprehensive debug logging for:
- PostgreSQL queries across all databases
- RAG operations (indexing, caching, search)
- Caching operations
- Performance metrics
- Database connection monitoring

Debug logging is disabled by default and controlled via environment variables.
"""

import asyncio
import json
import logging
import os
import time
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timezone
from functools import wraps
from typing import Any, Callable, Dict, List, Optional, Union

from sqlalchemy import event, text
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy.pool import Pool

# Debug logging configuration
DEBUG_LOGGING_ENABLED = os.getenv("DEBUG_LOGGING_ENABLED", "false").lower() == "true"
DEBUG_SQL_QUERIES = os.getenv("DEBUG_SQL_QUERIES", "false").lower() == "true"
DEBUG_RAG_OPERATIONS = os.getenv("DEBUG_RAG_OPERATIONS", "false").lower() == "true"
DEBUG_CACHE_OPERATIONS = os.getenv("DEBUG_CACHE_OPERATIONS", "false").lower() == "true"
DEBUG_DATABASE_CONNECTIONS = (
    os.getenv("DEBUG_DATABASE_CONNECTIONS", "false").lower() == "true"
)
DEBUG_PERFORMANCE_METRICS = (
    os.getenv("DEBUG_PERFORMANCE_METRICS", "false").lower() == "true"
)

# Performance thresholds
SLOW_QUERY_THRESHOLD_MS = float(os.getenv("SLOW_QUERY_THRESHOLD_MS", "100"))
SLOW_RAG_OPERATION_THRESHOLD_MS = float(
    os.getenv("SLOW_RAG_OPERATION_THRESHOLD_MS", "500")
)
SLOW_CACHE_OPERATION_THRESHOLD_MS = float(
    os.getenv("SLOW_CACHE_OPERATION_THRESHOLD_MS", "50")
)

# Create debug loggers
debug_logger = logging.getLogger("reynard.debug")
sql_logger = logging.getLogger("reynard.debug.sql")
rag_logger = logging.getLogger("reynard.debug.rag")
cache_logger = logging.getLogger("reynard.debug.cache")
db_conn_logger = logging.getLogger("reynard.debug.db_connections")
perf_logger = logging.getLogger("reynard.debug.performance")

# Set debug loggers to DEBUG level when enabled
if DEBUG_LOGGING_ENABLED:
    debug_logger.setLevel(logging.DEBUG)
    sql_logger.setLevel(logging.DEBUG)
    rag_logger.setLevel(logging.DEBUG)
    cache_logger.setLevel(logging.DEBUG)
    db_conn_logger.setLevel(logging.DEBUG)
    perf_logger.setLevel(logging.DEBUG)


class DebugLogContext:
    """Context manager for debug logging with structured data."""

    def __init__(self, logger: logging.Logger, operation: str, **context_data):
        self.logger = logger
        self.operation = operation
        self.context_data = context_data
        self.start_time = None
        self.end_time = None
        self.duration_ms = None

    def __enter__(self):
        self.start_time = time.time()
        if DEBUG_LOGGING_ENABLED:
            self.logger.debug(
                f"Starting {self.operation}",
                extra={
                    "operation": self.operation,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    **self.context_data,
                },
            )
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.time()
        self.duration_ms = (self.end_time - self.start_time) * 1000

        if DEBUG_LOGGING_ENABLED:
            log_data = {
                "operation": self.operation,
                "duration_ms": round(self.duration_ms, 2),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "success": exc_type is None,
                **self.context_data,
            }

            if exc_type is not None:
                log_data["error"] = str(exc_val)
                log_data["error_type"] = exc_type.__name__
                self.logger.error(f"Failed {self.operation}", extra=log_data)
            else:
                self.logger.debug(f"Completed {self.operation}", extra=log_data)

        return False


class SQLQueryLogger:
    """Logger for SQL queries with performance tracking."""

    def __init__(self):
        self.query_count = 0
        self.total_time_ms = 0
        self.slow_queries = []

    def log_query(
        self,
        query: str,
        params: Optional[Dict] = None,
        duration_ms: float = 0,
        rows_affected: int = 0,
        database: str = "unknown",
        connection_id: str = None,
    ):
        """Log SQL query execution."""
        if not DEBUG_SQL_QUERIES:
            return

        self.query_count += 1
        self.total_time_ms += duration_ms

        # Truncate long queries for readability
        query_preview = query[:200] + "..." if len(query) > 200 else query

        log_data = {
            "query_id": f"sql_{self.query_count}",
            "query_preview": query_preview,
            "query_full": query,
            "params": params,
            "duration_ms": round(duration_ms, 2),
            "rows_affected": rows_affected,
            "database": database,
            "connection_id": connection_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_slow": duration_ms > SLOW_QUERY_THRESHOLD_MS,
        }

        if duration_ms > SLOW_QUERY_THRESHOLD_MS:
            self.slow_queries.append(log_data)
            sql_logger.warning(
                f"Slow SQL query detected: {duration_ms:.2f}ms", extra=log_data
            )
        else:
            sql_logger.debug(f"SQL query executed: {duration_ms:.2f}ms", extra=log_data)

    def get_stats(self) -> Dict[str, Any]:
        """Get query statistics."""
        return {
            "total_queries": self.query_count,
            "total_time_ms": round(self.total_time_ms, 2),
            "average_time_ms": round(self.total_time_ms / max(self.query_count, 1), 2),
            "slow_queries_count": len(self.slow_queries),
            "slow_queries": self.slow_queries[-10:],  # Last 10 slow queries
        }


class RAGOperationLogger:
    """Logger for RAG operations (indexing, caching, search)."""

    def __init__(self):
        self.operation_count = 0
        self.total_time_ms = 0
        self.slow_operations = []

    def log_operation(
        self,
        operation_type: str,
        operation: str,
        duration_ms: float = 0,
        **context_data,
    ):
        """Log RAG operation."""
        if not DEBUG_RAG_OPERATIONS:
            return

        self.operation_count += 1
        self.total_time_ms += duration_ms

        log_data = {
            "operation_id": f"rag_{self.operation_count}",
            "operation_type": operation_type,
            "operation": operation,
            "duration_ms": round(duration_ms, 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_slow": duration_ms > SLOW_RAG_OPERATION_THRESHOLD_MS,
            **context_data,
        }

        if duration_ms > SLOW_RAG_OPERATION_THRESHOLD_MS:
            self.slow_operations.append(log_data)
            rag_logger.warning(
                f"Slow RAG operation: {operation_type} - {duration_ms:.2f}ms",
                extra=log_data,
            )
        else:
            rag_logger.debug(
                f"RAG operation: {operation_type} - {duration_ms:.2f}ms", extra=log_data
            )

    def get_stats(self) -> Dict[str, Any]:
        """Get RAG operation statistics."""
        return {
            "total_operations": self.operation_count,
            "total_time_ms": round(self.total_time_ms, 2),
            "average_time_ms": round(
                self.total_time_ms / max(self.operation_count, 1), 2
            ),
            "slow_operations_count": len(self.slow_operations),
            "slow_operations": self.slow_operations[-10:],  # Last 10 slow operations
        }


class CacheOperationLogger:
    """Logger for cache operations."""

    def __init__(self):
        self.operation_count = 0
        self.total_time_ms = 0
        self.cache_hits = 0
        self.cache_misses = 0
        self.slow_operations = []

    def log_operation(
        self,
        operation: str,
        key: str,
        hit: bool = None,
        duration_ms: float = 0,
        **context_data,
    ):
        """Log cache operation."""
        if not DEBUG_CACHE_OPERATIONS:
            return

        self.operation_count += 1
        self.total_time_ms += duration_ms

        if hit is True:
            self.cache_hits += 1
        elif hit is False:
            self.cache_misses += 1

        log_data = {
            "operation_id": f"cache_{self.operation_count}",
            "operation": operation,
            "key": key,
            "hit": hit,
            "duration_ms": round(duration_ms, 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_slow": duration_ms > SLOW_CACHE_OPERATION_THRESHOLD_MS,
            **context_data,
        }

        if duration_ms > SLOW_CACHE_OPERATION_THRESHOLD_MS:
            self.slow_operations.append(log_data)
            cache_logger.warning(
                f"Slow cache operation: {operation} - {duration_ms:.2f}ms",
                extra=log_data,
            )
        else:
            cache_logger.debug(
                f"Cache operation: {operation} - {duration_ms:.2f}ms", extra=log_data
            )

    def get_stats(self) -> Dict[str, Any]:
        """Get cache operation statistics."""
        total_requests = self.cache_hits + self.cache_misses
        hit_rate = (self.cache_hits / max(total_requests, 1)) * 100

        return {
            "total_operations": self.operation_count,
            "total_time_ms": round(self.total_time_ms, 2),
            "average_time_ms": round(
                self.total_time_ms / max(self.operation_count, 1), 2
            ),
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "hit_rate_percent": round(hit_rate, 2),
            "slow_operations_count": len(self.slow_operations),
            "slow_operations": self.slow_operations[-10:],  # Last 10 slow operations
        }


class DatabaseConnectionLogger:
    """Logger for database connection events."""

    def __init__(self):
        self.connection_events = []
        self.active_connections = 0
        self.total_connections_created = 0

    def log_connection_event(
        self, event_type: str, database: str, connection_id: str = None, **context_data
    ):
        """Log database connection event."""
        if not DEBUG_DATABASE_CONNECTIONS:
            return

        if event_type == "connect":
            self.active_connections += 1
            self.total_connections_created += 1
        elif event_type in ["close", "disconnect"]:
            self.active_connections = max(0, self.active_connections - 1)

        log_data = {
            "event_type": event_type,
            "database": database,
            "connection_id": connection_id,
            "active_connections": self.active_connections,
            "total_connections_created": self.total_connections_created,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **context_data,
        }

        self.connection_events.append(log_data)
        db_conn_logger.debug(f"DB connection {event_type}: {database}", extra=log_data)

    def get_stats(self) -> Dict[str, Any]:
        """Get connection statistics."""
        return {
            "active_connections": self.active_connections,
            "total_connections_created": self.total_connections_created,
            "recent_events": self.connection_events[-20:],  # Last 20 events
        }


# Global logger instances
sql_query_logger = SQLQueryLogger()
rag_operation_logger = RAGOperationLogger()
cache_operation_logger = CacheOperationLogger()
db_connection_logger = DatabaseConnectionLogger()


def debug_log(operation: str, logger: logging.Logger = debug_logger, **context_data):
    """Decorator for debug logging function execution."""

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            if not DEBUG_LOGGING_ENABLED:
                return func(*args, **kwargs)

            with DebugLogContext(logger, operation, **context_data):
                return func(*args, **kwargs)

        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            if not DEBUG_LOGGING_ENABLED:
                return await func(*args, **kwargs)

            with DebugLogContext(logger, operation, **context_data):
                return await func(*args, **kwargs)

        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper

    return decorator


def log_sql_query(
    query: str,
    params: Optional[Dict] = None,
    duration_ms: float = 0,
    rows_affected: int = 0,
    database: str = "unknown",
    connection_id: str = None,
):
    """Log SQL query execution."""
    sql_query_logger.log_query(
        query, params, duration_ms, rows_affected, database, connection_id
    )


def log_rag_operation(
    operation_type: str, operation: str, duration_ms: float = 0, **context_data
):
    """Log RAG operation."""
    rag_operation_logger.log_operation(
        operation_type, operation, duration_ms, **context_data
    )


def log_cache_operation(
    operation: str, key: str, hit: bool = None, duration_ms: float = 0, **context_data
):
    """Log cache operation."""
    cache_operation_logger.log_operation(
        operation, key, hit, duration_ms, **context_data
    )


def log_db_connection_event(
    event_type: str, database: str, connection_id: str = None, **context_data
):
    """Log database connection event."""
    db_connection_logger.log_connection_event(
        event_type, database, connection_id, **context_data
    )


def get_debug_stats() -> Dict[str, Any]:
    """Get comprehensive debug statistics."""
    return {
        "debug_logging_enabled": DEBUG_LOGGING_ENABLED,
        "sql_queries": sql_query_logger.get_stats(),
        "rag_operations": rag_operation_logger.get_stats(),
        "cache_operations": cache_operation_logger.get_stats(),
        "db_connections": db_connection_logger.get_stats(),
        "thresholds": {
            "slow_query_ms": SLOW_QUERY_THRESHOLD_MS,
            "slow_rag_operation_ms": SLOW_RAG_OPERATION_THRESHOLD_MS,
            "slow_cache_operation_ms": SLOW_CACHE_OPERATION_THRESHOLD_MS,
        },
    }


def setup_sqlalchemy_debug_logging(
    engine: Union[Engine, AsyncEngine], database_name: str = "unknown"
):
    """Setup SQLAlchemy debug logging for an engine."""
    if not DEBUG_SQL_QUERIES:
        return

    def log_before_cursor_execute(
        conn, cursor, statement, parameters, context, executemany
    ):
        """Log before SQL execution."""
        context._query_start_time = time.time()

    def log_after_cursor_execute(
        conn, cursor, statement, parameters, context, executemany
    ):
        """Log after SQL execution."""
        if hasattr(context, "_query_start_time"):
            duration_ms = (time.time() - context._query_start_time) * 1000
            rows_affected = cursor.rowcount if hasattr(cursor, "rowcount") else 0

            log_sql_query(
                query=statement,
                params=parameters,
                duration_ms=duration_ms,
                rows_affected=rows_affected,
                database=database_name,
                connection_id=str(id(conn)),
            )

    # Register event listeners
    event.listen(engine, "before_cursor_execute", log_before_cursor_execute)
    event.listen(engine, "after_cursor_execute", log_after_cursor_execute)

    debug_logger.info(f"SQLAlchemy debug logging enabled for database: {database_name}")


def setup_connection_pool_logging(
    engine: Union[Engine, AsyncEngine], database_name: str = "unknown"
):
    """Setup connection pool debug logging."""
    if not DEBUG_DATABASE_CONNECTIONS:
        return

    def log_connect(dbapi_conn, connection_record):
        """Log connection creation."""
        log_db_connection_event("connect", database_name, str(id(dbapi_conn)))

    def log_checkout(dbapi_conn, connection_record, connection_proxy):
        """Log connection checkout."""
        log_db_connection_event("checkout", database_name, str(id(dbapi_conn)))

    def log_checkin(dbapi_conn, connection_record):
        """Log connection checkin."""
        log_db_connection_event("checkin", database_name, str(id(dbapi_conn)))

    def log_close(dbapi_conn, connection_record):
        """Log connection close."""
        log_db_connection_event("close", database_name, str(id(dbapi_conn)))

    # Register event listeners
    event.listen(engine, "connect", log_connect)
    event.listen(engine, "checkout", log_checkout)
    event.listen(engine, "checkin", log_checkin)
    event.listen(engine, "close", log_close)

    debug_logger.info(
        f"Connection pool debug logging enabled for database: {database_name}"
    )


# Initialize debug logging status
if DEBUG_LOGGING_ENABLED:
    debug_logger.info(
        "Debug logging system initialized",
        extra={
            "sql_queries": DEBUG_SQL_QUERIES,
            "rag_operations": DEBUG_RAG_OPERATIONS,
            "cache_operations": DEBUG_CACHE_OPERATIONS,
            "db_connections": DEBUG_DATABASE_CONNECTIONS,
            "performance_metrics": DEBUG_PERFORMANCE_METRICS,
        },
    )
else:
    debug_logger.info("Debug logging system disabled")
