/**
 * NLWeb Tool Actions
 *
 * Tool management action functions for the NLWeb composable.
 */
import { NLWebState } from "./useNLWebState.js";
import { NLWebTool } from "../types/index.js";
export interface NLWebToolActions {
    getTools: () => Promise<void>;
    registerTool: (tool: NLWebTool) => Promise<void>;
    unregisterTool: (name: string) => Promise<void>;
}
/**
 * Create NLWeb tool actions
 */
export declare function createNLWebToolActions(state: NLWebState, baseUrl: string, requestTimeout: number): NLWebToolActions;
