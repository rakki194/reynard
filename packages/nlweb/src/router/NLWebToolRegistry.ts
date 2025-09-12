/**
 * NLWeb Tool Registry
 *
 * Manages the registration and discovery of tools for the NLWeb routing system.
 * Provides a more flexible alternative to XML-based tool configuration.
 */

import {
  NLWebTool,
  NLWebToolRegistry as INLWebToolRegistry,
} from "../types/index.js";

export class NLWebToolRegistry implements INLWebToolRegistry {
  private tools = new Map<string, NLWebTool>();
  private toolsByCategory = new Map<string, Set<string>>();
  private toolsByTag = new Map<string, Set<string>>();

  /**
   * Register a new tool
   */
  register(tool: NLWebTool): void {
    // Validate tool
    this.validateTool(tool);

    // Remove existing tool if it exists
    if (this.tools.has(tool.name)) {
      this.unregister(tool.name);
    }

    // Register the tool
    this.tools.set(tool.name, tool);

    // Update category index
    if (!this.toolsByCategory.has(tool.category)) {
      this.toolsByCategory.set(tool.category, new Set());
    }
    this.toolsByCategory.get(tool.category)!.add(tool.name);

    // Update tag index
    for (const tag of tool.tags) {
      if (!this.toolsByTag.has(tag)) {
        this.toolsByTag.set(tag, new Set());
      }
      this.toolsByTag.get(tag)!.add(tool.name);
    }
  }

  /**
   * Unregister a tool
   */
  unregister(toolName: string): void {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return;
    }

    // Remove from main registry
    this.tools.delete(toolName);

    // Remove from category index
    const categorySet = this.toolsByCategory.get(tool.category);
    if (categorySet) {
      categorySet.delete(toolName);
      if (categorySet.size === 0) {
        this.toolsByCategory.delete(tool.category);
      }
    }

    // Remove from tag index
    for (const tag of tool.tags) {
      const tagSet = this.toolsByTag.get(tag);
      if (tagSet) {
        tagSet.delete(toolName);
        if (tagSet.size === 0) {
          this.toolsByTag.delete(tag);
        }
      }
    }
  }

  /**
   * Get all registered tools
   */
  getAllTools(): NLWebTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): NLWebTool[] {
    const toolNames = this.toolsByCategory.get(category);
    if (!toolNames) {
      return [];
    }

    return Array.from(toolNames)
      .map((name) => this.tools.get(name))
      .filter((tool): tool is NLWebTool => tool !== undefined);
  }

  /**
   * Get tools by tags
   */
  getToolsByTags(tags: string[]): NLWebTool[] {
    if (tags.length === 0) {
      return this.getAllTools();
    }

    // Find tools that have all the specified tags
    const matchingToolNames = new Set<string>();
    let isFirstTag = true;

    for (const tag of tags) {
      const tagSet = this.toolsByTag.get(tag);
      if (!tagSet) {
        return []; // No tools have this tag
      }

      if (isFirstTag) {
        tagSet.forEach((name) => matchingToolNames.add(name));
        isFirstTag = false;
      } else {
        // Intersection with existing matches
        for (const name of matchingToolNames) {
          if (!tagSet.has(name)) {
            matchingToolNames.delete(name);
          }
        }
      }
    }

    return Array.from(matchingToolNames)
      .map((name) => this.tools.get(name))
      .filter((tool): tool is NLWebTool => tool !== undefined);
  }

  /**
   * Get a specific tool by name
   */
  getTool(toolName: string): NLWebTool | undefined {
    return this.tools.get(toolName);
  }

  /**
   * Check if a tool is registered
   */
  hasTool(toolName: string): boolean {
    return this.tools.has(toolName);
  }

  /**
   * Get tool statistics
   */
  getStats(): {
    totalTools: number;
    toolsByCategory: Record<string, number>;
    toolsByTag: Record<string, number>;
  } {
    const toolsByCategory: Record<string, number> = {};
    for (const [category, toolNames] of this.toolsByCategory) {
      toolsByCategory[category] = toolNames.size;
    }

    const toolsByTag: Record<string, number> = {};
    for (const [tag, toolNames] of this.toolsByTag) {
      toolsByTag[tag] = toolNames.size;
    }

    return {
      totalTools: this.tools.size,
      toolsByCategory,
      toolsByTag,
    };
  }

  /**
   * Search tools by query
   */
  searchTools(query: string): NLWebTool[] {
    const normalizedQuery = query.toLowerCase();
    const results: NLWebTool[] = [];

    for (const tool of this.tools.values()) {
      if (!tool.enabled) {
        continue;
      }

      // Check name match
      if (tool.name.toLowerCase().includes(normalizedQuery)) {
        results.push(tool);
        continue;
      }

      // Check description match
      if (tool.description.toLowerCase().includes(normalizedQuery)) {
        results.push(tool);
        continue;
      }

      // Check tag match
      if (
        tool.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      ) {
        results.push(tool);
        continue;
      }

      // Check example match
      if (
        tool.examples.some((example) =>
          example.toLowerCase().includes(normalizedQuery),
        )
      ) {
        results.push(tool);
        continue;
      }
    }

    // Sort by priority (higher priority first)
    return results.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get tools suitable for a specific context
   */
  getContextualTools(context: Record<string, any>): NLWebTool[] {
    const tools: NLWebTool[] = [];

    for (const tool of this.tools.values()) {
      if (!tool.enabled) {
        continue;
      }

      // Check if tool is suitable for current context
      if (this.isToolSuitableForContext(tool, context)) {
        tools.push(tool);
      }
    }

    // Sort by priority
    return tools.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Validate a tool before registration
   */
  private validateTool(tool: NLWebTool): void {
    if (!tool.name || typeof tool.name !== "string") {
      throw new Error("Tool name is required and must be a string");
    }

    if (!tool.description || typeof tool.description !== "string") {
      throw new Error("Tool description is required and must be a string");
    }

    if (!tool.category || typeof tool.category !== "string") {
      throw new Error("Tool category is required and must be a string");
    }

    if (!Array.isArray(tool.tags)) {
      throw new Error("Tool tags must be an array");
    }

    if (!tool.path || typeof tool.path !== "string") {
      throw new Error("Tool path is required and must be a string");
    }

    if (!["GET", "POST", "PUT", "DELETE"].includes(tool.method)) {
      throw new Error("Tool method must be one of: GET, POST, PUT, DELETE");
    }

    if (!Array.isArray(tool.parameters)) {
      throw new Error("Tool parameters must be an array");
    }

    if (!Array.isArray(tool.examples)) {
      throw new Error("Tool examples must be an array");
    }

    if (typeof tool.enabled !== "boolean") {
      throw new Error("Tool enabled must be a boolean");
    }

    if (typeof tool.priority !== "number" || tool.priority < 0) {
      throw new Error("Tool priority must be a non-negative number");
    }

    if (typeof tool.timeout !== "number" || tool.timeout <= 0) {
      throw new Error("Tool timeout must be a positive number");
    }
  }

  /**
   * Check if a tool is suitable for a specific context
   */
  private isToolSuitableForContext(
    tool: NLWebTool,
    context: Record<string, any>,
  ): boolean {
    // Check if tool requires specific context that's not available
    for (const param of tool.parameters) {
      if (param.required && !context[param.name]) {
        // If required parameter is not in context, tool might not be suitable
        // But we'll still include it as the context might be provided later
        continue;
      }
    }

    // Check for context-specific tags
    if (context.currentPath && tool.tags.includes("file-operations")) {
      return true;
    }

    if (context.gitStatus && tool.tags.includes("git")) {
      return true;
    }

    if (context.selectedItems && tool.tags.includes("batch-operations")) {
      return true;
    }

    // Default: include all enabled tools
    return true;
  }
}
