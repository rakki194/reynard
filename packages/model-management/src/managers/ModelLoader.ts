/**
 * Model Loader
 * 
 * Handles model loading, unloading, and lifecycle management.
 */

import { ModelLoader as IModelLoader, ModelInstance, ModelStatus, ModelHealth } from '../types/index.js';
import { BaseModel } from '../models/BaseModel.js';
import { ModelRegistry } from './ModelRegistry.js';

export class ModelLoader implements IModelLoader {
  private _registry: ModelRegistry;
  private _loadedModels: Map<string, ModelInstance> = new Map();
  private _modelInstances: Map<string, BaseModel> = new Map();
  private _maxConcurrentLoads: number = 2;
  private _loadTimeout: number = 120000; // 2 minutes

  constructor(registry: ModelRegistry, maxConcurrentLoads = 2, loadTimeout = 120000) {
    this._registry = registry;
    this._maxConcurrentLoads = maxConcurrentLoads;
    this._loadTimeout = loadTimeout;
  }

  async loadModel(modelId: string, config?: Record<string, any>): Promise<ModelInstance> {
    // Check if model is registered
    const modelInfo = this._registry.getModelInfo(modelId);
    if (!modelInfo) {
      throw new Error(`Model ${modelId} is not registered`);
    }

    // Check if already loaded
    if (this.isModelLoaded(modelId)) {
      const instance = this._loadedModels.get(modelId);
      if (instance) {
        // Update last used time
        instance.lastUsed = new Date();
        this._loadedModels.set(modelId, instance);
        return { ...instance };
      }
    }

    // Check concurrent load limit
    const loadingCount = Array.from(this._loadedModels.values())
      .filter(instance => instance.status === ModelStatus.LOADING).length;
    
    if (loadingCount >= this._maxConcurrentLoads) {
      throw new Error(`Maximum concurrent loads (${this._maxConcurrentLoads}) reached`);
    }

    // Create model instance
    const modelInstance = this._createModelInstance(modelId, modelInfo.modelType, config || {});
    
    // Initialize model instance
    const instance: ModelInstance = {
      modelId,
      modelType: modelInfo.modelType,
      status: ModelStatus.LOADING,
      health: ModelHealth.UNKNOWN,
      config: config || {},
      loadedAt: new Date(),
      lastUsed: new Date()
    };

    this._loadedModels.set(modelId, instance);
    this._modelInstances.set(modelId, modelInstance);

    try {
      // Load the model
      await modelInstance.initialize();
      
      // Update instance with loaded status
      instance.status = ModelStatus.LOADED;
      instance.health = modelInstance.health;
      instance.loadedAt = new Date();
      this._loadedModels.set(modelId, instance);

      return { ...instance };

    } catch (error) {
      // Update instance with error status
      instance.status = ModelStatus.ERROR;
      instance.health = ModelHealth.UNHEALTHY;
      instance.error = error instanceof Error ? error.message : String(error);
      this._loadedModels.set(modelId, instance);

      // Clean up failed model instance
      this._modelInstances.delete(modelId);

      throw error;
    }
  }

  async unloadModel(modelId: string): Promise<void> {
    const modelInstance = this._modelInstances.get(modelId);
    if (!modelInstance) {
      return; // Already unloaded
    }

    try {
      await modelInstance.destroy();
    } finally {
      this._modelInstances.delete(modelId);
      this._loadedModels.delete(modelId);
    }
  }

  getLoadedModel(modelId: string): ModelInstance | undefined {
    const instance = this._loadedModels.get(modelId);
    return instance ? { ...instance } : undefined;
  }

  getAllLoadedModels(): Record<string, ModelInstance> {
    const result: Record<string, ModelInstance> = {};
    for (const [modelId, instance] of this._loadedModels) {
      result[modelId] = { ...instance };
    }
    return result;
  }

  isModelLoaded(modelId: string): boolean {
    const instance = this._loadedModels.get(modelId);
    return instance?.status === ModelStatus.LOADED;
  }

  getModelHealth(modelId: string): ModelHealth {
    const instance = this._loadedModels.get(modelId);
    return instance?.health || ModelHealth.UNKNOWN;
  }

  // Utility methods
  getLoadedModelCount(): number {
    return this._loadedModels.size;
  }

  getMaxConcurrentLoads(): number {
    return this._maxConcurrentLoads;
  }

  setMaxConcurrentLoads(max: number): void {
    this._maxConcurrentLoads = max;
  }

  getLoadTimeout(): number {
    return this._loadTimeout;
  }

  setLoadTimeout(timeout: number): void {
    this._loadTimeout = timeout;
  }

  // Model instance access
  getModelInstance(modelId: string): BaseModel | undefined {
    return this._modelInstances.get(modelId);
  }

  // Health monitoring
  async performHealthCheck(modelId: string): Promise<ModelHealth> {
    const modelInstance = this._modelInstances.get(modelId);
    if (!modelInstance) {
      return ModelHealth.UNKNOWN;
    }

    try {
      const health = await modelInstance.healthCheck();
      
      // Update instance health
      const instance = this._loadedModels.get(modelId);
      if (instance) {
        instance.health = health;
        this._loadedModels.set(modelId, instance);
      }

      return health;
    } catch (error) {
      const health = ModelHealth.UNHEALTHY;
      
      // Update instance health
      const instance = this._loadedModels.get(modelId);
      if (instance) {
        instance.health = health;
        instance.error = error instanceof Error ? error.message : String(error);
        this._loadedModels.set(modelId, instance);
      }

      return health;
    }
  }

  async performAllHealthChecks(): Promise<Record<string, ModelHealth>> {
    const results: Record<string, ModelHealth> = {};
    
    for (const modelId of this._loadedModels.keys()) {
      results[modelId] = await this.performHealthCheck(modelId);
    }

    return results;
  }

  // Model configuration
  updateModelConfig(modelId: string, config: Record<string, any>): void {
    const modelInstance = this._modelInstances.get(modelId);
    if (modelInstance) {
      modelInstance.updateConfig(config);
    }

    const instance = this._loadedModels.get(modelId);
    if (instance) {
      instance.config = { ...instance.config, ...config };
      this._loadedModels.set(modelId, instance);
    }
  }

  // Cleanup
  async unloadAllModels(): Promise<void> {
    const unloadPromises = Array.from(this._loadedModels.keys()).map(modelId => 
      this.unloadModel(modelId)
    );
    
    await Promise.all(unloadPromises);
  }

  // Statistics
  getLoadingStatistics(): {
    totalLoaded: number;
    loading: number;
    loaded: number;
    error: number;
    totalMemoryUsage: number;
  } {
    let loading = 0;
    let loaded = 0;
    let error = 0;
    let totalMemoryUsage = 0;

    for (const instance of this._loadedModels.values()) {
      switch (instance.status) {
        case ModelStatus.LOADING:
          loading++;
          break;
        case ModelStatus.LOADED:
          loaded++;
          break;
        case ModelStatus.ERROR:
          error++;
          break;
      }

      // Estimate memory usage (this would be more sophisticated in a real implementation)
      totalMemoryUsage += 100 * 1024 * 1024; // 100MB per model estimate
    }

    return {
      totalLoaded: this._loadedModels.size,
      loading,
      loaded,
      error,
      totalMemoryUsage
    };
  }

  private _createModelInstance(modelId: string, modelType: any, config: Record<string, any>): BaseModel {
    // This is a simplified factory method
    // In a real implementation, this would create specific model instances based on type
    return new (class extends BaseModel {
      constructor() {
        super(modelId, modelType, config);
      }

      async download(): Promise<void> {
        // Mock download implementation
        console.log(`Downloading model ${modelId}`);
      }

      async load(config?: Record<string, any>): Promise<void> {
        // Mock load implementation
        console.log(`Loading model ${modelId} with config:`, config);
      }

      async unload(): Promise<void> {
        // Mock unload implementation
        console.log(`Unloading model ${modelId}`);
      }

      async healthCheck(): Promise<ModelHealth> {
        // Mock health check
        return ModelHealth.HEALTHY;
      }

      async isAvailable(): Promise<boolean> {
        // Mock availability check
        return true;
      }
    })();
  }
}
