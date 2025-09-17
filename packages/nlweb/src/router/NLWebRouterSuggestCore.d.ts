/**
 * NLWeb Router Suggest Core
 *
 * Core suggestion logic for the NLWeb router.
 */
import { NLWebSuggestionRequest, NLWebSuggestionResponse } from "../types/index.js";
import { NLWebRouterCache } from "./NLWebRouterCache.js";
export interface SuggestContext {
    request: NLWebSuggestionRequest;
    cache: NLWebRouterCache;
    toolRegistry: unknown;
    performanceStats: unknown;
    emitEvent: (type: string, data: unknown) => void;
}
/**
 * Check cache for existing suggestion
 */
export declare function checkCache(context: SuggestContext): NLWebSuggestionResponse | null;
/**
 * Generate new suggestion
 */
export declare function generateSuggestion(context: SuggestContext): Promise<NLWebSuggestionResponse>;
