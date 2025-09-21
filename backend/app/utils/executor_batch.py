"""
Thread Pool Executor Batch Operations for Reynard Backend

Batch execution functionality for the thread pool executor.
"""

import asyncio
import logging
from collections.abc import Callable
from typing import Any

from .executor_core import ThreadPoolExecutorManager

logger = logging.getLogger("uvicorn")


class BatchExecutor:
    """Batch execution functionality for thread pool executor."""

    def __init__(self, executor: ThreadPoolExecutorManager):
        self._executor = executor

    async def execute_batch(
        self, tasks: list[Callable], max_concurrent: int | None = None
    ) -> list[Any]:
        """
        Execute multiple tasks concurrently with optional concurrency limit.

        Args:
            tasks: List of functions to execute
            max_concurrent: Maximum concurrent executions

        Returns:
            List of results
        """
        max_concurrent = max_concurrent or self._executor._config.max_workers

        semaphore = asyncio.Semaphore(max_concurrent)

        async def execute_with_semaphore(task):
            async with semaphore:
                return await self._executor.execute(task)

        return await asyncio.gather(*[execute_with_semaphore(task) for task in tasks])

    async def execute_with_limit(
        self, tasks: list[Callable], limit: int | None = None
    ) -> list[Any]:
        """
        Execute tasks with concurrency limit using a different approach.

        Args:
            tasks: List of functions to execute
            limit: Maximum concurrent executions

        Returns:
            List of results
        """
        limit = limit or self._executor._config.max_workers
        semaphore = asyncio.Semaphore(limit)

        async def execute_with_semaphore(task):
            async with semaphore:
                return await self._executor.execute(task)

        return await asyncio.gather(*[execute_with_semaphore(task) for task in tasks])
