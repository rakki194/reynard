/**
 * Tool Statistics
 *
 * Provides statistics and analytics for tool registries.
 */

import type { NLWebTool } from "../types/index.js";

/**
 * Calculate tool statistics
 */
export function calculateToolStats(
  tools: NLWebTool[],
  toolsByCategory: Map<string, Set<string>>,
  toolsByTag: Map<string, Set<string>>,
): {
  totalTools: number;
  toolsByCategory: Record<string, number>;
  toolsByTag: Record<string, number>;
} {
  const toolsByCategoryRecord: Record<string, number> = {};
  for (const [category, toolNames] of toolsByCategory) {
    toolsByCategoryRecord[category] = toolNames.size;
  }

  const toolsByTagRecord: Record<string, number> = {};
  for (const [tag, toolNames] of toolsByTag) {
    toolsByTagRecord[tag] = toolNames.size;
  }

  return {
    totalTools: tools.length,
    toolsByCategory: toolsByCategoryRecord,
    toolsByTag: toolsByTagRecord,
  };
}
