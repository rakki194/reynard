"""Thread Pool Executor Core for Reynard Backend

Core implementation of the thread pool executor manager.
"""

import asyncio
import logging
import time
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from .executor_types import ExecutorConfig, ExecutorState, ExecutorStats, TaskInfo

logger = logging.getLogger("uvicorn")


class ThreadPoolExecutorManager:
    """Thread pool executor manager with async support and performance monitoring."""

    def __init__(self, config: ExecutorConfig = None):
        self._config = config or ExecutorConfig()
        self._executor: ThreadPoolExecutor | None = None
        self._stats = ExecutorStats()
        self._active_tasks: dict[str, TaskInfo] = {}
        self._state = ExecutorState.IDLE
        self._lock = asyncio.Lock()

    async def initialize(self) -> bool:
        """Initialize the thread pool executor."""
        try:
            async with self._lock:
                if self._state != ExecutorState.IDLE:
                    return False

                self._executor = ThreadPoolExecutor(
                    max_workers=self._config.max_workers,
                    thread_name_prefix="reynard-executor",
                )
                self._state = ExecutorState.RUNNING
                logger.info(
                    f"Thread pool executor initialized with {self._config.max_workers} workers",
                )
                return True

        except Exception as e:
            logger.error(f"Failed to initialize thread pool executor: {e}")
            return False

    async def execute(
        self,
        fn: Callable,
        *args,
        timeout: float | None = None,
        retries: int | None = None,
        **kwargs,
    ) -> Any:
        """Execute a function in the thread pool."""
        if self._state != ExecutorState.RUNNING:
            raise RuntimeError("Executor is not running")

        if not self._executor:
            raise RuntimeError("Executor not initialized")

        timeout = timeout or self._config.default_timeout
        max_retries = retries or self._config.max_retries

        task_id = f"task_{int(time.time() * 1000)}_{id(fn)}"

        async with self._lock:
            self._stats.active_tasks += 1
            self._stats.current_concurrent_tasks += 1
            self._stats.max_concurrent_tasks = max(
                self._stats.max_concurrent_tasks,
                self._stats.current_concurrent_tasks,
            )

            self._active_tasks[task_id] = TaskInfo(
                task_id=task_id,
                function_name=fn.__name__,
                start_time=time.time(),
                timeout=timeout,
                max_retries=max_retries,
            )

        try:
            # Execute in thread pool with timeout
            loop = asyncio.get_event_loop()
            future = self._executor.submit(fn, *args, **kwargs)

            result = await asyncio.wait_for(
                loop.run_in_executor(None, lambda: future.result()),
                timeout=timeout,
            )

            # Update stats
            execution_time = time.time() - self._active_tasks[task_id].start_time
            self._update_stats(execution_time, success=True)

            return result

        except TimeoutError:
            self._update_stats(0, success=False)
            raise TimeoutError(f"Task {task_id} timed out after {timeout} seconds")

        except Exception as e:
            self._update_stats(0, success=False)
            logger.error(f"Task {task_id} failed: {e}")
            raise

        finally:
            async with self._lock:
                self._stats.active_tasks -= 1
                self._stats.current_concurrent_tasks -= 1
                if task_id in self._active_tasks:
                    del self._active_tasks[task_id]

    def _update_stats(self, execution_time: float, success: bool):
        """Update executor statistics."""
        if success:
            self._stats.completed_tasks += 1
        else:
            self._stats.failed_tasks += 1

        self._stats.total_execution_time += execution_time
        total_tasks = self._stats.completed_tasks + self._stats.failed_tasks
        if total_tasks > 0:
            self._stats.average_execution_time = (
                self._stats.total_execution_time / total_tasks
            )

    async def shutdown(self, wait: bool = True):
        """Shutdown the executor."""
        async with self._lock:
            if self._state == ExecutorState.SHUTDOWN:
                return

            self._state = ExecutorState.SHUTTING_DOWN

            if self._executor:
                self._executor.shutdown(wait=wait)
                self._executor = None

            self._state = ExecutorState.SHUTDOWN
            logger.info("Thread pool executor shutdown completed")
