/**
 * NLWeb Core Actions
 *
 * Core action functions for the NLWeb composable.
 */

import { NLWebState } from "./useNLWebState.js";
import { createSuggestionsAction } from "./useNLWebSuggestions.js";
import {
  createHealthAction,
  createConfigurationAction,
} from "./useNLWebHealthActions.js";

export interface NLWebCoreActions {
  getSuggestions: (
    query: string,
    context?: Record<string, unknown>,
  ) => Promise<void>;
  getHealth: () => Promise<void>;
  getConfiguration: () => Promise<void>;
}

/**
 * Create NLWeb core actions
 */
export function createNLWebCoreActions(
  state: NLWebState,
  baseUrl: string,
  requestTimeout: number,
): NLWebCoreActions {
  const getSuggestions = createSuggestionsAction(
    state,
    baseUrl,
    requestTimeout,
  );
  const getHealth = createHealthAction(state, baseUrl, requestTimeout);
  const getConfiguration = createConfigurationAction(
    state,
    baseUrl,
    requestTimeout,
  );

  return {
    getSuggestions,
    getHealth,
    getConfiguration,
  };
}
