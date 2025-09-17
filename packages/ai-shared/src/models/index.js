/**
 * Shared AI/ML Models for Reynard
 *
 * This module provides base model classes and interfaces that all AI/ML
 * models in the Reynard framework should extend. These classes provide
 * common functionality for model lifecycle management, loading, unloading,
 * and configuration.
 */
import { ModelError } from "../types/error-validation.js";
import { BaseModel } from "./BaseModel.js";
// Re-export BaseModel
export { BaseModel };
/**
 * Registry for managing AI/ML models
 */
export class ModelRegistry {
    constructor() {
        Object.defineProperty(this, "_models", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "_loadedModels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
    }
    /**
     * Register a model
     */
    register(model) {
        this._models.set(model.id, model);
    }
    /**
     * Unregister a model
     */
    unregister(modelId) {
        const model = this._models.get(modelId);
        if (model && model.isLoaded) {
            this._loadedModels.delete(modelId);
        }
        this._models.delete(modelId);
    }
    /**
     * Get a model by ID
     */
    get(modelId) {
        return this._models.get(modelId);
    }
    /**
     * Get a model by name
     */
    getByName(name) {
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
    getAll() {
        return Array.from(this._models.values());
    }
    /**
     * Get models by type
     */
    getByType(type) {
        return Array.from(this._models.values()).filter(model => model.type === type);
    }
    /**
     * Get loaded models
     */
    getLoaded() {
        return Array.from(this._models.values()).filter(model => model.isLoaded);
    }
    /**
     * Get available models (not loaded)
     */
    getAvailable() {
        return Array.from(this._models.values()).filter(model => !model.isLoaded);
    }
    /**
     * Check if a model is registered
     */
    has(modelId) {
        return this._models.has(modelId);
    }
    /**
     * Check if a model is loaded
     */
    isLoaded(modelId) {
        return this._loadedModels.has(modelId);
    }
    /**
     * Get model count
     */
    get count() {
        return this._models.size;
    }
    /**
     * Get loaded model count
     */
    get loadedCount() {
        return this._loadedModels.size;
    }
    /**
     * Load a model
     */
    async loadModel(modelId, config) {
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
    async unloadModel(modelId) {
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
    async unloadAll() {
        const loadedModelIds = Array.from(this._loadedModels);
        for (const modelId of loadedModelIds) {
            try {
                await this.unloadModel(modelId);
            }
            catch (error) {
                console.error(`Failed to unload model ${modelId}:`, error);
            }
        }
    }
}
// ============================================================================
// Global Model Registry Instance
// ============================================================================
let globalModelRegistry = null;
/**
 * Get the global model registry instance
 */
export function getModelRegistry() {
    if (!globalModelRegistry) {
        globalModelRegistry = new ModelRegistry();
    }
    return globalModelRegistry;
}
/**
 * Reset the global model registry (mainly for testing)
 */
export function resetModelRegistry() {
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
