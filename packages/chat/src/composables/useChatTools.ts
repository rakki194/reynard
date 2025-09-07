/**
 * Chat Tools Composable
 * 
 * Handles tool management including tool calls, progress tracking,
 * and result processing
 */

import { createSignal } from "solid-js";
import type { Tool, ToolCall, StreamChunk } from "../types";

export interface UseChatToolsOptions {
  /** Available tools */
  tools?: Tool[];
}

export interface UseChatToolsReturn {
  availableTools: () => Tool[];
  generateToolCallId: () => string;
  handleToolCall: (toolExecution: NonNullable<StreamChunk["toolExecution"]>, messageId: string) => ToolCall;
  updateToolCallProgress: (toolExecution: NonNullable<StreamChunk["toolExecution"]>, messageId: string, updateMessage: (id: string, updates: any) => void) => void;
  handleToolResult: (toolExecution: NonNullable<StreamChunk["toolExecution"]>, messageId: string, updateMessage: (id: string, updates: any) => void) => void;
}

export function useChatTools(options: UseChatToolsOptions = {}): UseChatToolsReturn {
  const { tools = [] } = options;

  // Tool state
  const [availableTools] = createSignal<Tool[]>(tools);

  // Generate unique tool call ID
  const generateToolCallId = (): string => {
    return `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle tool call execution
  const handleToolCall = (
    toolExecution: NonNullable<StreamChunk["toolExecution"]>,
    messageId: string,
  ): ToolCall => {
    const toolCall: ToolCall = {
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
  const updateToolCallProgress = (
    toolExecution: NonNullable<StreamChunk["toolExecution"]>,
    messageId: string,
    updateMessage: (id: string, updates: any) => void,
  ) => {
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
  const handleToolResult = (
    toolExecution: NonNullable<StreamChunk["toolExecution"]>,
    messageId: string,
    updateMessage: (id: string, updates: any) => void,
  ) => {
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
