/**
 * Model Initialization Utilities
 *
 * Utility functions for initializing the model manager and setting up event listeners.
 * Extracted to keep composables under the 140-line limit.
 */

import { createAnnotationManager } from "reynard-annotating-core";

export interface ModelManagerInstance {
  manager: ReturnType<typeof createAnnotationManager>;
  healthCheckInterval: ReturnType<typeof setInterval>;
}

/**
 * Initializes the model manager with configuration
 */
export const initializeModelManager = async (
  baseUrl: string,
  apiKey?: string
): Promise<ReturnType<typeof createAnnotationManager>> => {
  const manager = createAnnotationManager({
    baseUrl,
    apiKey,
  });

  await manager.initialize();
  return manager;
};

/**
 * Sets up periodic health checks
 */
export const setupHealthChecks = (
  loadSystemHealth: () => Promise<void>,
  intervalMs: number = 5000
): ReturnType<typeof setInterval> => {
  return setInterval(async () => {
    await loadSystemHealth();
  }, intervalMs);
};

/**
 * Sets up model event listeners
 */
export const setupModelEventListeners = (
  manager: ReturnType<typeof createAnnotationManager>,
  loadModelData: () => Promise<void>
): void => {
  manager.addEventListener((event: any) => {
    if (event.type === "model_loaded" || event.type === "model_unloaded") {
      loadModelData();
    }
  });
};

/**
 * Cleans up model manager resources
 */
export const cleanupModelManager = async (
  manager: ReturnType<typeof createAnnotationManager> | null,
  healthCheckInterval: ReturnType<typeof setInterval> | null
): Promise<void> => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  if (manager) {
    await manager.shutdown();
  }
};
