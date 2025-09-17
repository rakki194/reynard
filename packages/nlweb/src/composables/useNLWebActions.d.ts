/**
 * NLWeb Actions
 *
 * Action functions for the NLWeb composable.
 */
import { NLWebState } from "./useNLWebState.js";
import { NLWebTool } from "../types/index.js";
export interface NLWebActions {
    getSuggestions: (query: string, context?: Record<string, unknown>) => Promise<void>;
    getHealth: () => Promise<void>;
    getConfiguration: () => Promise<void>;
    getTools: () => Promise<void>;
    registerTool: (tool: NLWebTool) => Promise<void>;
    unregisterTool: (name: string) => Promise<void>;
    enableRollback: () => Promise<void>;
    disableRollback: () => Promise<void>;
}
/**
 * Create NLWeb actions
 */
export declare function createNLWebActions(state: NLWebState, baseUrl: string, requestTimeout: number): NLWebActions;
