/**
 * Tool Index Management
 *
 * Manages the indexing of tools by category and tags for efficient lookups.
 */
import type { NLWebTool } from "../types/index.js";
/**
 * Update category index when registering a tool
 */
export declare function addToCategoryIndex(toolsByCategory: Map<string, Set<string>>, tool: NLWebTool): void;
/**
 * Update tag index when registering a tool
 */
export declare function addToTagIndex(toolsByTag: Map<string, Set<string>>, tool: NLWebTool): void;
/**
 * Remove from category index when unregistering a tool
 */
export declare function removeFromCategoryIndex(toolsByCategory: Map<string, Set<string>>, tool: NLWebTool): void;
/**
 * Remove from tag index when unregistering a tool
 */
export declare function removeFromTagIndex(toolsByTag: Map<string, Set<string>>, tool: NLWebTool): void;
