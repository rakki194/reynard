/**
 * Shared AI/ML Models for Reynard
 *
 * This module provides base model classes and interfaces that all AI/ML
 * models in the Reynard framework should extend. These classes provide
 * common functionality for model lifecycle management, loading, unloading,
 * and configuration.
 */
import { ModelConfig, ModelType } from "../types/model-management.js";
import { BaseModel } from "./BaseModel.js";
export { BaseModel };
/**
 * Registry for managing AI/ML models
 */
export declare class ModelRegistry {
    private _models;
    private _loadedModels;
    /**
     * Register a model
     */
    register(model: BaseModel): void;
    /**
     * Unregister a model
     */
    unregister(modelId: string): void;
    /**
     * Get a model by ID
     */
    get(modelId: string): BaseModel | undefined;
    /**
     * Get a model by name
     */
    getByName(name: string): BaseModel | undefined;
    /**
     * Get all registered models
     */
    getAll(): BaseModel[];
    /**
     * Get models by type
     */
    getByType(type: ModelType): BaseModel[];
    /**
     * Get loaded models
     */
    getLoaded(): BaseModel[];
    /**
     * Get available models (not loaded)
     */
    getAvailable(): BaseModel[];
    /**
     * Check if a model is registered
     */
    has(modelId: string): boolean;
    /**
     * Check if a model is loaded
     */
    isLoaded(modelId: string): boolean;
    /**
     * Get model count
     */
    get count(): number;
    /**
     * Get loaded model count
     */
    get loadedCount(): number;
    /**
     * Load a model
     */
    loadModel(modelId: string, config?: ModelConfig): Promise<void>;
    /**
     * Unload a model
     */
    unloadModel(modelId: string): Promise<void>;
    /**
     * Unload all models
     */
    unloadAll(): Promise<void>;
}
/**
 * Get the global model registry instance
 */
export declare function getModelRegistry(): ModelRegistry;
/**
 * Reset the global model registry (mainly for testing)
 */
export declare function resetModelRegistry(): void;
export * from "./BaseCaptionModel.js";
