/**
 * Shared AI/ML Models for Reynard
 *
 * This module provides base model classes and interfaces that all AI/ML
 * models in the Reynard framework should extend. These classes provide
 * common functionality for model lifecycle management, loading, unloading,
 * and configuration.
 */

import {
  ModelStatus,
  ModelType,
  ModelInfo,
  ModelConfig,
  ModelError,
} from "../types/index.js";

// ============================================================================
// Base Model Class
// ============================================================================

/**
 * Abstract base class for all AI/ML models in Reynard.
 *
 * Provides common functionality for:
 * - Model lifecycle management (load, unload, reload)
 * - Status monitoring and health checks
 * - Configuration management
 * - Memory and resource tracking
 * - Error handling and logging
 *
 * All AI/ML models should extend this class to ensure consistency
 * and interoperability across the Reynard ecosystem.
 */
export abstract class BaseModel {
  protected _id: string;
  protected _name: string;
  protected _type: ModelType;
  protected _version: string;
  protected _description: string;
  protected _status: ModelStatus = ModelStatus.NOT_LOADED;
  protected _size: number = 0;
  protected _memoryUsage: number = 0;
  protected _gpuAcceleration: boolean = false;
  protected _supportedFormats: string[] = [];
  protected _configSchema: Record<string, any> = {};
  protected _metadata: Record<string, any> = {};
  protected _config: ModelConfig = {};
  protected _loadTime?: Date;
  protected _lastError?: string;
  protected _isInitialized = false;

  constructor(
    id: string,
    name: string,
    type: ModelType,
    version: string,
    description: string,
    configSchema: Record<string, any> = {},
    metadata: Record<string, any> = {},
  ) {
    this._id = id;
    this._name = name;
    this._type = type;
    this._version = version;
    this._description = description;
    this._configSchema = configSchema;
    this._metadata = metadata;
  }

  // ========================================================================
  // Abstract Methods (must be implemented by subclasses)
  // ========================================================================

  /**
   * Load the model into memory. This method should be implemented by subclasses
   * to perform the actual model loading, including downloading if necessary.
   */
  abstract load(config?: ModelConfig): Promise<void>;

  /**
   * Unload the model from memory. This method should be implemented by subclasses
   * to free up memory and resources.
   */
  abstract unload(): Promise<void>;

  /**
   * Check if the model is available for loading. This method should be implemented
   * by subclasses to check if the model files exist and are accessible.
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Get model information including size, memory usage, and other metadata.
   * This method should be implemented by subclasses to provide accurate
   * information about the model.
   */
  abstract getModelInfo(): Promise<ModelInfo>;

  // ========================================================================
  // Public Interface
  // ========================================================================

  /**
   * Get the model ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the model name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get the model type
   */
  get type(): ModelType {
    return this._type;
  }

  /**
   * Get the model version
   */
  get version(): string {
    return this._version;
  }

  /**
   * Get the model description
   */
  get description(): string {
    return this._description;
  }

  /**
   * Get the current model status
   */
  get status(): ModelStatus {
    return this._status;
  }

  /**
   * Check if the model is loaded
   */
  get isLoaded(): boolean {
    return this._status === ModelStatus.LOADED;
  }

  /**
   * Get the model size in bytes
   */
  get size(): number {
    return this._size;
  }

  /**
   * Get the current memory usage in bytes
   */
  get memoryUsage(): number {
    return this._memoryUsage;
  }

  /**
   * Check if GPU acceleration is enabled
   */
  get gpuAcceleration(): boolean {
    return this._gpuAcceleration;
  }

  /**
   * Get supported file formats
   */
  get supportedFormats(): string[] {
    return [...this._supportedFormats];
  }

  /**
   * Get configuration schema
   */
  get configSchema(): Record<string, any> {
    return { ...this._configSchema };
  }

  /**
   * Get model metadata
   */
  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  /**
   * Get current configuration
   */
  get config(): ModelConfig {
    return { ...this._config };
  }

  /**
   * Get load time
   */
  get loadTime(): Date | undefined {
    return this._loadTime;
  }

  /**
   * Get last error message
   */
  get lastError(): string | undefined {
    return this._lastError;
  }

  /**
   * Check if model is initialized
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  // ========================================================================
  // Lifecycle Management
  // ========================================================================

  /**
   * Load the model with optional configuration
   */
  async loadModel(config?: ModelConfig): Promise<void> {
    if (this._status === ModelStatus.LOADED) {
      return;
    }

    if (this._status === ModelStatus.LOADING) {
      throw new ModelError(
        `Model ${this._name} is already being loaded`,
        this._name,
      );
    }

    try {
      this._status = ModelStatus.LOADING;
      this._lastError = undefined;

      // Update configuration if provided
      if (config) {
        this._config = { ...this._config, ...config };
      }

      // Check if model is available
      const available = await this.isAvailable();
      if (!available) {
        throw new ModelError(
          `Model ${this._name} is not available`,
          this._name,
        );
      }

      // Load the model
      await this.load(this._config);

      this._status = ModelStatus.LOADED;
      this._loadTime = new Date();
      this._isInitialized = true;
    } catch (error) {
      this._status = ModelStatus.ERROR;
      this._lastError = error instanceof Error ? error.message : String(error);
      throw new ModelError(
        `Failed to load model ${this._name}: ${this._lastError}`,
        this._name,
        { error },
      );
    }
  }

  /**
   * Unload the model
   */
  async unloadModel(): Promise<void> {
    if (this._status === ModelStatus.NOT_LOADED) {
      return;
    }

    if (this._status === ModelStatus.UNLOADING) {
      throw new ModelError(
        `Model ${this._name} is already being unloaded`,
        this._name,
      );
    }

    try {
      this._status = ModelStatus.UNLOADING;
      this._lastError = undefined;

      // Unload the model
      await this.unload();

      this._status = ModelStatus.NOT_LOADED;
      this._memoryUsage = 0;
      this._isInitialized = false;
    } catch (error) {
      this._status = ModelStatus.ERROR;
      this._lastError = error instanceof Error ? error.message : String(error);
      throw new ModelError(
        `Failed to unload model ${this._name}: ${this._lastError}`,
        this._name,
        { error },
      );
    }
  }

  /**
   * Reload the model
   */
  async reloadModel(config?: ModelConfig): Promise<void> {
    await this.unloadModel();
    await this.loadModel(config);
  }

  // ========================================================================
  // Configuration Management
  // ========================================================================

  /**
   * Update model configuration
   */
  updateConfig(config: Partial<ModelConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Get a specific configuration value
   */
  getConfigValue(key: string): any {
    return this._config[key];
  }

  /**
   * Set a specific configuration value
   */
  setConfigValue(key: string, value: any): void {
    this._config[key] = value;
  }

  /**
   * Validate configuration against schema
   */
  validateConfig(config: ModelConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [key, value] of Object.entries(config)) {
      const schema = this._configSchema[key];
      if (schema) {
        // Basic validation - can be extended
        if (schema.required && (value === undefined || value === null)) {
          errors.push(`${key} is required`);
        }
        if (schema.type && typeof value !== schema.type) {
          errors.push(`${key} must be of type ${schema.type}`);
        }
        if (schema.min && value < schema.min) {
          errors.push(`${key} must be at least ${schema.min}`);
        }
        if (schema.max && value > schema.max) {
          errors.push(`${key} must be at most ${schema.max}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  /**
   * Get human-readable model size
   */
  getFormattedSize(): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = this._size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Get human-readable memory usage
   */
  getFormattedMemoryUsage(): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let usage = this._memoryUsage;
    let unitIndex = 0;

    while (usage >= 1024 && unitIndex < units.length - 1) {
      usage /= 1024;
      unitIndex++;
    }

    return `${usage.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Get model uptime in milliseconds
   */
  getUptime(): number {
    if (!this._loadTime) {
      return 0;
    }
    return Date.now() - this._loadTime.getTime();
  }

  /**
   * Get model uptime as human-readable string
   */
  getFormattedUptime(): string {
    const uptime = this.getUptime();
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// ============================================================================
// Model Registry
// ============================================================================

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
    return Array.from(this._models.values()).filter(
      (model) => model.type === type,
    );
  }

  /**
   * Get loaded models
   */
  getLoaded(): BaseModel[] {
    return Array.from(this._models.values()).filter((model) => model.isLoaded);
  }

  /**
   * Get available models (not loaded)
   */
  getAvailable(): BaseModel[] {
    return Array.from(this._models.values()).filter((model) => !model.isLoaded);
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

export * from "./index";
