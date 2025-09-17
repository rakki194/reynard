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
export declare function isToolSuitableForContext(tool: NLWebTool, context: Record<string, unknown>): boolean;
/**
 * Get tools suitable for a specific context
 */
export declare function getContextualTools(tools: NLWebTool[], context: Record<string, unknown>): NLWebTool[];
