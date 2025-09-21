/**
 * NLWeb Health Actions
 *
 * Health management for the NLWeb composable.
 */

import { NLWebState } from "./useNLWebState.js";
import { NLWebHealthStatus, NLWebConfiguration } from "../types/index.js";
import { makeNLWebRequest, handleAPIError } from "./useNLWebRequest.js";

/**
 * Create health action
 */
export function createHealthAction(state: NLWebState, baseUrl: string, requestTimeout: number): () => Promise<void> {
  return async (): Promise<void> => {
    try {
      const response = await makeNLWebRequest<NLWebHealthStatus>("/api/nlweb/health", baseUrl, requestTimeout);
      state.setHealth(response);
    } catch (error) {
      handleAPIError(state, error, "Failed to get health status");
    }
  };
}

/**
 * Create configuration action
 */
export function createConfigurationAction(
  state: NLWebState,
  baseUrl: string,
  requestTimeout: number
): () => Promise<void> {
  return async (): Promise<void> => {
    try {
      const response = await makeNLWebRequest<{
        configuration: NLWebConfiguration;
        tools: unknown[];
      }>("/status", baseUrl, requestTimeout);

      state.setConfiguration(response.configuration);
      state.setTools(response.tools || []);
    } catch (error) {
      handleAPIError(state, error, "Failed to get configuration");
    }
  };
}
