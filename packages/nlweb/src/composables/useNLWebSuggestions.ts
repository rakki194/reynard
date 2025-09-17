/**
 * NLWeb Suggestions
 *
 * Suggestion management for the NLWeb composable.
 */

import { NLWebState } from "./useNLWebState.js";
import { NLWebSuggestionResponse } from "../types/index.js";
import { makeNLWebRequest, handleAPIError } from "./useNLWebRequest.js";

/**
 * Create suggestions action
 */
export function createSuggestionsAction(
  state: NLWebState,
  baseUrl: string,
  requestTimeout: number
): (query: string, context?: Record<string, unknown>) => Promise<void> {
  return async (query: string, context: Record<string, unknown> = {}): Promise<void> => {
    try {
      state.setLoading(true);
      state.setError(null);

      const response = await makeNLWebRequest<NLWebSuggestionResponse>("/suggest", baseUrl, requestTimeout, {
        method: "POST",
        body: JSON.stringify({ query, context }),
      });

      state.setSuggestions(response);
    } catch (error) {
      handleAPIError(state, error, "Failed to get suggestions");
    } finally {
      state.setLoading(false);
    }
  };
}
