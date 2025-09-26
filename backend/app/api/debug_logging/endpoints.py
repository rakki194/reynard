"""Debug Logging API Endpoints

This module provides API endpoints for viewing debug logging statistics
and controlling debug logging behavior.
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.debug_logging import (
    DEBUG_CACHE_OPERATIONS,
    DEBUG_DATABASE_CONNECTIONS,
    DEBUG_LOGGING_ENABLED,
    DEBUG_PERFORMANCE_METRICS,
    DEBUG_RAG_OPERATIONS,
    DEBUG_SQL_QUERIES,
    cache_operation_logger,
    db_connection_logger,
    get_debug_stats,
    rag_operation_logger,
    sql_query_logger,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/debug-logging", tags=["debug-logging"])


class DebugStatsResponse(BaseModel):
    """Response model for debug statistics."""

    debug_logging_enabled: bool
    sql_queries: Dict[str, Any]
    rag_operations: Dict[str, Any]
    cache_operations: Dict[str, Any]
    db_connections: Dict[str, Any]
    thresholds: Dict[str, float]


class DebugConfigResponse(BaseModel):
    """Response model for debug configuration."""

    debug_logging_enabled: bool
    debug_sql_queries: bool
    debug_rag_operations: bool
    debug_cache_operations: bool
    debug_database_connections: bool
    debug_performance_metrics: bool


@router.get("/stats", response_model=DebugStatsResponse)
async def get_debug_statistics() -> DebugStatsResponse:
    """Get comprehensive debug logging statistics."""
    try:
        stats = get_debug_stats()
        return DebugStatsResponse(**stats)
    except Exception as e:
        logger.error(f"Failed to get debug statistics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get debug statistics")


@router.get("/config", response_model=DebugConfigResponse)
async def get_debug_configuration() -> DebugConfigResponse:
    """Get current debug logging configuration."""
    return DebugConfigResponse(
        debug_logging_enabled=DEBUG_LOGGING_ENABLED,
        debug_sql_queries=DEBUG_SQL_QUERIES,
        debug_rag_operations=DEBUG_RAG_OPERATIONS,
        debug_cache_operations=DEBUG_CACHE_OPERATIONS,
        debug_database_connections=DEBUG_DATABASE_CONNECTIONS,
        debug_performance_metrics=DEBUG_PERFORMANCE_METRICS,
    )


@router.get("/sql-queries/stats")
async def get_sql_query_stats() -> Dict[str, Any]:
    """Get SQL query statistics."""
    try:
        return sql_query_logger.get_stats()
    except Exception as e:
        logger.error(f"Failed to get SQL query stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get SQL query stats")


@router.get("/rag-operations/stats")
async def get_rag_operation_stats() -> Dict[str, Any]:
    """Get RAG operation statistics."""
    try:
        return rag_operation_logger.get_stats()
    except Exception as e:
        logger.error(f"Failed to get RAG operation stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get RAG operation stats")


@router.get("/cache-operations/stats")
async def get_cache_operation_stats() -> Dict[str, Any]:
    """Get cache operation statistics."""
    try:
        return cache_operation_logger.get_stats()
    except Exception as e:
        logger.error(f"Failed to get cache operation stats: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to get cache operation stats"
        )


@router.get("/db-connections/stats")
async def get_db_connection_stats() -> Dict[str, Any]:
    """Get database connection statistics."""
    try:
        return db_connection_logger.get_stats()
    except Exception as e:
        logger.error(f"Failed to get DB connection stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get DB connection stats")


@router.get("/health")
async def debug_logging_health() -> Dict[str, Any]:
    """Check debug logging system health."""
    try:
        return {
            "status": "healthy",
            "debug_logging_enabled": DEBUG_LOGGING_ENABLED,
            "components": {
                "sql_queries": DEBUG_SQL_QUERIES,
                "rag_operations": DEBUG_RAG_OPERATIONS,
                "cache_operations": DEBUG_CACHE_OPERATIONS,
                "db_connections": DEBUG_DATABASE_CONNECTIONS,
                "performance_metrics": DEBUG_PERFORMANCE_METRICS,
            },
            "loggers": {
                "sql_logger": sql_query_logger.query_count,
                "rag_logger": rag_operation_logger.operation_count,
                "cache_logger": cache_operation_logger.operation_count,
                "db_conn_logger": db_connection_logger.total_connections_created,
            },
        }
    except Exception as e:
        logger.error(f"Debug logging health check failed: {e}")
        raise HTTPException(status_code=500, detail="Debug logging health check failed")
