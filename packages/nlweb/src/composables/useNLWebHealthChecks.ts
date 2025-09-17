/**
 * NLWeb Health Checks
 *
 * Health check management for the NLWeb composable.
 */

import { createEffect, onCleanup } from "solid-js";
import { NLWebState } from "./useNLWebState.js";
import { NLWebActions } from "./useNLWebActions.js";

export interface NLWebHealthChecks {
  startHealthChecks: () => void;
  stopHealthChecks: () => void;
}

/**
 * Create NLWeb health checks
 */
export function createNLWebHealthChecks(
  state: NLWebState,
  actions: NLWebActions,
  enableHealthChecks: boolean,
  healthCheckInterval: number
): NLWebHealthChecks {
  let healthCheckTimer: number | null = null;

  const startHealthChecks = (): void => {
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

  const stopHealthChecks = (): void => {
    if (healthCheckTimer) {
      clearInterval(healthCheckTimer);
      healthCheckTimer = null;
    }
  };

  // Set up health checks effect
  createEffect(() => {
    if (enableHealthChecks) {
      startHealthChecks();
    } else {
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
