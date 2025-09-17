/**
 * Model Manager Composable
 *
 * Handles model management state and operations for the ModelManager component.
 * Extracted to keep the main component under the 50-line limit.
 */

import { createSignal, onMount, onCleanup } from "solid-js";
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
  apiKey?: string | undefined;
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

  let manager: any = null;
  let healthCheckInterval: NodeJS.Timeout | null = null;

  // Initialize manager and load data
  onMount(async () => {
    try {
      initializeModelManager(config);
      await loadModelData();
      await loadSystemHealth();

      setupHealthChecks();
      setupModelEventListeners();
    } catch (err) {
      setError(createInitErrorMessage(String(err)));
    }
  });

  onCleanup(async () => {
    cleanupModelManager();
  });

  // Load model information
  const loadModelData = async () => {
    try {
      const modelInfos = createDefaultModels();
      setModels(modelInfos);
    } catch (err) {
      setError(createModelDataErrorMessage(String(err)));
    }
  };

  // Load system health information
  const loadSystemHealth = async () => {
    try {
      setSystemHealth({
        isHealthy: true,
        performance: {
          cpuUsage: 0, // Placeholder - would come from actual system stats
          memoryUsage: 0, // Placeholder - would come from actual system stats
          queueLength: 0, // Placeholder - would come from actual queue status
        },
        models: {},
      });
    } catch (err) {
      console.error("Failed to load system health:", err);
    }
  };

  // Load a specific model
  const loadModel = async (modelName: string) => {
    try {
      setModels((prev) => updateModelLoadingState(prev, modelName, "loading"));
      // Simulate model loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setModels((prev) => updateModelLoadingState(prev, modelName, "loaded"));
    } catch (err) {
      setModels((prev) => updateModelLoadingState(prev, modelName, "error"));
      setError(createModelErrorMessage(modelName, String(err)));
    }
  };

  // Unload a specific model
  const unloadModel = async (modelName: string) => {
    try {
      setModels((prev) => updateModelLoadingState(prev, modelName, "loading"));
      // Simulate model unloading
      await new Promise(resolve => setTimeout(resolve, 500));
      setModels((prev) => updateModelLoadingState(prev, modelName, "loaded"));
    } catch (err) {
      setModels((prev) => updateModelLoadingState(prev, modelName, "error"));
      setError(createModelErrorMessage(modelName, String(err)));
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
