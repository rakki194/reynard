/**
 * NLWeb Router Suggest
 *
 * Suggestion logic for the NLWeb router.
 */
import { NLWebSuggestionRequest, NLWebSuggestionResponse } from "../types/index.js";
import { NLWebRouterCache } from "./NLWebRouterCache.js";
export interface NLWebRouterSuggest {
    processSuggestion: (request: NLWebSuggestionRequest, cache: NLWebRouterCache, toolRegistry: unknown, performanceStats: unknown, emitEvent: (type: string, data: unknown) => void) => Promise<NLWebSuggestionResponse>;
}
/**
 * Create NLWeb router suggest
 */
export declare function createNLWebRouterSuggest(): NLWebRouterSuggest;
