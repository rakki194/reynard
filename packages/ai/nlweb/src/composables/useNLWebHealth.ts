/**
 * NLWeb Health Management
 *
 * Health check management for the NLWeb composable.
 */

import { NLWebState } from "./useNLWebState.js";
import { NLWebActions } from "./useNLWebActions.js";
import { createNLWebHealthChecks, NLWebHealthChecks } from "./useNLWebHealthChecks.js";
import { createNLWebHealthUtils, NLWebHealthUtils } from "./useNLWebHealthUtils.js";

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
export function createNLWebHealthManager(
  state: NLWebState,
  actions: NLWebActions,
  enableHealthChecks: boolean,
  healthCheckInterval: number
): NLWebHealthManager {
  const healthChecks: NLWebHealthChecks = createNLWebHealthChecks(
    state,
    actions,
    enableHealthChecks,
    healthCheckInterval
  );

  const healthUtils: NLWebHealthUtils = createNLWebHealthUtils(state);

  return {
    startHealthChecks: healthChecks.startHealthChecks,
    stopHealthChecks: healthChecks.stopHealthChecks,
    isHealthy: healthUtils.isHealthy,
    isAvailable: healthUtils.isAvailable,
    getPerformanceStats: healthUtils.getPerformanceStats,
  };
}
