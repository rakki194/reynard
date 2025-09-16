/**
 * Shared AI/ML Models for Reynard
 *
 * This module provides base model classes and interfaces that all AI/ML
 * models in the Reynard framework should extend. These classes provide
 * common functionality for model lifecycle management, loading, unloading,
 * and configuration.
 */

import { ModelError } from "../types/error-validation.js";
import { ModelConfig, ModelType } from "../types/model-management.js";
import { BaseModel } from "./BaseModel.js";

// Re-export BaseModel
export { BaseModel };

/**
 * Registry for managing AI/ML models
 */
export class ModelRegistry {
  private _models: Map<string, BaseModel> = new Map();
  private _loadedModels: Set<string> = new Set();

  /**
   * Register a model
   */
  register(model: BaseModel): void {
    this._models.set(model.id, model);
  }

  /**
   * Unregister a model
   */
  unregister(modelId: string): void {
    const model = this._models.get(modelId);
    if (model && model.isLoaded) {
      this._loadedModels.delete(modelId);
    }
    this._models.delete(modelId);
  }

  /**
   * Get a model by ID
   */
  get(modelId: string): BaseModel | undefined {
    return this._models.get(modelId);
  }

  /**
   * Get a model by name
   */
  getByName(name: string): BaseModel | undefined {
    for (const model of this._models.values()) {
      if (model.name === name) {
        return model;
      }
    }
    return undefined;
  }

  /**
   * Get all registered models
   */
  getAll(): BaseModel[] {
    return Array.from(this._models.values());
  }

  /**
   * Get models by type
   */
  getByType(type: ModelType): BaseModel[] {
    return Array.from(this._models.values()).filter(model => model.type === type);
  }

  /**
   * Get loaded models
   */
  getLoaded(): BaseModel[] {
    return Array.from(this._models.values()).filter(model => model.isLoaded);
  }

  /**
   * Get available models (not loaded)
   */
  getAvailable(): BaseModel[] {
    return Array.from(this._models.values()).filter(model => !model.isLoaded);
  }

  /**
   * Check if a model is registered
   */
  has(modelId: string): boolean {
    return this._models.has(modelId);
  }

  /**
   * Check if a model is loaded
   */
  isLoaded(modelId: string): boolean {
    return this._loadedModels.has(modelId);
  }

  /**
   * Get model count
   */
  get count(): number {
    return this._models.size;
  }

  /**
   * Get loaded model count
   */
  get loadedCount(): number {
    return this._loadedModels.size;
  }

  /**
   * Load a model
   */
  async loadModel(modelId: string, config?: ModelConfig): Promise<void> {
    const model = this._models.get(modelId);
    if (!model) {
      throw new ModelError(`Model ${modelId} not found`, modelId);
    }

    await model.loadModel(config);
    this._loadedModels.add(modelId);
  }

  /**
   * Unload a model
   */
  async unloadModel(modelId: string): Promise<void> {
    const model = this._models.get(modelId);
    if (!model) {
      throw new ModelError(`Model ${modelId} not found`, modelId);
    }

    await model.unloadModel();
    this._loadedModels.delete(modelId);
  }

  /**
   * Unload all models
   */
  async unloadAll(): Promise<void> {
    const loadedModelIds = Array.from(this._loadedModels);
    for (const modelId of loadedModelIds) {
      try {
        await this.unloadModel(modelId);
      } catch (error) {
        console.error(`Failed to unload model ${modelId}:`, error);
      }
    }
  }
}

// ============================================================================
// Global Model Registry Instance
// ============================================================================

let globalModelRegistry: ModelRegistry | null = null;

/**
 * Get the global model registry instance
 */
export function getModelRegistry(): ModelRegistry {
  if (!globalModelRegistry) {
    globalModelRegistry = new ModelRegistry();
  }
  return globalModelRegistry;
}

/**
 * Reset the global model registry (mainly for testing)
 */
export function resetModelRegistry(): void {
  globalModelRegistry = null;
}

// ============================================================================
// Export all models
// ============================================================================

export * from "./BaseCaptionModel.js";

// ============================================================================
// Re-export types for convenience
// ============================================================================

// Types are imported directly where needed to avoid circular dependency issues
