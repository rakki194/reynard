/**
 * Base Model Class
 *
 * Abstract base class that all model implementations must extend.
 * Provides common model lifecycle management and interface.
 */

import { ModelType, ModelStatus, ModelHealth, ModelInstance, ModelCapabilities } from "../types/index.js";

export abstract class BaseModel {
  protected _modelId: string;
  protected _modelType: ModelType;
  protected _status: ModelStatus = ModelStatus.NOT_DOWNLOADED;
  protected _health: ModelHealth = ModelHealth.UNKNOWN;
  protected _config: Record<string, any> = {};
  protected _loadedAt?: Date;
  protected _lastUsed?: Date;
  protected _error?: string;
  protected _metadata: Record<string, any> = {};
  protected _isInitialized = false;

  constructor(modelId: string, modelType: ModelType, config: Record<string, any> = {}) {
    this._modelId = modelId;
    this._modelType = modelType;
    this._config = { ...config };
  }

  // Abstract methods that must be implemented by subclasses
  abstract download(): Promise<void>;
  abstract load(config?: Record<string, any>): Promise<void>;
  abstract unload(): Promise<void>;
  abstract healthCheck(): Promise<ModelHealth>;
  abstract isAvailable(): Promise<boolean>;

  // Getters
  get modelId(): string {
    return this._modelId;
  }

  get modelType(): ModelType {
    return this._modelType;
  }

  get status(): ModelStatus {
    return this._status;
  }

  get health(): ModelHealth {
    return this._health;
  }

  get config(): Record<string, any> {
    return { ...this._config };
  }

  get loadedAt(): Date | undefined {
    return this._loadedAt;
  }

  get lastUsed(): Date | undefined {
    return this._lastUsed;
  }

  get error(): string | undefined {
    return this._error;
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  // Lifecycle methods
  async initialize(): Promise<void> {
    if (this._isInitialized) {
      return;
    }

    try {
      this._status = ModelStatus.LOADING;
      this._error = undefined as string | undefined;

      // Check if model is available
      const available = await this.isAvailable();
      if (!available) {
        throw new Error(`Model ${this._modelId} is not available`);
      }

      // Load the model
      await this.load(this._config);

      this._status = ModelStatus.LOADED;
      this._loadedAt = new Date();
      this._isInitialized = true;

      // Perform initial health check
      this._health = await this.healthCheck();
    } catch (error) {
      this._status = ModelStatus.ERROR;
      this._error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    if (!this._isInitialized) {
      return;
    }

    try {
      await this.unload();
      this._status = ModelStatus.DOWNLOADED;
      this._isInitialized = false;
      this._loadedAt = undefined as Date | undefined;
    } catch (error) {
      this._status = ModelStatus.ERROR;
      this._error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  // Configuration management
  updateConfig(config: Record<string, any>): void {
    this._config = { ...this._config, ...config };
  }

  getConfigValue(key: string): any {
    return this._config[key];
  }

  setConfigValue(key: string, value: any): void {
    this._config[key] = value;
  }

  // Metadata management
  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
  }

  getMetadataValue(key: string): any {
    return this._metadata[key];
  }

  setMetadataValue(key: string, value: any): void {
    this._metadata[key] = value;
  }

  // Usage tracking
  markUsed(): void {
    this._lastUsed = new Date();
  }

  // Utility methods
  getInstance(): ModelInstance {
    return {
      modelId: this._modelId,
      modelType: this._modelType,
      status: this._status,
      health: this._health,
      config: this._config,
      loadedAt: this._loadedAt,
      lastUsed: this._lastUsed,
      error: this._error,
      metadata: this._metadata,
    };
  }

  // Model capabilities (can be overridden by subclasses)
  getCapabilities(): ModelCapabilities {
    return {
      batchProcessing: false,
      gpuAcceleration: false,
      streaming: false,
      realTime: false,
      multilingual: false,
      customWeights: false,
    };
  }

  // Validation
  validateConfig(config: Record<string, any>): boolean {
    // Override in subclasses to provide specific validation
    return true;
  }

  // Error handling
  protected setError(error: string): void {
    this._error = error;
    this._status = ModelStatus.ERROR;
  }

  protected clearError(): void {
    this._error = undefined as string | undefined;
  }

  // Status management
  protected setStatus(status: ModelStatus): void {
    this._status = status;
  }

  protected setHealth(health: ModelHealth): void {
    this._health = health;
  }
}
