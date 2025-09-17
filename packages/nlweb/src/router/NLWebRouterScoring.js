/**
 * NLWeb Router Scoring
 *
 * Tool scoring logic for the NLWeb router.
 */
import { scoreTool } from "./NLWebRouterScoringCore.js";
/**
 * Create NLWeb router scoring
 */
export function createNLWebRouterScoring() {
    const scoreTools = async (query, tools, context) => {
        const results = [];
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
