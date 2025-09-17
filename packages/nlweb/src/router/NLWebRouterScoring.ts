/**
 * NLWeb Router Scoring
 *
 * Tool scoring logic for the NLWeb router.
 */

import { NLWebTool, NLWebContext } from "../types/index.js";
import { ToolScore, scoreTool } from "./NLWebRouterScoringCore.js";

export interface NLWebRouterScoring {
  scoreTools: (query: string, tools: NLWebTool[], context: NLWebContext) => Promise<ToolScore[]>;
}

/**
 * Create NLWeb router scoring
 */
export function createNLWebRouterScoring(): NLWebRouterScoring {
  const scoreTools = async (query: string, tools: NLWebTool[], context: NLWebContext): Promise<ToolScore[]> => {
    const results: ToolScore[] = [];

    for (const tool of tools) {
      const score = scoreTool(tool, query, context);
      results.push(score);
    }

    return results.sort((a, b) => b.score - a.score);
  };

  return {
    scoreTools,
  };
}
