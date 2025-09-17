/**
 * Model Data Utilities
 *
 * Helper functions for creating and managing model data structures.
 */

import type { ModelInfo, SystemHealth } from "./ModelManager";

/**
 * Create default models configuration
 */
export function createDefaultModels(): ModelInfo[] {
  return [
    {
      name: "default-model",
      displayName: "Default Model",
      description: "Default Model for testing",
      isLoaded: false,
      isLoading: false,
      healthStatus: "healthy" as const,
      usageStats: {
        totalRequests: 0,
        successfulRequests: 0,
        averageProcessingTime: 0,
      },
    },
  ];
}

/**
 * Extract loaded models from system health
 */
export function extractLoadedModels(health: SystemHealth): ModelInfo[] {
  // Convert the boolean map to ModelInfo array
  return Object.keys(health.models || {}).map(name => ({
    name,
    displayName: name,
    description: `Model: ${name}`,
    isLoaded: health.models![name] || false,
    isLoading: false,
    healthStatus: "healthy" as const,
    usageStats: {
      totalRequests: 0,
      successfulRequests: 0,
      averageProcessingTime: 0,
    },
  }));
}

/**
 * Create model status map
 */
export function createModelStatusMap(models: ModelInfo[]): Record<string, ModelInfo> {
  return models.reduce((map, model) => {
    map[model.name] = model;
    return map;
  }, {} as Record<string, ModelInfo>);
}
