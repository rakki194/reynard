"""Executor Management Endpoints for Reynard Backend

Management endpoint implementations for executor operations.
"""

import logging

from fastapi import APIRouter, HTTPException, status

from app.executor import get_global_executor

from .executor_models import TaskExecutionRequest

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/executor", tags=["executor"])


@router.post("/shutdown")
async def shutdown_executor(wait: bool = True):
    """Shutdown the executor."""
    try:
        from app.executor import shutdown_global_executor

        await shutdown_global_executor()

        return {"success": True, "message": "Executor shutdown successfully"}

    except Exception as e:
        logger.error(f"Failed to shutdown executor: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to shutdown executor: {e!s}",
        )


@router.post("/execute")
async def execute_task(request: TaskExecutionRequest):
    """Execute a task in the thread pool.

    Note: This is a simplified endpoint for demonstration.
    In practice, you'd want to implement proper task serialization
    and execution mechanisms.
    """
    try:
        # This is a placeholder - in practice you'd need to implement
        # proper task serialization and execution
        return {
            "success": False,
            "message": "Task execution not implemented - use direct executor calls",
            "function_name": request.function_name,
        }

    except Exception as e:
        logger.error(f"Failed to execute task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute task: {e!s}",
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for the executor service."""
    try:
        executor = await get_global_executor()
        stats = executor.get_stats()

        return {
            "status": "healthy",
            "state": executor._state.value,
            "active_tasks": stats.active_tasks,
            "completed_tasks": stats.completed_tasks,
            "failed_tasks": stats.failed_tasks,
        }

    except Exception as e:
        logger.error(f"Executor health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}
