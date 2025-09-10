# Streaming Tool Execution

This document describes the streaming tool execution functionality in Reynard, which allows tools to emit progress updates and intermediate results during execution.

## Overview

Streaming tool execution enables tools to provide real-time feedback during long-running operations. This is particularly useful for:

- File processing operations
- Data analysis tasks
- External API calls with progress tracking
- Batch operations with multiple steps

## Architecture

### Core Components

1. **StreamingBaseTool**: Abstract base class for tools that support streaming
2. **StreamingToolExecutionContext**: Extended execution context with progress callbacks
3. **StreamingToolResult**: Extended result class with streaming metadata
4. **ProgressReportingMixin**: Utility mixin for common progress reporting patterns

### Streaming Chunk Types

The system supports several types of streaming chunks:

- `tool_execution`: Initial tool execution notification
- `tool_execution_progress`: Progress updates during execution
- `tool_execution_error`: Error notifications during execution
- `tool_result`: Final execution result

## Creating a Streaming Tool

### Basic Implementation

```python
from app.tools.streaming_base import StreamingBaseTool, ProgressReportingMixin
from app.tools.base import ToolParameter, ParameterType

class MyStreamingTool(StreamingBaseTool, ProgressReportingMixin):
    @property
    def name(self) -> str:
        return "my.streaming_tool"

    @property
    def description(self) -> str:
        return "A streaming tool that demonstrates progress updates"

    @property
    def parameters(self):
        return [
            ToolParameter(
                name="input_file",
                type=ParameterType.STRING,
                description="Input file to process",
                required=True
            )
        ]

    async def execute_streaming(
        self,
        context: StreamingToolExecutionContext,
        **params
    ) -> AsyncGenerator[StreamingToolResult, None]:
        input_file = params.get("input_file")

        # Report initialization
        await self.report_initialization_progress(
            context, self.name, context.request_id or "unknown"
        )

        # Process in steps
        for i in range(5):
            progress = (i + 1) / 5

            await self.report_processing_progress(
                context,
                progress,
                f"Processing step {i + 1}",
                {"step": i + 1, "total_steps": 5}
            )

            # Simulate work
            await asyncio.sleep(0.5)

            # Yield intermediate result
            yield StreamingToolResult(
                success=True,
                data={"step": i + 1, "status": "completed"},
                metadata={"progress": progress},
                streamed_progress=True,
                total_progress_updates=i + 1
            )

        # Report completion
        await self.report_completion_progress(context, "Processing completed")

        # Yield final result
        yield StreamingToolResult(
            success=True,
            data={"message": "All steps completed successfully"},
            metadata={"total_steps": 5},
            streamed_progress=True,
            total_progress_updates=6
        )
```

### Error Handling

```python
async def execute_streaming(
    self,
    context: StreamingToolExecutionContext,
    **params
) -> AsyncGenerator[StreamingToolResult, None]:
    try:
        # Tool execution logic
        pass
    except Exception as e:
        # Report error
        await self.report_error_progress(
            context,
            str(e),
            error_type=type(e).__name__,
            retryable=True
        )

        # Yield error result
        yield StreamingToolResult(
            success=False,
            error=str(e),
            metadata={"error_type": type(e).__name__}
        )
```

## Progress Reporting Methods

The `ProgressReportingMixin` provides several utility methods:

- `report_initialization_progress()`: Report tool initialization (0% progress)
- `report_processing_progress()`: Report processing progress (0-100%)
- `report_finalization_progress()`: Report finalization (90% progress)
- `report_completion_progress()`: Report completion (100% progress)
- `report_error_progress()`: Report errors during execution

## Frontend Integration

The frontend automatically handles streaming tool execution through the `useOllama` composable. Tool execution progress is displayed in real-time with:

- Progress indicators
- Status messages
- Intermediate data display
- Error handling with retry options

### Example Usage

```typescript
// The frontend automatically handles streaming chunks
const { chatWithAssistant } = useOllama();

// Tool execution progress is automatically tracked
await chatWithAssistant("Process this file with the streaming tool");
```

## Example Tools

### StreamingExampleTool

A demonstration tool that shows streaming progress with configurable steps and delays.

**Parameters:**

- `operation`: Type of operation (process_data, analyze_files, generate_report)
- `steps`: Number of steps to simulate (1-20)
- `delay`: Delay between steps in seconds (0.1-2.0)

### StreamingErrorTool

A demonstration tool that shows error handling in streaming execution.

**Parameters:**

- `should_fail`: Whether the tool should fail
- `fail_step`: At which step to fail (if should_fail is true)

## Testing

Streaming tools can be tested using the provided test framework:

```python
import pytest
from app.tests.test_streaming_tools import TestStreamingExampleTool

@pytest.mark.asyncio
async def test_my_streaming_tool():
    tool = MyStreamingTool()
    context = StreamingToolExecutionContext(user_id="test", user_role="user")

    results = []
    async for result in tool.execute_streaming(context, input_file="test.txt"):
        results.append(result)

    assert len(results) > 0
    assert results[-1].success is True
```

## Best Practices

1. **Progress Granularity**: Report progress at meaningful intervals (not too frequent)
2. **Error Handling**: Always handle exceptions and report errors through the streaming context
3. **Intermediate Results**: Yield intermediate results when they provide value to the user
4. **Resource Cleanup**: Ensure proper cleanup in case of errors or cancellation
5. **Timeout Handling**: Respect the timeout specified in the execution context

## Migration from Regular Tools

To migrate an existing tool to support streaming:

1. Change the base class from `BaseTool` to `StreamingBaseTool`
2. Add `ProgressReportingMixin` to the class
3. Implement the `execute_streaming` method
4. Update the `execute` method to use the streaming implementation
5. Add progress reporting calls at appropriate points

The tool will continue to work with the existing non-streaming interface while gaining streaming capabilities.
