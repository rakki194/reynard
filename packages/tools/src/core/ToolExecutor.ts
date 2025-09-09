/**
 * Tool executor with advanced features like retry, timeout, and parallel execution
 */

import { BaseTool } from "./BaseTool";
import {
  ToolResult,
  ToolExecutionContext,
  ToolCall,
  ToolCallResult,
} from "./types";

export class ToolExecutor {
  private registry: Map<string, BaseTool> = new Map();
  private executionHistory: Map<string, ToolCallResult[]> = new Map();
  private activeExecutions: Map<string, Promise<ToolResult>> = new Map();

  constructor(tools: BaseTool[] = []) {
    for (const tool of tools) {
      this.registry.set(tool.name, tool);
    }
  }

  /**
   * Add a tool to the executor
   */
  addTool(tool: BaseTool): void {
    this.registry.set(tool.name, tool);
  }

  /**
   * Remove a tool from the executor
   */
  removeTool(toolName: string): boolean {
    return this.registry.delete(toolName);
  }

  /**
   * Execute a single tool with retry and timeout
   */
  async executeTool(
    toolName: string,
    parameters: Record<string, any>,
    context: ToolExecutionContext,
  ): Promise<ToolResult> {
    const tool = this.registry.get(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    const callId = this.generateCallId();
    const call: ToolCall = {
      toolName,
      parameters,
      callId,
      timestamp: new Date(),
    };

    // Check for active execution with same parameters
    const executionKey = this.getExecutionKey(toolName, parameters);
    if (this.activeExecutions.has(executionKey)) {
      return this.activeExecutions.get(executionKey)!;
    }

    // Create execution promise
    const executionPromise = this.executeWithRetry(
      tool,
      parameters,
      context,
      callId,
    );
    this.activeExecutions.set(executionKey, executionPromise);

    try {
      const result = await executionPromise;
      this.recordExecution(call, result);
      return result;
    } finally {
      this.activeExecutions.delete(executionKey);
    }
  }

  /**
   * Execute multiple tools in parallel
   */
  async executeToolsParallel(
    executions: Array<{
      toolName: string;
      parameters: Record<string, any>;
    }>,
    context: ToolExecutionContext,
  ): Promise<ToolResult[]> {
    const promises = executions.map((execution) =>
      this.executeTool(execution.toolName, execution.parameters, context),
    );

    return Promise.all(promises);
  }

  /**
   * Execute multiple tools sequentially
   */
  async executeToolsSequential(
    executions: Array<{
      toolName: string;
      parameters: Record<string, any>;
    }>,
    context: ToolExecutionContext,
  ): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const execution of executions) {
      const result = await this.executeTool(
        execution.toolName,
        execution.parameters,
        context,
      );
      results.push(result);

      // Stop execution if a tool fails and context doesn't allow failures
      if (!result.success && !context.metadata.continueOnFailure) {
        break;
      }
    }

    return results;
  }

  /**
   * Execute tools with dependency resolution
   */
  async executeToolsWithDependencies(
    executions: Array<{
      toolName: string;
      parameters: Record<string, any>;
      dependsOn?: string[];
    }>,
    context: ToolExecutionContext,
  ): Promise<Map<string, ToolResult>> {
    const results = new Map<string, ToolResult>();
    const executed = new Set<string>();
    const pending = new Map<string, (typeof executions)[0]>();

    // Initialize pending executions
    for (const execution of executions) {
      pending.set(execution.toolName, execution);
    }

    while (pending.size > 0) {
      const readyExecutions = Array.from(pending.entries()).filter(
        ([_, execution]) =>
          !execution.dependsOn ||
          execution.dependsOn.every((dep) => executed.has(dep)),
      );

      if (readyExecutions.length === 0) {
        throw new Error("Circular dependency detected in tool executions");
      }

      // Execute ready tools in parallel
      const promises = readyExecutions.map(async ([toolName, execution]) => {
        const result = await this.executeTool(
          toolName,
          execution.parameters,
          context,
        );
        results.set(toolName, result);
        executed.add(toolName);
        pending.delete(toolName);
        return { toolName, result };
      });

      await Promise.all(promises);
    }

    return results;
  }

  /**
   * Execute tool with retry logic
   */
  private async executeWithRetry(
    tool: BaseTool,
    parameters: Record<string, any>,
    context: ToolExecutionContext,
    callId: string,
  ): Promise<ToolResult> {
    const maxRetries = context.retryCount || tool.retryCount;
    const timeout = context.timeout || tool.timeout;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeWithTimeout(
          tool,
          parameters,
          context,
          timeout,
        );
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || "Unknown error",
      executionTime: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Execute tool with timeout
   */
  private async executeWithTimeout(
    tool: BaseTool,
    parameters: Record<string, any>,
    context: ToolExecutionContext,
    timeout: number,
  ): Promise<ToolResult> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Tool execution timed out after ${timeout}ms`));
      }, timeout);

      tool
        .execute(parameters, context)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    const jitter = Math.random() * 0.1 * delay; // 10% jitter
    return delay + jitter;
  }

  /**
   * Sleep for the given number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate a unique call ID
   */
  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get execution key for deduplication
   */
  private getExecutionKey(
    toolName: string,
    parameters: Record<string, any>,
  ): string {
    return `${toolName}_${JSON.stringify(parameters)}`;
  }

  /**
   * Record execution in history
   */
  private recordExecution(call: ToolCall, result: ToolResult): void {
    const callResult: ToolCallResult = {
      callId: call.callId,
      result,
      timestamp: new Date(),
    };

    if (!this.executionHistory.has(call.toolName)) {
      this.executionHistory.set(call.toolName, []);
    }

    const history = this.executionHistory.get(call.toolName)!;
    history.push(callResult);

    // Keep only last 100 executions per tool
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Get execution history for a tool
   */
  getExecutionHistory(toolName: string): ToolCallResult[] {
    return this.executionHistory.get(toolName) || [];
  }

  /**
   * Get all execution history
   */
  getAllExecutionHistory(): Map<string, ToolCallResult[]> {
    return new Map(this.executionHistory);
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory.clear();
  }

  /**
   * Get active executions count
   */
  getActiveExecutionsCount(): number {
    return this.activeExecutions.size;
  }

  /**
   * Get available tools
   */
  getAvailableTools(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Check if tool is available
   */
  hasTool(toolName: string): boolean {
    return this.registry.has(toolName);
  }
}
