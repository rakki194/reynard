/**
 * NLWeb Health Checks
 *
 * Health check management for the NLWeb composable.
 */
import { createEffect, onCleanup } from "solid-js";
/**
 * Create NLWeb health checks
 */
export function createNLWebHealthChecks(state, actions, enableHealthChecks, healthCheckInterval) {
    let healthCheckTimer = null;
    const startHealthChecks = () => {
        if (healthCheckTimer) {
            clearInterval(healthCheckTimer);
        }
        // Initial health check
        actions.getHealth();
        // Set up interval
        healthCheckTimer = setInterval(() => {
            actions.getHealth();
        }, healthCheckInterval);
    };
    const stopHealthChecks = () => {
        if (healthCheckTimer) {
            clearInterval(healthCheckTimer);
            healthCheckTimer = null;
        }
    };
    // Set up health checks effect
    createEffect(() => {
        if (enableHealthChecks) {
            startHealthChecks();
        }
        else {
            stopHealthChecks();
        }
        onCleanup(() => {
            stopHealthChecks();
        });
    });
    return {
        startHealthChecks,
        stopHealthChecks,
    };
}
