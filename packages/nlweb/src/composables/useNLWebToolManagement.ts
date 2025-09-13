/**
 * NLWeb Tool Management
 *
 * Tool management for the NLWeb composable.
 */

import { NLWebState } from "./useNLWebState.js";
import { NLWebTool } from "../types/index.js";
import { makeNLWebRequest, handleAPIError } from "./useNLWebRequest.js";

/**
 * Create get tools action
 */
export function createGetToolsAction(
  state: NLWebState,
  baseUrl: string,
  requestTimeout: number,
): () => Promise<void> {
  return async (): Promise<void> => {
    try {
      const response = await makeNLWebRequest<{ tools: NLWebTool[] }>(
        "/tools",
        baseUrl,
        requestTimeout,
      );
      state.setTools(response.tools);
    } catch (error) {
      handleAPIError(state, error, "Failed to get tools");
    }
  };
}

/**
 * Create register tool action
 */
export function createRegisterToolAction(
  state: NLWebState,
  baseUrl: string,
  requestTimeout: number,
  getTools: () => Promise<void>,
): (tool: NLWebTool) => Promise<void> {
  return async (tool: NLWebTool): Promise<void> => {
    try {
      state.setLoading(true);
      state.setError(null);

      await makeNLWebRequest("/tools", baseUrl, requestTimeout, {
        method: "POST",
        body: JSON.stringify(tool),
      });

      // Refresh tools list
      await getTools();
    } catch (error) {
      handleAPIError(state, error, "Failed to register tool");
    } finally {
      state.setLoading(false);
    }
  };
}

/**
 * Create unregister tool action
 */
export function createUnregisterToolAction(
  state: NLWebState,
  baseUrl: string,
  requestTimeout: number,
  getTools: () => Promise<void>,
): (name: string) => Promise<void> {
  return async (name: string): Promise<void> => {
    try {
      state.setLoading(true);
      state.setError(null);

      await makeNLWebRequest(`/tools/${name}`, baseUrl, requestTimeout, {
        method: "DELETE",
      });

      // Refresh tools list
      await getTools();
    } catch (error) {
      handleAPIError(state, error, "Failed to unregister tool");
    } finally {
      state.setLoading(false);
    }
  };
}
