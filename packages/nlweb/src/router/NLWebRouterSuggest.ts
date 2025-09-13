/**
 * NLWeb Router Suggest
 *
 * Suggestion logic for the NLWeb router.
 */

import {
  NLWebSuggestionRequest,
  NLWebSuggestionResponse,
} from "../types/index.js";
import { NLWebRouterCache } from "./NLWebRouterCache.js";
import {
  SuggestContext,
  checkCache,
  generateSuggestion,
} from "./NLWebRouterSuggestCore.js";

export interface NLWebRouterSuggest {
  processSuggestion: (
    request: NLWebSuggestionRequest,
    cache: NLWebRouterCache,
    toolRegistry: unknown,
    performanceStats: unknown,
    emitEvent: (type: string, data: unknown) => void,
  ) => Promise<NLWebSuggestionResponse>;
}

/**
 * Create NLWeb router suggest
 */
export function createNLWebRouterSuggest(): NLWebRouterSuggest {
  const processSuggestion = async (
    request: NLWebSuggestionRequest,
    cache: NLWebRouterCache,
    toolRegistry: unknown,
    performanceStats: unknown,
    emitEvent: (type: string, data: unknown) => void,
  ): Promise<NLWebSuggestionResponse> => {
    const context: SuggestContext = {
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
    } catch (error) {
      emitEvent("error", {
        error: error instanceof Error ? error.message : String(error),
      });

      throw new Error(
        `Failed to process query: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return {
    processSuggestion,
  };
}
