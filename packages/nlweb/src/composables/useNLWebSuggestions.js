/**
 * NLWeb Suggestions
 *
 * Suggestion management for the NLWeb composable.
 */
import { makeNLWebRequest, handleAPIError } from "./useNLWebRequest.js";
/**
 * Create suggestions action
 */
export function createSuggestionsAction(state, baseUrl, requestTimeout) {
    return async (query, context = {}) => {
        try {
            state.setLoading(true);
            state.setError(null);
            const response = await makeNLWebRequest("/suggest", baseUrl, requestTimeout, {
                method: "POST",
                body: JSON.stringify({ query, context }),
            });
            state.setSuggestions(response);
        }
        catch (error) {
            handleAPIError(state, error, "Failed to get suggestions");
        }
        finally {
            state.setLoading(false);
        }
    };
}
