/**
 * Central registry for managing tools
 */
import { BaseTool } from "./BaseTool";
import { ToolResult, ToolExecutionContext, ToolRegistryStats } from "./types";
export declare class ToolRegistry {
    private tools;
    private categories;
    private tags;
    private metrics;
    /**
     * Register a tool in the registry
     */
    registerTool(tool: BaseTool): void;
    /**
     * Unregister a tool from the registry
     */
    unregisterTool(toolName: string): boolean;
    /**
     * Get a tool by name
     */
    getTool(toolName: string): BaseTool | undefined;
    /**
     * Get all registered tools
     */
    getAllTools(): BaseTool[];
    /**
     * Get tools by category
     */
    getToolsByCategory(category: string): BaseTool[];
    /**
     * Get tools by tag
     */
    getToolsByTag(tag: string): BaseTool[];
    /**
     * Search tools by name, description, or tags
     */
    searchTools(query: string): BaseTool[];
    /**
     * Execute a tool by name
     */
    executeTool(toolName: string, parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolResult>;
    /**
     * Get all available categories
     */
    getCategories(): string[];
    /**
     * Get all available tags
     */
    getTags(): string[];
    /**
     * Get registry statistics
     */
    getStats(): ToolRegistryStats;
    /**
     * Get tools as JSON schema for AI tool calling
     */
    getToolsAsJSONSchema(): any[];
    /**
     * Clear all tools from the registry
     */
    clear(): void;
    /**
     * Get tool count
     */
    getToolCount(): number;
    /**
     * Check if a tool is registered
     */
    hasTool(toolName: string): boolean;
}
