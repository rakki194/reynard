/**
 * NLWeb Health Management
 *
 * Health check management for the NLWeb composable.
 */
import { NLWebState } from "./useNLWebState.js";
import { NLWebActions } from "./useNLWebActions.js";
export interface NLWebHealthManager {
    startHealthChecks: () => void;
    stopHealthChecks: () => void;
    isHealthy: () => boolean;
    isAvailable: () => boolean;
    getPerformanceStats: () => unknown;
}
/**
 * Create NLWeb health manager
 */
export declare function createNLWebHealthManager(state: NLWebState, actions: NLWebActions, enableHealthChecks: boolean, healthCheckInterval: number): NLWebHealthManager;
