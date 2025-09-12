/**
 * NLWeb Tool Registry
 *
 * Manages the registration and discovery of tools for the NLWeb routing system.
 * Provides a more flexible alternative to XML-based tool configuration.
 */

import type {
  NLWebTool,
  NLWebToolRegistry as INLWebToolRegistry,
} from "../types/index.js";
import { validateTool } from "./tool-validator.js";
import { getContextualTools } from "./context-matcher.js";
import { searchTools, getToolsByTags, getToolsByCategory } from "./tool-searcher.js";
import { calculateToolStats } from "./tool-stats.js";
import {
  addToCategoryIndex,
  addToTagIndex,
  removeFromCategoryIndex,
  removeFromTagIndex,
} from "./tool-index.js";

export class NLWebToolRegistry implements INLWebToolRegistry {
  private tools = new Map<string, NLWebTool>();
  private toolsByCategory = new Map<string, Set<string>>();
  private toolsByTag = new Map<string, Set<string>>();

  /**
   * Register a new tool
   */
  register(tool: NLWebTool): void {
    // Validate tool
    validateTool(tool);

    // Remove existing tool if it exists
    if (this.tools.has(tool.name)) {
      this.unregister(tool.name);
    }

    // Register the tool
    this.tools.set(tool.name, tool);

    // Update indices
    addToCategoryIndex(this.toolsByCategory, tool);
    addToTagIndex(this.toolsByTag, tool);
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

    // Remove from indices
    removeFromCategoryIndex(this.toolsByCategory, tool);
    removeFromTagIndex(this.toolsByTag, tool);
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
    return getToolsByCategory(this.getAllTools(), category);
  }

  /**
   * Get tools by tags
   */
  getToolsByTags(tags: string[]): NLWebTool[] {
    return getToolsByTags(this.getAllTools(), tags);
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
    return calculateToolStats(
      this.getAllTools(),
      this.toolsByCategory,
      this.toolsByTag,
    );
  }

  /**
   * Search tools by query
   */
  searchTools(query: string): NLWebTool[] {
    return searchTools(this.getAllTools(), query);
  }

  /**
   * Get tools suitable for a specific context
   */
  getContextualTools(context: Record<string, unknown>): NLWebTool[] {
    return getContextualTools(this.getAllTools(), context);
  }

}
