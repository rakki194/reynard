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
export function createNLWebHealthUtils(state: NLWebState): NLWebHealthUtils {
  const isHealthy = (): boolean => {
    const healthStatus = state.health();
    return healthStatus?.status === "healthy" || false;
  };

  const isAvailable = (): boolean => {
    const healthStatus = state.health();
    return healthStatus?.status !== "unavailable" || false;
  };

  const getPerformanceStats = (): unknown => {
    const healthStatus = state.health();
    return healthStatus?.performance || null;
  };

  return {
    isHealthy,
    isAvailable,
    getPerformanceStats,
  };
}
