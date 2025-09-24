"""Tool executor for handling tool execution with proper error handling and logging.

This module provides the execution framework for tools, including timeout handling,
error recovery, logging, and integration with the existing threading patterns.
"""

import asyncio
import logging
import time
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from .base import BaseTool, ToolExecutionContext, ToolResult
from .exceptions import ToolResourceError, ToolTimeoutError

logger = logging.getLogger(__name__)


class ToolExecutor:
    """Handles the execution of tools with proper error handling and logging.

    The executor provides a unified interface for executing tools while handling
    timeouts, errors, resource management, and integration with existing threading.
    """

    def __init__(self, thread_pool: ThreadPoolExecutor | None = None):
        """Initialize the tool executor.

        Args:
            thread_pool: Optional thread pool for CPU-bound operations

        """
        self.thread_pool = thread_pool
        self._execution_stats = {
            "total_executions": 0,
            "successful_executions": 0,
            "failed_executions": 0,
            "timeouts": 0,
            "total_execution_time": 0.0,
        }

    async def execute_tool(
        self, tool: BaseTool, context: ToolExecutionContext, parameters: dict[str, Any],
    ) -> ToolResult:
        """Execute a tool with the given context and parameters.

        Args:
            tool: Tool instance to execute
            context: Execution context
            parameters: Tool parameters

        Returns:
            Tool execution result

        """
        start_time = time.time()
        self._execution_stats["total_executions"] += 1

        try:
            logger.info(
                f"Starting execution of tool '{tool.name}' for user {context.user_id}",
            )

            # Prepare execution context
            execution_context = self._prepare_execution_context(context)

            # Execute the tool
            if context.dry_run:
                result = await self._execute_dry_run(
                    tool, execution_context, parameters,
                )
            else:
                result = await self._execute_with_monitoring(
                    tool, execution_context, parameters,
                )

            # Record execution time
            execution_time = time.time() - start_time
            result.execution_time = execution_time

            # Update stats
            if result.success:
                self._execution_stats["successful_executions"] += 1
            else:
                self._execution_stats["failed_executions"] += 1

            self._execution_stats["total_execution_time"] += execution_time

            logger.info(
                f"Tool '{tool.name}' execution completed in {execution_time:.2f}s",
            )
            return result

        except TimeoutError:
            execution_time = time.time() - start_time
            self._execution_stats["timeouts"] += 1
            self._execution_stats["failed_executions"] += 1
            self._execution_stats["total_execution_time"] += execution_time

            error_msg = f"Tool '{tool.name}' timed out after {execution_time:.2f}s"
            logger.error(error_msg)

            return ToolResult.error_result(
                error=error_msg,
                metadata={"timeout": True, "execution_time": execution_time},
            )

        except Exception as e:
            execution_time = time.time() - start_time
            self._execution_stats["failed_executions"] += 1
            self._execution_stats["total_execution_time"] += execution_time

            error_msg = f"Tool '{tool.name}' execution failed: {e!s}"
            logger.error(error_msg, exc_info=True)

            return ToolResult.error_result(
                error=error_msg,
                metadata={
                    "exception_type": type(e).__name__,
                    "execution_time": execution_time,
                },
            )

    def _prepare_execution_context(
        self, context: ToolExecutionContext,
    ) -> ToolExecutionContext:
        """Prepare the execution context with additional environment setup.

        Args:
            context: Original execution context

        Returns:
            Enhanced execution context

        """
        # Create a copy of the context
        enhanced_context = ToolExecutionContext(
            user_id=context.user_id,
            user_role=context.user_role,
            session_id=context.session_id,
            request_id=context.request_id,
            working_directory=context.working_directory,
            environment=context.environment.copy(),
            timeout=context.timeout,
            dry_run=context.dry_run,
        )

        # Add execution-specific environment variables
        enhanced_context.environment.update(
            {
                "YIPYAP_EXECUTOR": "true",
                "YIPYAP_USER_ID": context.user_id,
                "YIPYAP_USER_ROLE": context.user_role,
            },
        )

        return enhanced_context

    async def _execute_dry_run(
        self, tool: BaseTool, context: ToolExecutionContext, parameters: dict[str, Any],
    ) -> ToolResult:
        """Execute a tool in dry-run mode (simulation only).

        Args:
            tool: Tool to execute
            context: Execution context
            parameters: Tool parameters

        Returns:
            Simulated tool result

        """
        logger.info(f"Executing tool '{tool.name}' in dry-run mode")

        # Simulate execution time
        await asyncio.sleep(0.1)

        return ToolResult.success_result(
            data={
                "message": f"Dry run of tool '{tool.name}' completed successfully",
                "parameters": parameters,
                "would_execute": True,
            },
            metadata={
                "dry_run": True,
                "tool_name": tool.name,
                "user_id": context.user_id,
            },
        )

    async def _execute_with_monitoring(
        self, tool: BaseTool, context: ToolExecutionContext, parameters: dict[str, Any],
    ) -> ToolResult:
        """Execute a tool with monitoring and resource checks.

        Args:
            tool: Tool to execute
            context: Execution context
            parameters: Tool parameters

        Returns:
            Tool execution result

        """
        # Check available resources before execution
        self._check_system_resources(tool.name)

        # Execute with timeout
        timeout = context.timeout if context.timeout > 0 else tool.timeout

        try:
            result = await asyncio.wait_for(
                tool.execute(context, **parameters), timeout=timeout,
            )

            # Validate result
            if not isinstance(result, ToolResult):
                logger.warning(f"Tool '{tool.name}' returned invalid result type")
                return ToolResult.error_result("Tool returned invalid result type")

            return result

        except TimeoutError:
            raise ToolTimeoutError(tool.name, timeout)

    def _check_system_resources(self, tool_name: str) -> None:
        """Check system resources before tool execution.

        Args:
            tool_name: Name of the tool being executed

        Raises:
            ToolResourceError: If system resources are insufficient

        """
        try:
            import psutil

            # Check memory usage
            memory = psutil.virtual_memory()
            if memory.percent > 90:
                raise ToolResourceError(
                    tool_name,
                    "memory",
                    f"System memory usage too high: {memory.percent}%",
                )

            # Check disk space
            disk = psutil.disk_usage("/")
            if disk.percent > 95:
                raise ToolResourceError(
                    tool_name, "disk", f"System disk usage too high: {disk.percent}%",
                )

        except ImportError:
            # psutil not available, skip resource checks
            logger.debug("psutil not available, skipping resource checks")
        except Exception as e:
            logger.warning(f"Failed to check system resources: {e}")

    async def execute_function_as_tool(
        self,
        func: Callable,
        context: ToolExecutionContext,
        parameters: dict[str, Any],
        is_async: bool = False,
    ) -> ToolResult:
        """Execute a regular function as a tool.

        Args:
            func: Function to execute
            context: Execution context
            parameters: Function parameters
            is_async: Whether the function is async

        Returns:
            Tool execution result

        """
        start_time = time.time()

        try:
            if is_async:
                # Execute async function directly
                result = await func(**parameters)
            # Execute sync function in thread pool
            elif self.thread_pool:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    self.thread_pool, lambda: func(**parameters),
                )
            else:
                # Execute in default executor
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(None, lambda: func(**parameters))

            execution_time = time.time() - start_time

            return ToolResult.success_result(data=result, execution_time=execution_time)

        except Exception as e:
            execution_time = time.time() - start_time
            error_msg = f"Function execution failed: {e!s}"

            return ToolResult.error_result(
                error=error_msg,
                metadata={
                    "exception_type": type(e).__name__,
                    "execution_time": execution_time,
                },
            )

    def get_execution_stats(self) -> dict[str, Any]:
        """Get execution statistics.

        Returns:
            Dictionary of execution statistics

        """
        stats = self._execution_stats.copy()

        if stats["total_executions"] > 0:
            stats["success_rate"] = (
                stats["successful_executions"] / stats["total_executions"]
            )
            stats["average_execution_time"] = (
                stats["total_execution_time"] / stats["total_executions"]
            )
            stats["timeout_rate"] = stats["timeouts"] / stats["total_executions"]
        else:
            stats["success_rate"] = 0.0
            stats["average_execution_time"] = 0.0
            stats["timeout_rate"] = 0.0

        return stats

    def reset_stats(self) -> None:
        """Reset execution statistics."""
        self._execution_stats = {
            "total_executions": 0,
            "successful_executions": 0,
            "failed_executions": 0,
            "timeouts": 0,
            "total_execution_time": 0.0,
        }


# Global executor instance
_executor: ToolExecutor | None = None


def get_tool_executor() -> ToolExecutor:
    """Get the global tool executor instance."""
    global _executor
    if _executor is None:
        _executor = ToolExecutor()
    return _executor


def initialize_tool_executor(
    thread_pool: ThreadPoolExecutor | None = None,
) -> ToolExecutor:
    """Initialize the global tool executor with optional thread pool."""
    global _executor
    _executor = ToolExecutor(thread_pool)
    return _executor
