/**
 * NLWeb Health Utilities
 *
 * Health utility functions for the NLWeb composable.
 */
import { NLWebState } from "./useNLWebState.js";
export interface NLWebHealthUtils {
    isHealthy: () => boolean;
    isAvailable: () => boolean;
    getPerformanceStats: () => unknown;
}
/**
 * Create NLWeb health utilities
 */
export declare function createNLWebHealthUtils(state: NLWebState): NLWebHealthUtils;
