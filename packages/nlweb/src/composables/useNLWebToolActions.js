/**
 * NLWeb Tool Actions
 *
 * Tool management action functions for the NLWeb composable.
 */
import { createGetToolsAction, createRegisterToolAction, createUnregisterToolAction, } from "./useNLWebToolManagement.js";
/**
 * Create NLWeb tool actions
 */
export function createNLWebToolActions(state, baseUrl, requestTimeout) {
    const getTools = createGetToolsAction(state, baseUrl, requestTimeout);
    const registerTool = createRegisterToolAction(state, baseUrl, requestTimeout, getTools);
    const unregisterTool = createUnregisterToolAction(state, baseUrl, requestTimeout, getTools);
    return {
        getTools,
        registerTool,
        unregisterTool,
    };
}
