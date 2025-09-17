/**
 * NLWeb Health Management
 *
 * Health check management for the NLWeb composable.
 */
import { createNLWebHealthChecks, } from "./useNLWebHealthChecks.js";
import { createNLWebHealthUtils, } from "./useNLWebHealthUtils.js";
/**
 * Create NLWeb health manager
 */
export function createNLWebHealthManager(state, actions, enableHealthChecks, healthCheckInterval) {
    const healthChecks = createNLWebHealthChecks(state, actions, enableHealthChecks, healthCheckInterval);
    const healthUtils = createNLWebHealthUtils(state);
    return {
        startHealthChecks: healthChecks.startHealthChecks,
        stopHealthChecks: healthChecks.stopHealthChecks,
        isHealthy: healthUtils.isHealthy,
        isAvailable: healthUtils.isAvailable,
        getPerformanceStats: healthUtils.getPerformanceStats,
    };
}
