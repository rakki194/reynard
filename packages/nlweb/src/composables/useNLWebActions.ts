/**
 * NLWeb Actions
 *
 * Action functions for the NLWeb composable.
 */

import { NLWebState } from "./useNLWebState.js";
import { NLWebTool } from "../types/index.js";
import { createNLWebCoreActions, NLWebCoreActions } from "./useNLWebCoreActions.js";
import { createNLWebToolActions, NLWebToolActions } from "./useNLWebToolActions.js";
import { createNLWebRollbackActions, NLWebRollbackActions } from "./useNLWebRollbackActions.js";

export interface NLWebActions {
  getSuggestions: (query: string, context?: Record<string, unknown>) => Promise<void>;
  getHealth: () => Promise<void>;
  getConfiguration: () => Promise<void>;
  getTools: () => Promise<void>;
  registerTool: (tool: NLWebTool) => Promise<void>;
  unregisterTool: (name: string) => Promise<void>;
  enableRollback: () => Promise<void>;
  disableRollback: () => Promise<void>;
}

/**
 * Create NLWeb actions
 */
export function createNLWebActions(
  state: NLWebState,
  baseUrl: string,
  requestTimeout: number,
): NLWebActions {
  const coreActions: NLWebCoreActions = createNLWebCoreActions(
    state,
    baseUrl,
    requestTimeout,
  );

  const toolActions: NLWebToolActions = createNLWebToolActions(
    state,
    baseUrl,
    requestTimeout,
  );

  const rollbackActions: NLWebRollbackActions = createNLWebRollbackActions(
    state,
    baseUrl,
    requestTimeout,
  );

  return {
    // Core actions
    getSuggestions: coreActions.getSuggestions,
    getHealth: coreActions.getHealth,
    getConfiguration: coreActions.getConfiguration,

    // Tool actions
    getTools: toolActions.getTools,
    registerTool: toolActions.registerTool,
    unregisterTool: toolActions.unregisterTool,

    // Rollback actions
    enableRollback: rollbackActions.enableRollback,
    disableRollback: rollbackActions.disableRollback,
  };
}