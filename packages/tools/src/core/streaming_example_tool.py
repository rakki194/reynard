"""
Example streaming tool that demonstrates streaming execution progress.

This tool shows how to implement a tool that can emit progress updates
and intermediate results during execution.
"""

import asyncio
import logging
from collections.abc import AsyncGenerator

from .base import ParameterType, ToolParameter
from .streaming_base import (
    ProgressReportingMixin,
    StreamingBaseTool,
    StreamingToolExecutionContext,
    StreamingToolResult,
)

logger = logging.getLogger(__name__)


class StreamingExampleTool(StreamingBaseTool, ProgressReportingMixin):
    """
    Example tool that demonstrates streaming execution progress.

    This tool simulates a long-running operation with progress updates
    and intermediate results.
    """

    @property
    def name(self) -> str:
        return "streaming.example"

    @property
    def description(self) -> str:
        return "Example tool that demonstrates streaming execution progress with intermediate results"

    @property
    def parameters(self):
        return [
            ToolParameter(
                name="operation",
                type=ParameterType.STRING,
                description="Type of operation to perform",
                required=True,
                choices=["process_data", "analyze_files", "generate_report"],
            ),
            ToolParameter(
                name="steps",
                type=ParameterType.INTEGER,
                description="Number of steps to simulate",
                required=False,
                default=5,
                min_value=1,
                max_value=20,
            ),
            ToolParameter(
                name="delay",
                type=ParameterType.FLOAT,
                description="Delay between steps in seconds",
                required=False,
                default=0.5,
                min_value=0.1,
                max_value=2.0,
            ),
        ]

    @property
    def category(self) -> str:
        return "examples"

    @property
    def tags(self):
        return ["streaming", "example", "demo", "progress"]

    async def execute_streaming(
        self, context: StreamingToolExecutionContext, **params
    ) -> AsyncGenerator[StreamingToolResult]:
        """
        Execute the tool with streaming progress updates.

        Args:
            context: Streaming execution context
            **params: Tool parameters

        Yields:
            StreamingToolResult objects with progress updates
        """
        operation = params.get("operation", "process_data")
        steps = params.get("steps", 5)
        delay = params.get("delay", 0.5)

        try:
            # Report initialization
            await self.report_initialization_progress(
                context, self.name, context.request_id or "unknown"
            )

            # Simulate processing steps
            results = []
            for i in range(steps):
                # Report processing progress
                progress = (i + 1) / steps
                step_name = f"Step {i + 1}"

                await self.report_processing_progress(
                    context,
                    progress,
                    f"Processing {step_name} of {operation}",
                    {
                        "step": i + 1,
                        "total_steps": steps,
                        "operation": operation,
                        "step_result": f"Completed {step_name}",
                    },
                )

                # Simulate work
                await asyncio.sleep(delay)

                # Add intermediate result
                results.append(
                    {
                        "step": i + 1,
                        "status": "completed",
                        "result": f"Step {i + 1} result for {operation}",
                    }
                )

                # Yield intermediate result
                yield StreamingToolResult(
                    success=True,
                    data={"intermediate_results": results, "current_step": i + 1},
                    metadata={
                        "progress": progress,
                        "step": i + 1,
                        "total_steps": steps,
                        "operation": operation,
                    },
                    streamed_progress=True,
                    total_progress_updates=i + 1,
                )

            # Report finalization
            await self.report_finalization_progress(context, "Finalizing results...")

            # Simulate final processing
            await asyncio.sleep(delay * 0.5)

            # Report completion
            await self.report_completion_progress(
                context, "Execution completed successfully"
            )

            # Yield final result
            final_data = {
                "operation": operation,
                "total_steps": steps,
                "results": results,
                "summary": f"Successfully completed {operation} in {steps} steps",
            }

            yield StreamingToolResult(
                success=True,
                data=final_data,
                metadata={
                    "operation": operation,
                    "total_steps": steps,
                    "execution_time": steps * delay,
                    "streamed_progress": True,
                },
                streamed_progress=True,
                total_progress_updates=steps + 2,  # +2 for init and final
            )

        except Exception as e:
            logger.error(f"Error in streaming example tool: {e}")

            # Report error
            await self.report_error_progress(
                context, str(e), error_type=type(e).__name__, retryable=True
            )

            # Yield error result
            yield StreamingToolResult(
                success=False,
                error=str(e),
                metadata={
                    "error_type": type(e).__name__,
                    "operation": operation,
                    "steps_completed": len(results) if "results" in locals() else 0,
                },
            )


class StreamingErrorTool(StreamingBaseTool, ProgressReportingMixin):
    """
    Example tool that demonstrates error handling in streaming execution.
    """

    @property
    def name(self) -> str:
        return "streaming.error_example"

    @property
    def description(self) -> str:
        return "Example tool that demonstrates error handling in streaming execution"

    @property
    def parameters(self):
        return [
            ToolParameter(
                name="should_fail",
                type=ParameterType.BOOLEAN,
                description="Whether the tool should fail",
                required=False,
                default=False,
            ),
            ToolParameter(
                name="fail_step",
                type=ParameterType.INTEGER,
                description="At which step to fail (if should_fail is true)",
                required=False,
                default=3,
                min_value=1,
                max_value=10,
            ),
        ]

    @property
    def category(self) -> str:
        return "examples"

    @property
    def tags(self):
        return ["streaming", "example", "error", "demo"]

    async def execute_streaming(
        self, context: StreamingToolExecutionContext, **params
    ) -> AsyncGenerator[StreamingToolResult]:
        """
        Execute the tool with error handling demonstration.
        """
        should_fail = params.get("should_fail", False)
        fail_step = params.get("fail_step", 3)

        try:
            # Report initialization
            await self.report_initialization_progress(
                context, self.name, context.request_id or "unknown"
            )

            # Simulate processing steps
            for i in range(5):
                # Report processing progress
                progress = (i + 1) / 5

                await self.report_processing_progress(
                    context,
                    progress,
                    f"Processing step {i + 1}",
                    {"step": i + 1, "total_steps": 5},
                )

                # Simulate work
                await asyncio.sleep(0.2)

                # Check if we should fail
                if should_fail and (i + 1) == fail_step:
                    raise Exception(f"Simulated failure at step {fail_step}")

                # Yield intermediate result
                yield StreamingToolResult(
                    success=True,
                    data={"step": i + 1, "status": "completed"},
                    metadata={"progress": progress, "step": i + 1},
                    streamed_progress=True,
                    total_progress_updates=i + 1,
                )

            # Report completion
            await self.report_completion_progress(
                context, "Execution completed successfully"
            )

            # Yield final result
            yield StreamingToolResult(
                success=True,
                data={"message": "All steps completed successfully"},
                metadata={"total_steps": 5},
                streamed_progress=True,
                total_progress_updates=6,
            )

        except Exception as e:
            logger.error(f"Error in streaming error example tool: {e}")

            # Report error
            await self.report_error_progress(
                context, str(e), error_type=type(e).__name__, retryable=True
            )

            # Yield error result
            yield StreamingToolResult(
                success=False,
                error=str(e),
                metadata={
                    "error_type": type(e).__name__,
                    "should_fail": should_fail,
                    "fail_step": fail_step,
                },
            )
