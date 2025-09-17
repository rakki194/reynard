/**
 * Tool Statistics
 *
 * Provides statistics and analytics for tool registries.
 */
import type { NLWebTool } from "../types/index.js";
/**
 * Calculate tool statistics
 */
export declare function calculateToolStats(tools: NLWebTool[], toolsByCategory: Map<string, Set<string>>, toolsByTag: Map<string, Set<string>>): {
    totalTools: number;
    toolsByCategory: Record<string, number>;
    toolsByTag: Record<string, number>;
};
