/**
 * Model Manager Composable
 *
 * Handles model management state and operations for the ModelManager component.
 * Extracted to keep the main component under the 50-line limit.
 */

import { createSignal, onMount, onCleanup } from "solid-js";
import { BackendAnnotationManager } from "reynard-annotating";
import type { ModelInfo, SystemHealth } from "./ModelManager";
import {
  createDefaultModels,
  extractLoadedModels,
  createModelStatusMap,
} from "./modelData";
import {
  updateModelLoadingState,
  createModelErrorMessage,
  createInitErrorMessage,
  createModelDataErrorMessage,
} from "./modelOperations";
import {
  initializeModelManager,
  setupHealthChecks,
  setupModelEventListeners,
  cleanupModelManager,
} from "./modelInitialization";

export interface ModelManagerConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface UseModelManagerReturn {
  models: () => ModelInfo[];
  systemHealth: () => SystemHealth | null;
  error: () => string | null;
  loadModel: (modelName: string) => Promise<void>;
  unloadModel: (modelName: string) => Promise<void>;
  clearError: () => void;
}

export const useModelManager = (
  config: ModelManagerConfig,
): UseModelManagerReturn => {
  const [models, setModels] = createSignal<ModelInfo[]>([]);
  const [systemHealth, setSystemHealth] = createSignal<SystemHealth | null>(
    null,
  );
  const [error, setError] = createSignal<string | null>(null);

  let manager: ReturnType<typeof createBackendAnnotationManager> | null = null;
  let healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  // Initialize manager and load data
  onMount(async () => {
    try {
      manager = await initializeModelManager(config.baseUrl, config.apiKey);
      await loadModelData();
      await loadSystemHealth();

      healthCheckInterval = setupHealthChecks(loadSystemHealth);
      setupModelEventListeners(manager, loadModelData);
    } catch (err) {
      setError(createInitErrorMessage(err));
    }
  });

  onCleanup(async () => {
    await cleanupModelManager(manager, healthCheckInterval);
  });

  // Load model information
  const loadModelData = async () => {
    if (!manager) return;

    try {
      const systemStats = manager.getSystemStatistics();
      const loadedModels = extractLoadedModels(systemStats);
      const modelInfos = createDefaultModels(loadedModels);
      setModels(modelInfos);
    } catch (err) {
      setError(createModelDataErrorMessage(err));
    }
  };

  // Load system health information
  const loadSystemHealth = async () => {
    if (!manager) return;

    try {
      const health = manager.getHealthStatus();
      const stats = manager.getSystemStatistics();
      const loadedModels = extractLoadedModels(stats);

      setSystemHealth({
        isHealthy: health.isHealthy,
        performance: {
          cpuUsage: 0, // Placeholder - would come from actual system stats
          memoryUsage: 0, // Placeholder - would come from actual system stats
          queueLength: 0, // Placeholder - would come from actual queue status
        },
        models: createModelStatusMap(loadedModels),
      });
    } catch (err) {
      console.error("Failed to load system health:", err);
    }
  };

  // Load a specific model
  const loadModel = async (modelName: string) => {
    if (!manager) return;
    try {
      setModels((prev) => updateModelLoadingState(prev, modelName, true));
      await manager.preloadModel(modelName);
      await loadModelData();
    } catch (err) {
      setError(createModelErrorMessage("load", modelName, err));
    }
  };

  // Unload a specific model
  const unloadModel = async (modelName: string) => {
    if (!manager) return;
    try {
      setModels((prev) => updateModelLoadingState(prev, modelName, true));
      await manager.unloadModel(modelName);
      await loadModelData();
    } catch (err) {
      setError(createModelErrorMessage("unload", modelName, err));
    }
  };

  const clearError = () => setError(null);

  return {
    models,
    systemHealth,
    error,
    loadModel,
    unloadModel,
    clearError,
  };
};
