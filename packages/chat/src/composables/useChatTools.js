/**
 * Chat Tools Composable
 *
 * Handles tool management including tool calls, progress tracking,
 * and result processing
 */
import { createSignal } from "solid-js";
export function useChatTools(options = {}) {
    const { tools = [] } = options;
    // Tool state
    const [availableTools] = createSignal(tools);
    // Generate unique tool call ID
    const generateToolCallId = () => {
        return `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };
    // Handle tool call execution
    const handleToolCall = (toolExecution, messageId) => {
        const toolCall = {
            id: generateToolCallId(),
            name: toolExecution.toolName,
            arguments: toolExecution.parameters || {},
            status: "running",
            progress: toolExecution.progress,
            message: toolExecution.message,
            timing: {
                startTime: Date.now(),
            },
        };
        return toolCall;
    };
    // Update tool call progress
    const updateToolCallProgress = (toolExecution, messageId, updateMessage) => {
        // This would need access to the current message to update tool calls
        // For now, we'll provide the logic that can be used by the calling composable
        const updatedToolCall = {
            progress: toolExecution.progress,
            message: toolExecution.message,
            status: toolExecution.status,
        };
        // The calling composable should handle the actual message update
        // This is a design choice to keep the tools composable focused
        return updatedToolCall;
    };
    // Handle tool result
    const handleToolResult = (toolExecution, messageId, updateMessage) => {
        // This would need access to the current message to update tool calls
        // For now, we'll provide the logic that can be used by the calling composable
        const updatedToolCall = {
            status: toolExecution.status,
            result: toolExecution.result,
            error: toolExecution.error,
            timing: {
                endTime: Date.now(),
                // duration would be calculated by the calling composable
            },
        };
        // The calling composable should handle the actual message update
        // This is a design choice to keep the tools composable focused
        return updatedToolCall;
    };
    return {
        availableTools,
        generateToolCallId,
        handleToolCall,
        updateToolCallProgress,
        handleToolResult,
    };
}
