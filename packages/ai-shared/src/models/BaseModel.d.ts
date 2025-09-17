/**
 * Base Model Class for Reynard
 *
 * Abstract base class for all AI/ML models in the Reynard framework.
 * Provides common functionality for model lifecycle management, loading, unloading,
 * and configuration.
 */
import { ModelConfig, ModelInfo, ModelStatus, ModelType } from "../types/model-management.js";
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
export declare abstract class BaseModel {
    protected _id: string;
    protected _name: string;
    protected _type: ModelType;
    protected _version: string;
    protected _description: string;
    protected _status: ModelStatus;
    protected _size: number;
    protected _memoryUsage: number;
    protected _gpuAcceleration: boolean;
    protected _supportedFormats: string[];
    protected _configSchema: Record<string, any>;
    protected _metadata: Record<string, any>;
    protected _config: ModelConfig;
    protected _loadTime?: Date;
    protected _lastError?: string;
    protected _isInitialized: boolean;
    constructor(id: string, name: string, type: ModelType, version: string, description: string, configSchema?: Record<string, any>, metadata?: Record<string, any>);
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
    /**
     * Get the model ID
     */
    get id(): string;
    /**
     * Get the model name
     */
    get name(): string;
    /**
     * Get the model type
     */
    get type(): ModelType;
    /**
     * Get the model version
     */
    get version(): string;
    /**
     * Get the model description
     */
    get description(): string;
    /**
     * Get the current model status
     */
    get status(): ModelStatus;
    /**
     * Check if the model is loaded
     */
    get isLoaded(): boolean;
    /**
     * Get the model size in bytes
     */
    get size(): number;
    /**
     * Get the current memory usage in bytes
     */
    get memoryUsage(): number;
    /**
     * Check if GPU acceleration is enabled
     */
    get gpuAcceleration(): boolean;
    /**
     * Get supported file formats
     */
    get supportedFormats(): string[];
    /**
     * Get configuration schema
     */
    get configSchema(): Record<string, any>;
    /**
     * Get model metadata
     */
    get metadata(): Record<string, any>;
    /**
     * Get current configuration
     */
    get config(): ModelConfig;
    /**
     * Get load time
     */
    get loadTime(): Date | undefined;
    /**
     * Get last error message
     */
    get lastError(): string | undefined;
    /**
     * Check if model is initialized
     */
    get isInitialized(): boolean;
    /**
     * Load the model with optional configuration
     */
    loadModel(config?: ModelConfig): Promise<void>;
    /**
     * Unload the model
     */
    unloadModel(): Promise<void>;
    /**
     * Reload the model
     */
    reloadModel(config?: ModelConfig): Promise<void>;
    /**
     * Update model configuration
     */
    updateConfig(config: Partial<ModelConfig>): void;
    /**
     * Get a specific configuration value
     */
    getConfigValue(key: string): any;
    /**
     * Set a specific configuration value
     */
    setConfigValue(key: string, value: any): void;
    /**
     * Validate configuration against schema
     */
    validateConfig(config: ModelConfig): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Get human-readable model size
     */
    getFormattedSize(): string;
    /**
     * Get human-readable memory usage
     */
    getFormattedMemoryUsage(): string;
    /**
     * Get model uptime in milliseconds
     */
    getUptime(): number;
    /**
     * Get model uptime as human-readable string
     */
    getFormattedUptime(): string;
}
