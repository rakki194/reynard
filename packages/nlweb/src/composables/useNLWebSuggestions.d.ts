/**
 * NLWeb Suggestions
 *
 * Suggestion management for the NLWeb composable.
 */
import { NLWebState } from "./useNLWebState.js";
/**
 * Create suggestions action
 */
export declare function createSuggestionsAction(state: NLWebState, baseUrl: string, requestTimeout: number): (query: string, context?: Record<string, unknown>) => Promise<void>;
