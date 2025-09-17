/**
 * NLWeb Router Scoring Core
 *
 * Core scoring logic for the NLWeb router.
 */
import { NLWebTool, NLWebContext } from "../types/index.js";
export interface ToolScore {
    tool: NLWebTool;
    score: number;
    reasoning: string;
}
/**
 * Score tool based on query
 */
export declare function scoreTool(tool: NLWebTool, query: string, context: NLWebContext): ToolScore;
