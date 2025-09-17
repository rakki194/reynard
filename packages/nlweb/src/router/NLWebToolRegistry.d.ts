/**
 * NLWeb Tool Registry
 *
 * Manages the registration and discovery of tools for the NLWeb routing system.
 * Provides a more flexible alternative to XML-based tool configuration.
 */
import type { NLWebTool, NLWebToolRegistry as INLWebToolRegistry } from "../types/index.js";
export declare class NLWebToolRegistry implements INLWebToolRegistry {
    private tools;
    private toolsByCategory;
    private toolsByTag;
    /**
     * Register a new tool
     */
    register(tool: NLWebTool): void;
    /**
     * Unregister a tool
     */
    unregister(toolName: string): void;
    /**
     * Get all registered tools
     */
    getAllTools(): NLWebTool[];
    /**
     * Get tools by category
     */
    getToolsByCategory(category: string): NLWebTool[];
    /**
     * Get tools by tags
     */
    getToolsByTags(tags: string[]): NLWebTool[];
    /**
     * Get a specific tool by name
     */
    getTool(toolName: string): NLWebTool | undefined;
    /**
     * Check if a tool is registered
     */
    hasTool(toolName: string): boolean;
    /**
     * Get tool statistics
     */
    getStats(): {
        totalTools: number;
        toolsByCategory: Record<string, number>;
        toolsByTag: Record<string, number>;
    };
    /**
     * Search tools by query
     */
    searchTools(query: string): NLWebTool[];
    /**
     * Get tools suitable for a specific context
     */
    getContextualTools(context: Record<string, unknown>): NLWebTool[];
}
