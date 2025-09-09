"""
Executor Core Endpoints for Reynard Backend

Core endpoint implementations for executor operations.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status

from app.executor import get_global_executor, ExecutorConfig, ExecutorState
from .executor_models import (
    ExecutorConfigRequest,
    ExecutorStatsResponse,
    TaskInfoResponse,
    ExecutorStateResponse
)

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/executor", tags=["executor"])


@router.get("/state", response_model=ExecutorStateResponse)
async def get_executor_state():
    """Get the current state of the executor."""
    try:
        executor = await get_global_executor()
        stats = executor.get_stats()
        
        return ExecutorStateResponse(
            state=executor._state.value,
            initialized=executor._state != ExecutorState.IDLE
        )
        
    except Exception as e:
        logger.error(f"Failed to get executor state: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get executor state: {str(e)}"
        )


@router.get("/stats", response_model=ExecutorStatsResponse)
async def get_executor_stats():
    """Get executor statistics."""
    try:
        executor = await get_global_executor()
        stats = executor.get_stats()
        
        return ExecutorStatsResponse(
            active_tasks=stats.active_tasks,
            completed_tasks=stats.completed_tasks,
            failed_tasks=stats.failed_tasks,
            average_execution_time=stats.average_execution_time,
            total_execution_time=stats.total_execution_time,
            max_concurrent_tasks=stats.max_concurrent_tasks,
            current_concurrent_tasks=stats.current_concurrent_tasks
        )
        
    except Exception as e:
        logger.error(f"Failed to get executor stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get executor stats: {str(e)}"
        )


@router.get("/active-tasks", response_model=List[TaskInfoResponse])
async def get_active_tasks():
    """Get information about active tasks."""
    try:
        executor = await get_global_executor()
        active_tasks = executor.get_active_tasks()
        
        return [
            TaskInfoResponse(
                task_id=task.task_id,
                function_name=task.function_name,
                start_time=task.start_time,
                timeout=task.timeout,
                retry_count=task.retry_count,
                max_retries=task.max_retries
            )
            for task in active_tasks
        ]
        
    except Exception as e:
        logger.error(f"Failed to get active tasks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get active tasks: {str(e)}"
        )


@router.post("/initialize")
async def initialize_executor(config: Optional[ExecutorConfigRequest] = None):
    """Initialize the executor with optional configuration."""
    try:
        if config:
            executor_config = ExecutorConfig(
                max_workers=config.max_workers,
                enable_performance_monitoring=config.enable_performance_monitoring,
                auto_cleanup=config.auto_cleanup,
                default_timeout=config.default_timeout,
                max_retries=config.max_retries,
                retry_delay=config.retry_delay
            )
            executor = await get_global_executor(executor_config)
        else:
            executor = await get_global_executor()
        
        return {
            "success": True,
            "message": "Executor initialized successfully",
            "state": executor._state.value
        }
        
    except Exception as e:
        logger.error(f"Failed to initialize executor: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize executor: {str(e)}"
        )
