/**
 * NLWeb Router Suggest
 *
 * Suggestion logic for the NLWeb router.
 */
import { checkCache, generateSuggestion, } from "./NLWebRouterSuggestCore.js";
/**
 * Create NLWeb router suggest
 */
export function createNLWebRouterSuggest() {
    const processSuggestion = async (request, cache, toolRegistry, performanceStats, emitEvent) => {
        const context = {
            request,
            cache,
            toolRegistry,
            performanceStats,
            emitEvent,
        };
        try {
            // Check cache first
            const cached = checkCache(context);
            if (cached) {
                return cached;
            }
            // Generate new suggestion
            return await generateSuggestion(context);
        }
        catch (error) {
            emitEvent("error", {
                error: error instanceof Error ? error.message : String(error),
            });
            throw new Error(`Failed to process query: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    return {
        processSuggestion,
    };
}
