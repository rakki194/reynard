/**
 * Chat Tools Composable
 *
 * Handles tool management including tool calls, progress tracking,
 * and result processing
 */
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
export declare function useChatTools(options?: UseChatToolsOptions): UseChatToolsReturn;
