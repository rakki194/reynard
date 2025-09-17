/**
 * Tool Searcher
 *
 * Provides search functionality for finding tools based on various criteria.
 */
import { NLWebTool } from "../types/index.js";
/**
 * Search tools by query
 */
export declare function searchTools(tools: NLWebTool[], query: string): NLWebTool[];
/**
 * Get tools by tags with intersection logic
 */
export declare function getToolsByTags(tools: NLWebTool[], tags: string[]): NLWebTool[];
/**
 * Get tools by category
 */
export declare function getToolsByCategory(tools: NLWebTool[], category: string): NLWebTool[];
