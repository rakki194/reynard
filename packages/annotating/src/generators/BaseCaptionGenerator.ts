/**
 * Base Caption Generator
 * 
 * Abstract base class that all caption generators must extend.
 * Provides common interface and functionality for caption generation.
 */

import { CaptionType, CaptionResult, CaptionTask, CaptionGenerator, CaptionGeneratorConfig } from '../types/index.js';

export abstract class BaseCaptionGenerator implements CaptionGenerator {
  protected _name: string;
  protected _description: string;
  protected _version: string;
  protected _captionType: CaptionType;
  protected _isAvailable: boolean = false;
  protected _isLoaded: boolean = false;
  protected _configSchema: Record<string, any> = {};
  protected _features: string[] = [];
  protected _metadata: Record<string, any> = {};
  protected _config: CaptionGeneratorConfig = {};

  constructor(
    name: string,
    description: string,
    version: string,
    captionType: CaptionType,
    configSchema: Record<string, any> = {},
    features: string[] = []
  ) {
    this._name = name;
    this._description = description;
    this._version = version;
    this._captionType = captionType;
    this._configSchema = configSchema;
    this._features = features;
  }

  // Abstract methods that must be implemented by subclasses
  abstract generate(imagePath: string, config?: CaptionGeneratorConfig): Promise<string>;
  abstract checkAvailability(): Promise<boolean>;
  abstract load(config?: CaptionGeneratorConfig): Promise<void>;
  abstract unload(): Promise<void>;

  // Getters
  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get version(): string {
    return this._version;
  }

  get captionType(): CaptionType {
    return this._captionType;
  }

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  get configSchema(): Record<string, any> {
    return { ...this._configSchema };
  }

  get features(): string[] {
    return [...this._features];
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  // Configuration management
  getConfig(): CaptionGeneratorConfig {
    return { ...this._config };
  }

  updateConfig(config: CaptionGeneratorConfig): void {
    this._config = { ...this._config, ...config };
  }

  getConfigValue(key: keyof CaptionGeneratorConfig): any {
    return this._config[key];
  }

  setConfigValue(key: keyof CaptionGeneratorConfig, value: any): void {
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

  // Lifecycle methods
  async initialize(config?: CaptionGeneratorConfig): Promise<void> {
    if (this._isLoaded) {
      return;
    }

    try {
      // Check availability
      this._isAvailable = await this.checkAvailability();
      if (!this._isAvailable) {
        throw new Error(`Generator ${this._name} is not available`);
      }

      // Update config if provided
      if (config) {
        this.updateConfig(config);
      }

      // Load the generator
      await this.load(this._config);
      this._isLoaded = true;

    } catch (error) {
      this._isLoaded = false;
      throw error;
    }
  }

  async destroy(): Promise<void> {
    if (!this._isLoaded) {
      return;
    }

    try {
      await this.unload();
      this._isLoaded = false;
    } catch (error) {
      throw error;
    }
  }

  // Caption generation
  async generateCaption(task: CaptionTask): Promise<CaptionResult> {
    const startTime = Date.now();

    try {
      if (!this._isLoaded) {
        throw new Error(`Generator ${this._name} is not loaded`);
      }

      // Generate caption
      const caption = await this.generate(task.imagePath, task.config);

      // Apply post-processing if requested
      let processedCaption = caption;
      if (task.postProcess && caption) {
        processedCaption = this.postProcessCaption(caption);
      }

      const processingTime = Date.now() - startTime;

      return {
        imagePath: task.imagePath,
        generatorName: this._name,
        success: true,
        caption: processedCaption,
        processingTime,
        captionType: this._captionType,
        metadata: {
          originalCaption: caption,
          postProcessed: task.postProcess,
          config: this._config
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      return {
        imagePath: task.imagePath,
        generatorName: this._name,
        success: false,
        caption: '',
        processingTime,
        captionType: this._captionType,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Post-processing
  protected postProcessCaption(caption: string): string {
    if (!caption) return caption;

    let processed = caption;

    // Replace underscores with spaces
    processed = processed.replace(/_/g, ' ');

    // Normalize spacing
    processed = processed.replace(/\s+/g, ' ').trim();

    // Ensure terminal punctuation for long sentences
    if (processed.length > 50 && !/[.!?]$/.test(processed)) {
      processed += '.';
    }

    // Capitalize first letter
    if (processed.length > 0) {
      processed = processed.charAt(0).toUpperCase() + processed.slice(1);
    }

    return processed;
  }

  // Validation
  validateConfig(config: CaptionGeneratorConfig): string[] {
    const errors: string[] = [];

    // Basic validation - can be overridden by subclasses
    if (config.threshold !== undefined && (config.threshold < 0 || config.threshold > 1)) {
      errors.push('Threshold must be between 0 and 1');
    }

    if (config.batchSize !== undefined && config.batchSize < 1) {
      errors.push('Batch size must be at least 1');
    }

    if (config.maxLength !== undefined && config.maxLength < 1) {
      errors.push('Max length must be at least 1');
    }

    return errors;
  }

  // Utility methods
  getInfo(): CaptionGenerator {
    return {
      name: this._name,
      description: this._description,
      version: this._version,
      captionType: this._captionType,
      isAvailable: this._isAvailable,
      isLoaded: this._isLoaded,
      configSchema: this._configSchema,
      features: this._features,
      metadata: this._metadata
    };
  }

  // Error handling
  protected setError(error: string): void {
    this._isLoaded = false;
    this._isAvailable = false;
    this._metadata.error = error;
  }

  protected clearError(): void {
    delete this._metadata.error;
  }

  // Status management
  protected setAvailable(available: boolean): void {
    this._isAvailable = available;
  }

  protected setLoaded(loaded: boolean): void {
    this._isLoaded = loaded;
  }
}
