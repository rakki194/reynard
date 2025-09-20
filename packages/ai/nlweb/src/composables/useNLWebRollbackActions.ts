/**
 * NLWeb Rollback Actions
 *
 * Rollback management action functions for the NLWeb composable.
 */

import { NLWebState } from "./useNLWebState.js";
import { makeNLWebRequest, handleAPIError } from "./useNLWebRequest.js";

export interface NLWebRollbackActions {
  enableRollback: () => Promise<void>;
  disableRollback: () => Promise<void>;
}

/**
 * Create NLWeb rollback actions
 */
export function createNLWebRollbackActions(
  state: NLWebState,
  baseUrl: string,
  requestTimeout: number
): NLWebRollbackActions {
  const enableRollback = async (): Promise<void> => {
    try {
      await makeNLWebRequest("/rollback", baseUrl, requestTimeout, {
        method: "POST",
        body: JSON.stringify({ enable: true }),
      });
    } catch (error) {
      handleAPIError(state, error, "Failed to enable rollback");
    }
  };

  const disableRollback = async (): Promise<void> => {
    try {
      await makeNLWebRequest("/rollback", baseUrl, requestTimeout, {
        method: "POST",
        body: JSON.stringify({ enable: false }),
      });
    } catch (error) {
      handleAPIError(state, error, "Failed to disable rollback");
    }
  };

  return {
    enableRollback,
    disableRollback,
  };
}
