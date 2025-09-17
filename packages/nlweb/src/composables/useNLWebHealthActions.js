/**
 * NLWeb Health Actions
 *
 * Health management for the NLWeb composable.
 */
import { makeNLWebRequest, handleAPIError } from "./useNLWebRequest.js";
/**
 * Create health action
 */
export function createHealthAction(state, baseUrl, requestTimeout) {
    return async () => {
        try {
            const response = await makeNLWebRequest("/health", baseUrl, requestTimeout);
            state.setHealth(response);
        }
        catch (error) {
            handleAPIError(state, error, "Failed to get health status");
        }
    };
}
/**
 * Create configuration action
 */
export function createConfigurationAction(state, baseUrl, requestTimeout) {
    return async () => {
        try {
            const response = await makeNLWebRequest("/status", baseUrl, requestTimeout);
            state.setConfiguration(response.configuration);
            state.setTools(response.tools || []);
        }
        catch (error) {
            handleAPIError(state, error, "Failed to get configuration");
        }
    };
}
