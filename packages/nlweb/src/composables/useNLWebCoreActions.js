/**
 * NLWeb Core Actions
 *
 * Core action functions for the NLWeb composable.
 */
import { createSuggestionsAction } from "./useNLWebSuggestions.js";
import { createHealthAction, createConfigurationAction, } from "./useNLWebHealthActions.js";
/**
 * Create NLWeb core actions
 */
export function createNLWebCoreActions(state, baseUrl, requestTimeout) {
    const getSuggestions = createSuggestionsAction(state, baseUrl, requestTimeout);
    const getHealth = createHealthAction(state, baseUrl, requestTimeout);
    const getConfiguration = createConfigurationAction(state, baseUrl, requestTimeout);
    return {
        getSuggestions,
        getHealth,
        getConfiguration,
    };
}
