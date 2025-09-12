/**
 * Context Matcher
 *
 * Determines if tools are suitable for specific contexts based on their parameters
 * and tags.
 */

import { NLWebTool } from "../types/index.js";

/**
 * Check if a tool is suitable for a specific context
 */
export function isToolSuitableForContext(
  tool: NLWebTool,
  context: Record<string, unknown>,
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

/**
 * Get tools suitable for a specific context
 */
export function getContextualTools(
  tools: NLWebTool[],
  context: Record<string, unknown>,
): NLWebTool[] {
  const suitableTools: NLWebTool[] = [];

  for (const tool of tools) {
    if (!tool.enabled) {
      continue;
    }

    // Check if tool is suitable for current context
    if (isToolSuitableForContext(tool, context)) {
      suitableTools.push(tool);
    }
  }

  // Sort by priority
  return suitableTools.sort((a, b) => b.priority - a.priority);
}
