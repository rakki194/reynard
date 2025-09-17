"""
Executor package for Reynard Backend

This package re-exports the executor interfaces from `app.utils`
to provide a stable module location under `app.executor`.
"""

from app.utils.executor import (
    execute_batch_in_thread_pool,
    execute_in_thread_pool,
    get_global_executor,
    shutdown_global_executor,
)
from app.utils.executor_core import ThreadPoolExecutorManager
from app.utils.executor_types import (
    ExecutorConfig,
    ExecutorState,
    ExecutorStats,
    TaskInfo,
)

__all__ = [
    "ExecutorConfig",
    "ExecutorState",
    "ExecutorStats",
    "TaskInfo",
    "ThreadPoolExecutorManager",
    "execute_batch_in_thread_pool",
    "execute_in_thread_pool",
    "get_global_executor",
    "shutdown_global_executor",
]
