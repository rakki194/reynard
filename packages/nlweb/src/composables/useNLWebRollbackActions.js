/**
 * NLWeb Rollback Actions
 *
 * Rollback management action functions for the NLWeb composable.
 */
import { makeNLWebRequest, handleAPIError } from "./useNLWebRequest.js";
/**
 * Create NLWeb rollback actions
 */
export function createNLWebRollbackActions(state, baseUrl, requestTimeout) {
    const enableRollback = async () => {
        try {
            await makeNLWebRequest("/rollback", baseUrl, requestTimeout, {
                method: "POST",
                body: JSON.stringify({ enable: true }),
            });
        }
        catch (error) {
            handleAPIError(state, error, "Failed to enable rollback");
        }
    };
    const disableRollback = async () => {
        try {
            await makeNLWebRequest("/rollback", baseUrl, requestTimeout, {
                method: "POST",
                body: JSON.stringify({ enable: false }),
            });
        }
        catch (error) {
            handleAPIError(state, error, "Failed to disable rollback");
        }
    };
    return {
        enableRollback,
        disableRollback,
    };
}
