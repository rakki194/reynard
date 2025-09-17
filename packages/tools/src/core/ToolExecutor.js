/**
 * Tool executor with advanced features like retry, timeout, and parallel execution
 */
export class ToolExecutor {
    constructor(tools = []) {
        Object.defineProperty(this, "registry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "executionHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "activeExecutions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        for (const tool of tools) {
            this.registry.set(tool.name, tool);
        }
    }
    /**
     * Add a tool to the executor
     */
    addTool(tool) {
        this.registry.set(tool.name, tool);
    }
    /**
     * Remove a tool from the executor
     */
    removeTool(toolName) {
        return this.registry.delete(toolName);
    }
    /**
     * Execute a single tool with retry and timeout
     */
    async executeTool(toolName, parameters, context) {
        const tool = this.registry.get(toolName);
        if (!tool) {
            throw new Error(`Tool '${toolName}' not found`);
        }
        const callId = this.generateCallId();
        const call = {
            toolName,
            parameters,
            callId,
            timestamp: new Date(),
        };
        // Check for active execution with same parameters
        const executionKey = this.getExecutionKey(toolName, parameters);
        if (this.activeExecutions.has(executionKey)) {
            return this.activeExecutions.get(executionKey);
        }
        // Create execution promise
        const executionPromise = this.executeWithRetry(tool, parameters, context, callId);
        this.activeExecutions.set(executionKey, executionPromise);
        try {
            const result = await executionPromise;
            this.recordExecution(call, result);
            return result;
        }
        finally {
            this.activeExecutions.delete(executionKey);
        }
    }
    /**
     * Execute multiple tools in parallel
     */
    async executeToolsParallel(executions, context) {
        const promises = executions.map((execution) => this.executeTool(execution.toolName, execution.parameters, context));
        return Promise.all(promises);
    }
    /**
     * Execute multiple tools sequentially
     */
    async executeToolsSequential(executions, context) {
        const results = [];
        for (const execution of executions) {
            const result = await this.executeTool(execution.toolName, execution.parameters, context);
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
    async executeToolsWithDependencies(executions, context) {
        const results = new Map();
        const executed = new Set();
        const pending = new Map();
        // Initialize pending executions
        for (const execution of executions) {
            pending.set(execution.toolName, execution);
        }
        while (pending.size > 0) {
            const readyExecutions = Array.from(pending.entries()).filter(([_, execution]) => !execution.dependsOn ||
                execution.dependsOn.every((dep) => executed.has(dep)));
            if (readyExecutions.length === 0) {
                throw new Error("Circular dependency detected in tool executions");
            }
            // Execute ready tools in parallel
            const promises = readyExecutions.map(async ([toolName, execution]) => {
                const result = await this.executeTool(toolName, execution.parameters, context);
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
    async executeWithRetry(tool, parameters, context, callId) {
        const maxRetries = context.retryCount || tool.retryCount;
        const timeout = context.timeout || tool.timeout;
        let lastError = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.executeWithTimeout(tool, parameters, context, timeout);
                return result;
            }
            catch (error) {
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
    async executeWithTimeout(tool, parameters, context, timeout) {
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
    calculateRetryDelay(attempt) {
        const baseDelay = 1000; // 1 second
        const maxDelay = 30000; // 30 seconds
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        const jitter = Math.random() * 0.1 * delay; // 10% jitter
        return delay + jitter;
    }
    /**
     * Sleep for the given number of milliseconds
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Generate a unique call ID
     */
    generateCallId() {
        return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get execution key for deduplication
     */
    getExecutionKey(toolName, parameters) {
        return `${toolName}_${JSON.stringify(parameters)}`;
    }
    /**
     * Record execution in history
     */
    recordExecution(call, result) {
        const callResult = {
            callId: call.callId,
            result,
            timestamp: new Date(),
        };
        if (!this.executionHistory.has(call.toolName)) {
            this.executionHistory.set(call.toolName, []);
        }
        const history = this.executionHistory.get(call.toolName);
        history.push(callResult);
        // Keep only last 100 executions per tool
        if (history.length > 100) {
            history.shift();
        }
    }
    /**
     * Get execution history for a tool
     */
    getExecutionHistory(toolName) {
        return this.executionHistory.get(toolName) || [];
    }
    /**
     * Get all execution history
     */
    getAllExecutionHistory() {
        return new Map(this.executionHistory);
    }
    /**
     * Clear execution history
     */
    clearHistory() {
        this.executionHistory.clear();
    }
    /**
     * Get active executions count
     */
    getActiveExecutionsCount() {
        return this.activeExecutions.size;
    }
    /**
     * Get available tools
     */
    getAvailableTools() {
        return Array.from(this.registry.keys());
    }
    /**
     * Check if tool is available
     */
    hasTool(toolName) {
        return this.registry.has(toolName);
    }
}
