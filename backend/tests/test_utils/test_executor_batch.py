"""Tests for the executor_batch module."""

import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.utils.executor_batch import BatchExecutor


class TestBatchExecutor:
    """Test cases for BatchExecutor."""

    def setup_method(self):
        """Set up test fixtures."""
        self.mock_executor = AsyncMock()
        # Mock the config with max_workers
        self.mock_executor._config = MagicMock()
        self.mock_executor._config.max_workers = 4
        self.batch_executor = BatchExecutor(self.mock_executor)

    @pytest.mark.asyncio
    async def test_execute_batch_success(self):
        """Test successful batch execution."""
        # Mock tasks
        task1 = MagicMock(return_value="result1")
        task2 = MagicMock(return_value="result2")
        task3 = MagicMock(return_value="result3")
        tasks = [task1, task2, task3]

        # Mock executor.execute to return results
        self.mock_executor.execute.side_effect = ["result1", "result2", "result3"]

        # Execute batch
        results = await self.batch_executor.execute_batch(tasks)

        # Verify results
        assert results == ["result1", "result2", "result3"]
        assert self.mock_executor.execute.call_count == 3

    @pytest.mark.asyncio
    async def test_execute_batch_with_max_concurrent(self):
        """Test batch execution with max_concurrent limit."""
        # Mock tasks
        task1 = MagicMock(return_value="result1")
        task2 = MagicMock(return_value="result2")
        task3 = MagicMock(return_value="result3")
        tasks = [task1, task2, task3]

        # Mock executor.execute to return results
        self.mock_executor.execute.side_effect = ["result1", "result2", "result3"]

        # Execute batch with max_concurrent=2
        results = await self.batch_executor.execute_batch(tasks, max_concurrent=2)

        # Verify results
        assert results == ["result1", "result2", "result3"]
        assert self.mock_executor.execute.call_count == 3

    @pytest.mark.asyncio
    async def test_execute_batch_empty_tasks(self):
        """Test batch execution with empty task list."""
        results = await self.batch_executor.execute_batch([])
        assert results == []
        assert self.mock_executor.execute.call_count == 0

    @pytest.mark.asyncio
    async def test_execute_batch_single_task(self):
        """Test batch execution with single task."""
        task = MagicMock(return_value="result")
        self.mock_executor.execute.return_value = "result"

        results = await self.batch_executor.execute_batch([task])

        assert results == ["result"]
        assert self.mock_executor.execute.call_count == 1

    @pytest.mark.asyncio
    async def test_execute_batch_executor_error(self):
        """Test batch execution when executor raises an error."""
        task = MagicMock()
        self.mock_executor.execute.side_effect = Exception("Executor error")

        with pytest.raises(Exception, match="Executor error"):
            await self.batch_executor.execute_batch([task])

    @pytest.mark.asyncio
    async def test_execute_batch_with_default_max_concurrent(self):
        """Test execute_batch uses default max_concurrent from executor config."""
        # Mock tasks
        task1 = MagicMock(return_value="result1")
        task2 = MagicMock(return_value="result2")
        tasks = [task1, task2]

        # Mock executor.execute to return results
        self.mock_executor.execute.side_effect = ["result1", "result2"]

        # Execute batch without specifying max_concurrent
        results = await self.batch_executor.execute_batch(tasks)

        # Verify results and that it used the default max_workers (4)
        assert results == ["result1", "result2"]
        assert self.mock_executor.execute.call_count == 2

    @pytest.mark.asyncio
    async def test_execute_batch_concurrency_control(self):
        """Test that execute_batch properly controls concurrency with semaphore."""

        # Create tasks that take some time
        async def slow_task(delay, result):
            await asyncio.sleep(delay)
            return result

        tasks = [
            lambda: slow_task(0.1, "result1"),
            lambda: slow_task(0.1, "result2"),
            lambda: slow_task(0.1, "result3"),
        ]

        # Mock the executor to simulate actual execution
        async def mock_execute(task, *args, **kwargs):
            return await task()

        self.mock_executor.execute.side_effect = mock_execute

        # Execute with max_concurrent=2
        start_time = asyncio.get_event_loop().time()
        results = await self.batch_executor.execute_batch(tasks, max_concurrent=2)
        end_time = asyncio.get_event_loop().time()

        # Verify results
        assert results == ["result1", "result2", "result3"]

        # Should take at least 0.2 seconds (2 batches of 0.1s each)
        # but less than 0.3 seconds (if all ran in parallel)
        assert 0.2 <= (end_time - start_time) < 0.3
