/**
 * NLWeb Tool Management
 *
 * Tool management for the NLWeb composable.
 */
import { makeNLWebRequest, handleAPIError } from "./useNLWebRequest.js";
/**
 * Create get tools action
 */
export function createGetToolsAction(state, baseUrl, requestTimeout) {
    return async () => {
        try {
            const response = await makeNLWebRequest("/tools", baseUrl, requestTimeout);
            state.setTools(response.tools);
        }
        catch (error) {
            handleAPIError(state, error, "Failed to get tools");
        }
    };
}
/**
 * Create register tool action
 */
export function createRegisterToolAction(state, baseUrl, requestTimeout, getTools) {
    return async (tool) => {
        try {
            state.setLoading(true);
            state.setError(null);
            await makeNLWebRequest("/tools", baseUrl, requestTimeout, {
                method: "POST",
                body: JSON.stringify(tool),
            });
            // Refresh tools list
            await getTools();
        }
        catch (error) {
            handleAPIError(state, error, "Failed to register tool");
        }
        finally {
            state.setLoading(false);
        }
    };
}
/**
 * Create unregister tool action
 */
export function createUnregisterToolAction(state, baseUrl, requestTimeout, getTools) {
    return async (name) => {
        try {
            state.setLoading(true);
            state.setError(null);
            await makeNLWebRequest(`/tools/${name}`, baseUrl, requestTimeout, {
                method: "DELETE",
            });
            // Refresh tools list
            await getTools();
        }
        catch (error) {
            handleAPIError(state, error, "Failed to unregister tool");
        }
        finally {
            state.setLoading(false);
        }
    };
}
