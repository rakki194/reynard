/**
 * Model Manager
 * 
 * Main orchestrator for model management, combining registry, download, and loading functionality.
 */

import { ModelManager as IModelManager, ModelInfo, ModelInstance, ModelDownloadProgress, ModelStatus, ModelHealth, ModelEvent, ModelEventHandler, ModelManagerState } from '../types/index.js';
import { ModelRegistry } from './ModelRegistry.js';
import { ModelDownloadManager } from './ModelDownloadManager.js';
import { ModelLoader } from './ModelLoader.js';

export class ModelManager implements IModelManager {
  private _registry: ModelRegistry;
  private _downloadManager: ModelDownloadManager;
  private _loader: ModelLoader;
  private _eventHandlers: Set<ModelEventHandler> = new Set();
  private _config: any = {};

  constructor(config: any = {}) {
    this._config = config;
    this._registry = new ModelRegistry();
    this._downloadManager = new ModelDownloadManager(
      this._registry,
      config.maxConcurrentDownloads || 3,
      config.downloadTimeout || 300000
    );
    this._loader = new ModelLoader(
      this._registry,
      config.maxConcurrentLoads || 2,
      config.loadTimeout || 120000
    );
  }

  // Model registration
  registerModel(modelInfo: ModelInfo): void {
    this._registry.registerModel(modelInfo);
    this._emitEvent({
      type: 'config_update',
      modelId: modelInfo.modelId,
      timestamp: new Date(),
      data: { action: 'registered', modelInfo }
    });
  }

  // Model download
  async downloadModel(modelId: string, progressCallback?: (progress: ModelDownloadProgress) => void): Promise<void> {
    this._emitEvent({
      type: 'download_start',
      modelId,
      timestamp: new Date(),
      data: { action: 'download_started' }
    });

    try {
      await this._downloadManager.downloadModel(modelId, (progress) => {
        this._emitEvent({
          type: 'download_progress',
          modelId,
          timestamp: new Date(),
          data: { progress }
        });

        if (progressCallback) {
          progressCallback(progress);
        }
      });

      this._emitEvent({
        type: 'download_complete',
        modelId,
        timestamp: new Date(),
        data: { action: 'download_completed' }
      });

    } catch (error) {
      this._emitEvent({
        type: 'download_error',
        modelId,
        timestamp: new Date(),
        data: { 
          action: 'download_failed',
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }

  // Model loading
  async loadModel(modelId: string, config?: Record<string, any>): Promise<ModelInstance> {
    this._emitEvent({
      type: 'load_start',
      modelId,
      timestamp: new Date(),
      data: { action: 'load_started', config }
    });

    try {
      const instance = await this._loader.loadModel(modelId, config);

      this._emitEvent({
        type: 'load_complete',
        modelId,
        timestamp: new Date(),
        data: { action: 'load_completed', instance }
      });

      return instance;

    } catch (error) {
      this._emitEvent({
        type: 'load_error',
        modelId,
        timestamp: new Date(),
        data: { 
          action: 'load_failed',
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }

  async unloadModel(modelId: string): Promise<void> {
    try {
      await this._loader.unloadModel(modelId);

      this._emitEvent({
        type: 'unload',
        modelId,
        timestamp: new Date(),
        data: { action: 'unloaded' }
      });

    } catch (error) {
      this._emitEvent({
        type: 'load_error',
        modelId,
        timestamp: new Date(),
        data: { 
          action: 'unload_failed',
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }

  // Model information
  getModelInfo(modelId: string): ModelInfo | undefined {
    return this._registry.getModelInfo(modelId);
  }

  getModelInstance(modelId: string): ModelInstance | undefined {
    return this._loader.getLoadedModel(modelId);
  }

  getAllModels(): Record<string, ModelInfo> {
    const models = this._registry.getAllModelInfo();
    const result: Record<string, ModelInfo> = {};
    for (const model of models) {
      result[model.modelId] = model;
    }
    return result;
  }

  getAllInstances(): Record<string, ModelInstance> {
    return this._loader.getAllLoadedModels();
  }

  // Model status and health
  isModelAvailable(modelId: string): boolean {
    return this._registry.isModelRegistered(modelId) && this._downloadManager.isDownloaded(modelId);
  }

  isModelLoaded(modelId: string): boolean {
    return this._loader.isModelLoaded(modelId);
  }

  getModelStatus(modelId: string): ModelStatus {
    const instance = this._loader.getLoadedModel(modelId);
    if (instance) {
      return instance.status;
    }

    if (this._downloadManager.isDownloading(modelId)) {
      return ModelStatus.DOWNLOADING;
    }

    if (this._downloadManager.isDownloaded(modelId)) {
      return ModelStatus.DOWNLOADED;
    }

    return ModelStatus.NOT_DOWNLOADED;
  }

  getModelHealth(modelId: string): ModelHealth {
    return this._loader.getModelHealth(modelId);
  }

  // Model configuration
  updateModelConfig(modelId: string, config: Record<string, any>): void {
    this._loader.updateModelConfig(modelId, config);
    this._emitEvent({
      type: 'config_update',
      modelId,
      timestamp: new Date(),
      data: { action: 'config_updated', config }
    });
  }

  // Model deletion
  async deleteModel(modelId: string): Promise<void> {
    try {
      // Unload if loaded
      if (this.isModelLoaded(modelId)) {
        await this.unloadModel(modelId);
      }

      // Remove from registry
      this._registry.unregisterModel(modelId);

      // Clear download progress
      this._downloadManager.clearProgress(modelId);

      this._emitEvent({
        type: 'config_update',
        modelId,
        timestamp: new Date(),
        data: { action: 'deleted' }
      });

    } catch (error) {
      this._emitEvent({
        type: 'load_error',
        modelId,
        timestamp: new Date(),
        data: { 
          action: 'delete_failed',
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }

  // Event handling
  addEventListener(handler: ModelEventHandler): void {
    this._eventHandlers.add(handler);
  }

  removeEventListener(handler: ModelEventHandler): void {
    this._eventHandlers.delete(handler);
  }

  private _emitEvent(event: ModelEvent): void {
    for (const handler of this._eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in model event handler:', error);
      }
    }
  }

  // State management
  getState(): ModelManagerState {
    return {
      models: this.getAllModels(),
      instances: this.getAllInstances(),
      downloadProgress: this._downloadManager.getAllDownloadProgress(),
      isDownloading: this._downloadManager.getActiveDownloadCount() > 0,
      isLoading: this._loader.getLoadingStatistics().loading > 0,
      lastUpdate: new Date()
    };
  }

  // Utility methods
  getRegistry(): ModelRegistry {
    return this._registry;
  }

  getDownloadManager(): ModelDownloadManager {
    return this._downloadManager;
  }

  getLoader(): ModelLoader {
    return this._loader;
  }

  // Statistics
  getStatistics(): {
    totalModels: number;
    downloadedModels: number;
    loadedModels: number;
    activeDownloads: number;
    activeLoads: number;
    totalMemoryUsage: number;
  } {
    const downloadStats = this._downloadManager.getDownloadStatistics();
    const loadStats = this._loader.getLoadingStatistics();

    return {
      totalModels: this._registry.getModelCount(),
      downloadedModels: downloadStats.completedDownloads,
      loadedModels: loadStats.loaded,
      activeDownloads: downloadStats.activeDownloads,
      activeLoads: loadStats.loading,
      totalMemoryUsage: loadStats.totalMemoryUsage
    };
  }

  // Cleanup
  async destroy(): Promise<void> {
    // Unload all models
    await this._loader.unloadAllModels();

    // Clear all data
    this._registry.clear();
    this._downloadManager.clearAllProgress();
    this._eventHandlers.clear();
  }
}
