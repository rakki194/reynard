/**
 * NLWeb Rollback Actions
 *
 * Rollback management action functions for the NLWeb composable.
 */
import { NLWebState } from "./useNLWebState.js";
export interface NLWebRollbackActions {
    enableRollback: () => Promise<void>;
    disableRollback: () => Promise<void>;
}
/**
 * Create NLWeb rollback actions
 */
export declare function createNLWebRollbackActions(state: NLWebState, baseUrl: string, requestTimeout: number): NLWebRollbackActions;
