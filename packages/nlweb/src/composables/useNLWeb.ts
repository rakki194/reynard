/**
 * NLWeb Composable
 *
 * React composable for integrating with the NLWeb assistant tooling and routing system.
 * Provides reactive state management and API integration.
 */

import {
  NLWebSuggestionResponse,
  NLWebHealthStatus,
  NLWebConfiguration,
  NLWebTool,
  NLWebContext,
} from "../types/index.js";
import { createNLWebState, NLWebState } from "./useNLWebState.js";
import { createNLWebActions, NLWebActions } from "./useNLWebActions.js";
import {
  createNLWebHealthManager,
  NLWebHealthManager,
} from "./useNLWebHealth.js";

export interface UseNLWebOptions {
  /** Base URL for NLWeb API */
  baseUrl?: string;
  /** Default context for suggestions */
  defaultContext?: NLWebContext;
  /** Whether to enable health checks */
  enableHealthChecks?: boolean;
  /** Health check interval in milliseconds */
  healthCheckInterval?: number;
  /** Request timeout in milliseconds */
  requestTimeout?: number;
}

export interface UseNLWebReturn {
  // State
  suggestions: () => NLWebSuggestionResponse | null;
  health: () => NLWebHealthStatus | null;
  configuration: () => NLWebConfiguration | null;
  tools: () => NLWebTool[];
  loading: () => boolean;
  error: () => string | null;

  // Actions
  getSuggestions: (
    query: string,
    context?: Record<string, unknown>,
  ) => Promise<void>;
  getHealth: () => Promise<void>;
  getConfiguration: () => Promise<void>;
  getTools: () => Promise<void>;
  registerTool: (tool: NLWebTool) => Promise<void>;
  unregisterTool: (name: string) => Promise<void>;
  enableRollback: () => Promise<void>;
  disableRollback: () => Promise<void>;

  // Utilities
  isHealthy: () => boolean;
  isAvailable: () => boolean;
  getPerformanceStats: () => unknown;
}

export function useNLWeb(options: UseNLWebOptions = {}): UseNLWebReturn {
  const {
    baseUrl = "/api/nlweb",
    defaultContext: _defaultContext = {},
    enableHealthChecks = true,
    healthCheckInterval = 30000, // 30 seconds
    requestTimeout = 10000, // 10 seconds
  } = options;

  // Create state
  const state: NLWebState = createNLWebState();

  // Create actions
  const actions: NLWebActions = createNLWebActions(
    state,
    baseUrl,
    requestTimeout,
  );

  // Create health manager
  const healthManager: NLWebHealthManager = createNLWebHealthManager(
    state,
    actions,
    enableHealthChecks,
    healthCheckInterval,
  );

  return {
    // State
    suggestions: state.suggestions,
    health: state.health,
    configuration: state.configuration,
    tools: state.tools,
    loading: state.loading,
    error: state.error,

    // Actions
    getSuggestions: actions.getSuggestions,
    getHealth: actions.getHealth,
    getConfiguration: actions.getConfiguration,
    getTools: actions.getTools,
    registerTool: actions.registerTool,
    unregisterTool: actions.unregisterTool,
    enableRollback: actions.enableRollback,
    disableRollback: actions.disableRollback,

    // Utilities
    isHealthy: healthManager.isHealthy,
    isAvailable: healthManager.isAvailable,
    getPerformanceStats: healthManager.getPerformanceStats,
  };
}
