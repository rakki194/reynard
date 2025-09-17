/**
 * Model Operations Utilities
 *
 * Helper functions for model operations and error handling.
 */

import type { ModelInfo } from "./ModelManager";

/**
 * Update model loading state
 */
export function updateModelLoadingState(
  models: ModelInfo[],
  modelId: string,
  status: "loading" | "loaded" | "error"
): ModelInfo[] {
  return models.map(model => {
    if (model.name === modelId) {
      return {
        ...model,
        isLoading: status === "loading",
        isLoaded: status === "loaded",
        healthStatus: status === "error" ? ("unhealthy" as const) : model.healthStatus,
      };
    }
    return model;
  });
}

/**
 * Create model error message
 */
export function createModelErrorMessage(modelId: string, error: string): string {
  return `Model ${modelId}: ${error}`;
}

/**
 * Create initialization error message
 */
export function createInitErrorMessage(error: string): string {
  return `Initialization failed: ${error}`;
}

/**
 * Create model data error message
 */
export function createModelDataErrorMessage(error: string): string {
  return `Model data error: ${error}`;
}
