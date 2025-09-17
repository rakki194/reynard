/**
 * NLWeb Health Checks
 *
 * Health check management for the NLWeb composable.
 */
import { NLWebState } from "./useNLWebState.js";
import { NLWebActions } from "./useNLWebActions.js";
export interface NLWebHealthChecks {
    startHealthChecks: () => void;
    stopHealthChecks: () => void;
}
/**
 * Create NLWeb health checks
 */
export declare function createNLWebHealthChecks(state: NLWebState, actions: NLWebActions, enableHealthChecks: boolean, healthCheckInterval: number): NLWebHealthChecks;
