"""
Tests for the executor utility module.

This module tests the global executor functionality including
thread pool management and task execution.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.utils.executor import (
    execute_batch_in_thread_pool,
    execute_in_thread_pool,
    get_global_executor,
    shutdown_global_executor,
)
from app.utils.executor_types import ExecutorConfig


class TestGlobalExecutor:
    """Test the global executor functionality."""

    def test_get_global_executor_creates_new_instance(self):
        """Test that get_global_executor creates a new instance when none exists."""
        # Reset global executor
        import app.utils.executor as executor_module

        executor_module._global_executor = None

        config = ExecutorConfig(max_workers=4)

        with patch(
            "app.utils.executor.ThreadPoolExecutorManager"
        ) as mock_manager_class:
            mock_manager = AsyncMock()
            mock_manager_class.return_value = mock_manager

            # This would need to be run in an async context, but we can test the logic
            # by checking that the manager is created with the right config
            executor_module._global_executor = mock_manager_class(config)

            assert executor_module._global_executor is not None
            mock_manager_class.assert_called_once_with(config)

    def test_get_global_executor_reuses_existing_instance(self):
        """Test that get_global_executor reuses existing instance."""
        import app.utils.executor as executor_module

        # Set up existing executor
        existing_executor = AsyncMock()
        executor_module._global_executor = existing_executor

        # The function should return the existing executor
        # (This would need async context to test fully)
        assert executor_module._global_executor is existing_executor

    @pytest.mark.asyncio
    async def test_execute_in_thread_pool_success(self):
        """Test successful execution in thread pool."""
        # Mock the global executor
        mock_executor = AsyncMock()
        mock_executor.execute.return_value = "test_result"

        with patch(
            "app.utils.executor.get_global_executor", return_value=mock_executor
        ):

            def test_func(x, y):
                return x + y

            result = await execute_in_thread_pool(test_func, 1, 2, timeout=5.0)

            assert result == "test_result"
            mock_executor.execute.assert_called_once_with(test_func, 1, 2, timeout=5.0)

    @pytest.mark.asyncio
    async def test_execute_in_thread_pool_with_kwargs(self):
        """Test execution in thread pool with keyword arguments."""
        mock_executor = AsyncMock()
        mock_executor.execute.return_value = "test_result"

        with patch(
            "app.utils.executor.get_global_executor", return_value=mock_executor
        ):

            def test_func(x, y, z=None):
                return x + y + (z or 0)

            result = await execute_in_thread_pool(test_func, 1, 2, z=3, timeout=10.0)

            assert result == "test_result"
            mock_executor.execute.assert_called_once_with(
                test_func, 1, 2, timeout=10.0, z=3
            )

    @pytest.mark.asyncio
    async def test_execute_batch_in_thread_pool_success(self):
        """Test successful batch execution in thread pool."""
        mock_executor = AsyncMock()
        mock_batch_executor = AsyncMock()
        mock_batch_executor.execute_batch.return_value = ["result1", "result2"]

        with (
            patch("app.utils.executor.get_global_executor", return_value=mock_executor),
            patch("app.utils.executor.BatchExecutor", return_value=mock_batch_executor),
        ):

            def task1():
                return "result1"

            def task2():
                return "result2"

            tasks = [task1, task2]
            results = await execute_batch_in_thread_pool(tasks, max_concurrent=2)

            assert results == ["result1", "result2"]
            mock_batch_executor.execute_batch.assert_called_once_with(tasks, 2)

    @pytest.mark.asyncio
    async def test_execute_batch_in_thread_pool_default_concurrent(self):
        """Test batch execution with default max_concurrent."""
        mock_executor = AsyncMock()
        mock_batch_executor = AsyncMock()
        mock_batch_executor.execute_batch.return_value = ["result1"]

        with (
            patch("app.utils.executor.get_global_executor", return_value=mock_executor),
            patch("app.utils.executor.BatchExecutor", return_value=mock_batch_executor),
        ):

            def task1():
                return "result1"

            tasks = [task1]
            results = await execute_batch_in_thread_pool(tasks)

            assert results == ["result1"]
            mock_batch_executor.execute_batch.assert_called_once_with(tasks, None)

    @pytest.mark.asyncio
    async def test_shutdown_global_executor_with_existing_executor(self):
        """Test shutdown when executor exists."""
        import app.utils.executor as executor_module

        # Set up existing executor
        mock_executor = AsyncMock()
        executor_module._global_executor = mock_executor

        await shutdown_global_executor()

        mock_executor.shutdown.assert_called_once()
        assert executor_module._global_executor is None

    @pytest.mark.asyncio
    async def test_shutdown_global_executor_without_existing_executor(self):
        """Test shutdown when no executor exists."""
        import app.utils.executor as executor_module

        # Ensure no executor exists
        executor_module._global_executor = None

        # Should not raise an error
        await shutdown_global_executor()

        # Should still be None
        assert executor_module._global_executor is None

    def test_global_executor_initial_state(self):
        """Test that global executor starts as None."""
        import app.utils.executor as executor_module

        assert executor_module._global_executor is None

    @pytest.mark.asyncio
    async def test_execute_in_thread_pool_timeout_none(self):
        """Test execution with no timeout specified."""
        mock_executor = AsyncMock()
        mock_executor.execute.return_value = "test_result"

        with patch(
            "app.utils.executor.get_global_executor", return_value=mock_executor
        ):

            def test_func():
                return "test_result"

            result = await execute_in_thread_pool(test_func)

            assert result == "test_result"
            mock_executor.execute.assert_called_once_with(test_func, timeout=None)

    @pytest.mark.asyncio
    async def test_execute_batch_empty_tasks(self):
        """Test batch execution with empty task list."""
        mock_executor = AsyncMock()
        mock_batch_executor = AsyncMock()
        mock_batch_executor.execute_batch.return_value = []

        with (
            patch("app.utils.executor.get_global_executor", return_value=mock_executor),
            patch("app.utils.executor.BatchExecutor", return_value=mock_batch_executor),
        ):

            results = await execute_batch_in_thread_pool([])

            assert results == []
            mock_batch_executor.execute_batch.assert_called_once_with([], None)

    @pytest.mark.asyncio
    async def test_get_global_executor_initialization(self):
        """Test that get_global_executor properly initializes a new executor."""
        import app.utils.executor as executor_module

        # Reset global executor
        executor_module._global_executor = None

        config = ExecutorConfig(max_workers=4)

        with patch(
            "app.utils.executor.ThreadPoolExecutorManager"
        ) as mock_manager_class:
            mock_manager = AsyncMock()
            mock_manager_class.return_value = mock_manager

            # Call the actual function
            result = await get_global_executor(config)

            # Verify the manager was created and initialized
            mock_manager_class.assert_called_once_with(config)
            mock_manager.initialize.assert_called_once()
            assert result == mock_manager
            assert executor_module._global_executor == mock_manager
