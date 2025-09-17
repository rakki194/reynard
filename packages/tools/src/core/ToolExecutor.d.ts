/**
 * Tool executor with advanced features like retry, timeout, and parallel execution
 */
import { BaseTool } from "./BaseTool";
import { ToolResult, ToolExecutionContext, ToolCallResult } from "./types";
export declare class ToolExecutor {
    private registry;
    private executionHistory;
    private activeExecutions;
    constructor(tools?: BaseTool[]);
    /**
     * Add a tool to the executor
     */
    addTool(tool: BaseTool): void;
    /**
     * Remove a tool from the executor
     */
    removeTool(toolName: string): boolean;
    /**
     * Execute a single tool with retry and timeout
     */
    executeTool(toolName: string, parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
    /**
     * Execute multiple tools in parallel
     */
    executeToolsParallel(executions: Array<{
        toolName: string;
        parameters: Record<string, any>;
    }>, context: ToolExecutionContext): Promise<ToolResult[]>;
    /**
     * Execute multiple tools sequentially
     */
    executeToolsSequential(executions: Array<{
        toolName: string;
        parameters: Record<string, any>;
    }>, context: ToolExecutionContext): Promise<ToolResult[]>;
    /**
     * Execute tools with dependency resolution
     */
    executeToolsWithDependencies(executions: Array<{
        toolName: string;
        parameters: Record<string, any>;
        dependsOn?: string[];
    }>, context: ToolExecutionContext): Promise<Map<string, ToolResult>>;
    /**
     * Execute tool with retry logic
     */
    private executeWithRetry;
    /**
     * Execute tool with timeout
     */
    private executeWithTimeout;
    /**
     * Calculate retry delay with exponential backoff
     */
    private calculateRetryDelay;
    /**
     * Sleep for the given number of milliseconds
     */
    private sleep;
    /**
     * Generate a unique call ID
     */
    private generateCallId;
    /**
     * Get execution key for deduplication
     */
    private getExecutionKey;
    /**
     * Record execution in history
     */
    private recordExecution;
    /**
     * Get execution history for a tool
     */
    getExecutionHistory(toolName: string): ToolCallResult[];
    /**
     * Get all execution history
     */
    getAllExecutionHistory(): Map<string, ToolCallResult[]>;
    /**
     * Clear execution history
     */
    clearHistory(): void;
    /**
     * Get active executions count
     */
    getActiveExecutionsCount(): number;
    /**
     * Get available tools
     */
    getAvailableTools(): string[];
    /**
     * Check if tool is available
     */
    hasTool(toolName: string): boolean;
}
