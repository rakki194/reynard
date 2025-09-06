"""
Base classes for streaming tool execution in yipyap.

This module provides base classes for tools that can emit progress updates
and intermediate results during execution.
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, AsyncGenerator, Callable
from .base import BaseTool, ToolExecutionContext, ToolResult

logger = logging.getLogger(__name__)


class StreamingToolResult(ToolResult):
    """Extended tool result that includes streaming information."""
    
    def __init__(
        self,
        success: bool,
        data: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        execution_time: Optional[float] = None,
        streamed_progress: bool = False,
        total_progress_updates: int = 0,
    ):
        super().__init__(success, data, error, metadata, execution_time)
        self.streamed_progress = streamed_progress
        self.total_progress_updates = total_progress_updates


class StreamingToolExecutionContext(ToolExecutionContext):
    """Extended execution context that supports progress callbacks."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._progress_callback = None
        self._error_callback = None
        self._progress_queue = asyncio.Queue()
    
    def set_progress_callback(self, callback: Callable):
        """Set callback for progress updates."""
        self._progress_callback = callback
    
    def set_error_callback(self, callback: Callable):
        """Set callback for error updates."""
        self._error_callback = callback
    
    async def report_progress(
        self,
        progress: float,
        status: str,
        message: Optional[str] = None,
        intermediate_data: Optional[Dict[str, Any]] = None,
    ):
        """Report execution progress."""
        if self._progress_callback:
            try:
                await self._progress_callback(progress, status, message, intermediate_data)
            except Exception as e:
                logger.error(f"Error in progress callback: {e}")
    
    async def report_error(
        self,
        error: str,
        error_type: Optional[str] = None,
        retryable: bool = False,
    ):
        """Report execution error."""
        if self._error_callback:
            try:
                await self._error_callback(error, error_type, retryable)
            except Exception as e:
                logger.error(f"Error in error callback: {e}")
    
    async def emit_progress_chunk(self, chunk: Dict[str, Any]):
        """Emit a progress chunk to the queue."""
        await self._progress_queue.put(chunk)
    
    async def get_progress_chunks(self) -> AsyncGenerator[Dict[str, Any], None]:
        """Get progress chunks from the queue."""
        while not self._progress_queue.empty():
            yield await self._progress_queue.get()


class StreamingBaseTool(BaseTool, ABC):
    """
    Abstract base class for tools that support streaming execution progress.
    
    Tools that inherit from this class can emit progress updates and
    intermediate results during execution.
    """
    
    def __init__(self):
        super().__init__()
        self._supports_streaming = True
    
    @property
    def supports_streaming(self) -> bool:
        """Whether this tool supports streaming execution."""
        return self._supports_streaming
    
    @abstractmethod
    async def execute_streaming(
        self,
        context: StreamingToolExecutionContext,
        **params
    ) -> AsyncGenerator[StreamingToolResult, None]:
        """
        Execute the tool with streaming progress updates.
        
        Args:
            context: Streaming execution context
            **params: Tool parameters
            
        Yields:
            StreamingToolResult objects with progress updates
        """
        pass
    
    async def execute(self, context: ToolExecutionContext, **params) -> ToolResult:
        """
        Default implementation that executes the streaming version and returns final result.
        
        Args:
            context: Execution context
            **params: Tool parameters
            
        Returns:
            Final tool execution result
        """
        # Convert to streaming context if needed
        if isinstance(context, StreamingToolExecutionContext):
            streaming_context = context
        else:
            streaming_context = StreamingToolExecutionContext(
                user_id=context.user_id,
                user_role=context.user_role,
                session_id=context.session_id,
                request_id=context.request_id,
                working_directory=context.working_directory,
                environment=context.environment,
                timeout=context.timeout,
                dry_run=context.dry_run,
            )
        
        final_result = None
        async for result in self.execute_streaming(streaming_context, **params):
            final_result = result
        
        return final_result or StreamingToolResult(success=False, error="No result generated")
    
    async def execute_with_timeout(
        self, context: ToolExecutionContext, **params
    ) -> ToolResult:
        """
        Execute tool with timeout handling, supporting streaming.
        
        Args:
            context: Execution context
            **params: Tool parameters
            
        Returns:
            Tool execution result
        """
        timeout = context.timeout if context.timeout > 0 else self.timeout
        
        try:
            return await asyncio.wait_for(
                self.execute(context, **params), timeout=timeout
            )
        except asyncio.TimeoutError:
            from .exceptions import ToolTimeoutError
            raise ToolTimeoutError(self.name, timeout)


class ProgressReportingMixin:
    """
    Mixin that provides progress reporting utilities for streaming tools.
    """
    
    async def report_initialization_progress(
        self,
        context: StreamingToolExecutionContext,
        tool_name: str,
        tool_call_id: str,
        message: str = "Initializing tool execution...",
    ):
        """Report initialization progress."""
        await context.report_progress(0.0, "initializing", message)
    
    async def report_processing_progress(
        self,
        context: StreamingToolExecutionContext,
        progress: float,
        message: Optional[str] = None,
        intermediate_data: Optional[Dict[str, Any]] = None,
    ):
        """Report processing progress."""
        await context.report_progress(progress, "processing", message, intermediate_data)
    
    async def report_finalization_progress(
        self,
        context: StreamingToolExecutionContext,
        message: str = "Finalizing results...",
    ):
        """Report finalization progress."""
        await context.report_progress(0.9, "finalizing", message)
    
    async def report_completion_progress(
        self,
        context: StreamingToolExecutionContext,
        message: str = "Execution completed",
    ):
        """Report completion progress."""
        await context.report_progress(1.0, "completed", message)
    
    async def report_error_progress(
        self,
        context: StreamingToolExecutionContext,
        error: str,
        error_type: Optional[str] = None,
        retryable: bool = False,
    ):
        """Report error progress."""
        await context.report_error(error, error_type, retryable)
