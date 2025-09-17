/**
 * Central registry for managing tools
 */
export class ToolRegistry {
    constructor() {
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "categories", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "tags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                totalCalls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                totalExecutionTime: 0,
            }
        });
    }
    /**
     * Register a tool in the registry
     */
    registerTool(tool) {
        if (this.tools.has(tool.name)) {
            throw new Error(`Tool '${tool.name}' is already registered`);
        }
        this.tools.set(tool.name, tool);
        // Update category index
        const category = tool.category;
        if (!this.categories.has(category)) {
            this.categories.set(category, new Set());
        }
        this.categories.get(category).add(tool.name);
        // Update tag index
        for (const tag of tool.tags) {
            if (!this.tags.has(tag)) {
                this.tags.set(tag, new Set());
            }
            this.tags.get(tag).add(tool.name);
        }
        console.log(`Registered tool: ${tool.name} (category: ${category})`);
    }
    /**
     * Unregister a tool from the registry
     */
    unregisterTool(toolName) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            return false;
        }
        this.tools.delete(toolName);
        // Remove from category index
        const category = tool.category;
        const categoryTools = this.categories.get(category);
        if (categoryTools) {
            categoryTools.delete(toolName);
            if (categoryTools.size === 0) {
                this.categories.delete(category);
            }
        }
        // Remove from tag index
        for (const tag of tool.tags) {
            const tagTools = this.tags.get(tag);
            if (tagTools) {
                tagTools.delete(toolName);
                if (tagTools.size === 0) {
                    this.tags.delete(tag);
                }
            }
        }
        console.log(`Unregistered tool: ${toolName}`);
        return true;
    }
    /**
     * Get a tool by name
     */
    getTool(toolName) {
        return this.tools.get(toolName);
    }
    /**
     * Get all registered tools
     */
    getAllTools() {
        return Array.from(this.tools.values());
    }
    /**
     * Get tools by category
     */
    getToolsByCategory(category) {
        const toolNames = this.categories.get(category);
        if (!toolNames) {
            return [];
        }
        return Array.from(toolNames)
            .map((name) => this.tools.get(name))
            .filter((tool) => tool !== undefined);
    }
    /**
     * Get tools by tag
     */
    getToolsByTag(tag) {
        const toolNames = this.tags.get(tag);
        if (!toolNames) {
            return [];
        }
        return Array.from(toolNames)
            .map((name) => this.tools.get(name))
            .filter((tool) => tool !== undefined);
    }
    /**
     * Search tools by name, description, or tags
     */
    searchTools(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllTools().filter((tool) => tool.name.toLowerCase().includes(lowerQuery) ||
            tool.description.toLowerCase().includes(lowerQuery) ||
            tool.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)));
    }
    /**
     * Execute a tool by name
     */
    async executeTool(toolName, parameters, context) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`Tool '${toolName}' not found`);
        }
        const startTime = Date.now();
        this.metrics.totalCalls++;
        try {
            const result = await tool.execute(parameters, context);
            if (result.success) {
                this.metrics.successfulCalls++;
            }
            else {
                this.metrics.failedCalls++;
            }
            this.metrics.totalExecutionTime += result.executionTime;
            return result;
        }
        catch (error) {
            this.metrics.failedCalls++;
            this.metrics.totalExecutionTime += Date.now() - startTime;
            throw error;
        }
    }
    /**
     * Get all available categories
     */
    getCategories() {
        return Array.from(this.categories.keys());
    }
    /**
     * Get all available tags
     */
    getTags() {
        return Array.from(this.tags.keys());
    }
    /**
     * Get registry statistics
     */
    getStats() {
        const tools = this.getAllTools();
        const topTools = tools
            .map((tool) => ({
            name: tool.name,
            calls: tool.metrics.totalCalls,
            successRate: tool.metrics.totalCalls > 0
                ? tool.metrics.successfulCalls / tool.metrics.totalCalls
                : 0,
        }))
            .sort((a, b) => b.calls - a.calls)
            .slice(0, 10);
        return {
            totalTools: this.tools.size,
            activeTools: tools.filter((tool) => tool.metrics.totalCalls > 0).length,
            totalCalls: this.metrics.totalCalls,
            successfulCalls: this.metrics.successfulCalls,
            failedCalls: this.metrics.failedCalls,
            averageExecutionTime: this.metrics.totalCalls > 0
                ? this.metrics.totalExecutionTime / this.metrics.totalCalls
                : 0,
            errorRate: this.metrics.totalCalls > 0
                ? this.metrics.failedCalls / this.metrics.totalCalls
                : 0,
            topTools,
        };
    }
    /**
     * Get tools as JSON schema for AI tool calling
     */
    getToolsAsJSONSchema() {
        return this.getAllTools().map((tool) => tool.toJSONSchema());
    }
    /**
     * Clear all tools from the registry
     */
    clear() {
        this.tools.clear();
        this.categories.clear();
        this.tags.clear();
        this.metrics = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalExecutionTime: 0,
        };
    }
    /**
     * Get tool count
     */
    getToolCount() {
        return this.tools.size;
    }
    /**
     * Check if a tool is registered
     */
    hasTool(toolName) {
        return this.tools.has(toolName);
    }
}
