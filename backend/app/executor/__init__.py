"""
Executor package for Reynard Backend

This package re-exports the executor interfaces from `app.utils`
to provide a stable module location under `app.executor`.
"""

from app.utils.executor_types import (
    ExecutorState,
    ExecutorConfig,
    ExecutorStats,
    TaskInfo,
)
from app.utils.executor_core import ThreadPoolExecutorManager
from app.utils.executor import (
    get_global_executor,
    execute_in_thread_pool,
    execute_batch_in_thread_pool,
    shutdown_global_executor,
)

__all__ = [
    "ExecutorState",
    "ExecutorConfig",
    "ExecutorStats",
    "TaskInfo",
    "ThreadPoolExecutorManager",
    "get_global_executor",
    "execute_in_thread_pool",
    "execute_batch_in_thread_pool",
    "shutdown_global_executor",
]


