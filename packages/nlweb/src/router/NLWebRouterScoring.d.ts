/**
 * NLWeb Router Scoring
 *
 * Tool scoring logic for the NLWeb router.
 */
import { NLWebTool, NLWebContext } from "../types/index.js";
import { ToolScore } from "./NLWebRouterScoringCore.js";
export interface NLWebRouterScoring {
    scoreTools: (query: string, tools: NLWebTool[], context: NLWebContext) => Promise<ToolScore[]>;
}
/**
 * Create NLWeb router scoring
 */
export declare function createNLWebRouterScoring(): NLWebRouterScoring;
