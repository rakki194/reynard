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
export function checkCache(context: SuggestContext): NLWebSuggestionResponse | null {
  const { request, cache, performanceStats, emitEvent } = context;
  const cacheKey = cache.generateCacheKey(request);
  const cached = cache.get(cacheKey);

  if (cached && cache.isCacheValid(cached.timestamp)) {
    (performanceStats as any).cacheHits++;
    emitEvent("cache_hit", {
      key: cacheKey,
      age: Date.now() - cached.timestamp,
    });

    return {
      ...cached.response,
      cacheInfo: {
        hit: true,
        key: cacheKey,
        age: Date.now() - cached.timestamp,
      },
    };
  }

  (performanceStats as any).cacheMisses++;
  emitEvent("cache_miss", { key: cacheKey });
  return null;
}

/**
 * Generate new suggestion
 */
export async function generateSuggestion(context: SuggestContext): Promise<NLWebSuggestionResponse> {
  const { request, cache, toolRegistry, emitEvent } = context;
  const startTime = Date.now();
  const requestId = request.metadata?.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get available tools
  const availableTools = (toolRegistry as any).getAvailableTools();
  if (availableTools.length === 0) {
    throw new Error("No tools available");
  }

  // Score tools based on query
  const scoredTools = await (toolRegistry as any).scoreTools(request.query, availableTools, request.context);

  // Generate suggestions
  const suggestions = scoredTools.slice(0, request.maxSuggestions).map((tool: any) => ({
    tool: tool.tool,
    score: tool.score,
    parameters: tool.parameters,
    reasoning: tool.reasoning,
    parameterHints: tool.parameterHints,
  }));

  const response: NLWebSuggestionResponse = {
    suggestions,
    requestId,
    processingTime: Date.now() - startTime,
    cacheInfo: {
      hit: false,
      key: cache.generateCacheKey(request),
    },
  };

  // Cache the response
  cache.set(cache.generateCacheKey(request), {
    response,
    timestamp: Date.now(),
  });

  emitEvent("suggestion_complete", {
    requestId,
    suggestionsCount: suggestions.length,
    processingTime: response.processingTime,
  });

  return response;
}
