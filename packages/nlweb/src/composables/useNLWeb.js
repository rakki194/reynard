/**
 * NLWeb Composable
 *
 * React composable for integrating with the NLWeb assistant tooling and routing system.
 * Provides reactive state management and API integration.
 */
import { createNLWebState } from "./useNLWebState.js";
import { createNLWebActions } from "./useNLWebActions.js";
import { createNLWebHealthManager, } from "./useNLWebHealth.js";
export function useNLWeb(options = {}) {
    const { baseUrl = "/api/nlweb", defaultContext: _defaultContext = {}, enableHealthChecks = true, healthCheckInterval = 30000, // 30 seconds
    requestTimeout = 10000, // 10 seconds
     } = options;
    // Create state
    const state = createNLWebState();
    // Create actions
    const actions = createNLWebActions(state, baseUrl, requestTimeout);
    // Create health manager
    const healthManager = createNLWebHealthManager(state, actions, enableHealthChecks, healthCheckInterval);
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
