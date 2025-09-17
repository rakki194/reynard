/**
 * NLWeb Actions
 *
 * Action functions for the NLWeb composable.
 */
import { createNLWebCoreActions, } from "./useNLWebCoreActions.js";
import { createNLWebToolActions, } from "./useNLWebToolActions.js";
import { createNLWebRollbackActions, } from "./useNLWebRollbackActions.js";
/**
 * Create NLWeb actions
 */
export function createNLWebActions(state, baseUrl, requestTimeout) {
    const coreActions = createNLWebCoreActions(state, baseUrl, requestTimeout);
    const toolActions = createNLWebToolActions(state, baseUrl, requestTimeout);
    const rollbackActions = createNLWebRollbackActions(state, baseUrl, requestTimeout);
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
