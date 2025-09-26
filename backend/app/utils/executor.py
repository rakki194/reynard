"""Thread Pool Executor for Reynard Backend

Main module that combines all executor functionality.
"""

from collections.abc import Callable
from typing import Any

from .executor_batch import BatchExecutor
from .executor_core import ThreadPoolExecutorManager
from .executor_types import ExecutorConfig

# Global executor instance
_global_executor: ThreadPoolExecutorManager | None = None


async def get_global_executor(
    config: ExecutorConfig | None = None,
) -> ThreadPoolExecutorManager:
    """Get the global thread pool executor instance."""
    global _global_executor

    if _global_executor is None:
        _global_executor = ThreadPoolExecutorManager(config)
        await _global_executor.initialize()

    return _global_executor


async def execute_in_thread_pool(
    fn: Callable,
    *args,
    timeout: float | None = None,
    **kwargs,
) -> Any:
    """Execute a function in the global thread pool."""
    executor = await get_global_executor()
    return await executor.execute(fn, *args, timeout=timeout, **kwargs)


async def execute_batch_in_thread_pool(
    tasks: list[Callable],
    max_concurrent: int | None = None,
) -> list[Any]:
    """Execute multiple tasks in the global thread pool."""
    executor = await get_global_executor()
    batch_executor = BatchExecutor(executor)
    return await batch_executor.execute_batch(tasks, max_concurrent)


async def shutdown_global_executor():
    """Shutdown the global executor."""
    global _global_executor

    if _global_executor:
        await _global_executor.shutdown()
        _global_executor = None
