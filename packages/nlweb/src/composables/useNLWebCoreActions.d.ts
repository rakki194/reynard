/**
 * NLWeb Core Actions
 *
 * Core action functions for the NLWeb composable.
 */
import { NLWebState } from "./useNLWebState.js";
export interface NLWebCoreActions {
    getSuggestions: (query: string, context?: Record<string, unknown>) => Promise<void>;
    getHealth: () => Promise<void>;
    getConfiguration: () => Promise<void>;
}
/**
 * Create NLWeb core actions
 */
export declare function createNLWebCoreActions(state: NLWebState, baseUrl: string, requestTimeout: number): NLWebCoreActions;
