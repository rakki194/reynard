/**
 * Base Caption Model
 *
 * Abstract base class for all caption generation models in the Reynard framework.
 * Extends BaseModel to provide caption-specific functionality while maintaining
 * the standard model lifecycle management.
 */

import { BaseModel } from "./index.js";
import { ModelType, ModelInfo } from "../types/model-management.js";
import { CaptionTask, CaptionResult, CaptionType } from "../types/index.js";

/**
 * Abstract base class for caption generation models
 */
export abstract class BaseCaptionModel extends BaseModel {
  protected _supportedCaptionTypes: CaptionType[] = [];
  protected _defaultCaptionType: CaptionType = CaptionType.CAPTION;
  protected _maxImageSize: number = 1024 * 1024; // 1MB default
  protected _supportedFormats: string[] = ["jpg", "jpeg", "png", "webp"];

  constructor(
    id: string,
    name: string,
    version: string,
    description: string,
    supportedCaptionTypes: CaptionType[] = [CaptionType.CAPTION],
    configSchema: Record<string, any> = {},
    metadata: Record<string, any> = {},
  ) {
    super(
      id,
      name,
      ModelType.CAPTION,
      version,
      description,
      configSchema,
      metadata,
    );

    this._supportedCaptionTypes = supportedCaptionTypes;
    this._supportedFormats = ["jpg", "jpeg", "png", "webp"];
  }

  // ========================================================================
  // Abstract Methods (must be implemented by subclasses)
  // ========================================================================

  /**
   * Generate a caption for the given task
   */
  abstract generateCaption(task: CaptionTask): Promise<CaptionResult>;

  /**
   * Get the default caption type for this model
   */
  abstract getDefaultCaptionType(): CaptionType;

  /**
   * Validate if the model can handle the given caption type
   */
  abstract canGenerateCaptionType(captionType: CaptionType): boolean;

  // ========================================================================
  // Public Interface
  // ========================================================================

  /**
   * Get supported caption types
   */
  get supportedCaptionTypes(): CaptionType[] {
    return [...this._supportedCaptionTypes];
  }

  /**
   * Get default caption type
   */
  get defaultCaptionType(): CaptionType {
    return this._defaultCaptionType;
  }

  /**
   * Get maximum supported image size
   */
  get maxImageSize(): number {
    return this._maxImageSize;
  }

  /**
   * Get supported image formats
   */
  get supportedImageFormats(): string[] {
    return [...this._supportedFormats];
  }

  /**
   * Check if the model supports a specific caption type
   */
  supportsCaptionType(captionType: CaptionType): boolean {
    return this._supportedCaptionTypes.includes(captionType);
  }

  /**
   * Check if the model supports a specific image format
   */
  supportsImageFormat(format: string): boolean {
    return this._supportedFormats.includes(format.toLowerCase());
  }

  /**
   * Validate a caption task
   */
  validateCaptionTask(task: CaptionTask): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check if image path is provided
    if (!task.imagePath) {
      errors.push("Image path is required");
    }

    // Check if caption type is supported
    if (task.captionType && !this.supportsCaptionType(task.captionType)) {
      errors.push(
        `Caption type ${task.captionType} is not supported by this model`,
      );
    }

    // Check if image format is supported
    if (task.imagePath) {
      const extension = task.imagePath.split(".").pop()?.toLowerCase();
      if (extension && !this.supportsImageFormat(extension)) {
        errors.push(`Image format ${extension} is not supported by this model`);
      }
    }

    // Validate configuration
    if (task.config) {
      const configValidation = this.validateConfig(task.config);
      if (!configValidation.isValid) {
        errors.push(...configValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get model information including caption-specific details
   */
  async getModelInfo(): Promise<ModelInfo> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      version: this.version,
      description: this.description,
      status: this.status,
      size: this.size,
      memoryUsage: this.memoryUsage,
      gpuAcceleration: this.gpuAcceleration,
      supportedFormats: this.supportedFormats,
      configSchema: this.configSchema,
      metadata: {
        ...this.metadata,
        supportedCaptionTypes: this._supportedCaptionTypes,
        defaultCaptionType: this._defaultCaptionType,
        maxImageSize: this._maxImageSize,
        supportedImageFormats: this._supportedFormats,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // ========================================================================
  // Configuration Management
  // ========================================================================

  /**
   * Set supported caption types
   */
  setSupportedCaptionTypes(types: CaptionType[]): void {
    this._supportedCaptionTypes = [...types];
  }

  /**
   * Set default caption type
   */
  setDefaultCaptionType(type: CaptionType): void {
    if (this.supportsCaptionType(type)) {
      this._defaultCaptionType = type;
    } else {
      throw new Error(`Caption type ${type} is not supported by this model`);
    }
  }

  /**
   * Set maximum image size
   */
  setMaxImageSize(size: number): void {
    this._maxImageSize = size;
  }

  /**
   * Set supported image formats
   */
  setSupportedImageFormats(formats: string[]): void {
    this._supportedFormats = formats.map((f) => f.toLowerCase());
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  /**
   * Get human-readable maximum image size
   */
  getFormattedMaxImageSize(): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = this._maxImageSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Get caption type display name
   */
  getCaptionTypeDisplayName(captionType: CaptionType): string {
    const displayNames: Record<CaptionType, string> = {
      [CaptionType.TAGS]: "Tags",
      [CaptionType.CAPTION]: "Caption",
      [CaptionType.DESCRIPTION]: "Description",
      [CaptionType.E621]: "E621 Tags",
      [CaptionType.TOML]: "TOML Metadata",
    };

    return displayNames[captionType] || captionType;
  }

  /**
   * Get all supported caption types as display names
   */
  getSupportedCaptionTypeDisplayNames(): string[] {
    return this._supportedCaptionTypes.map((type) =>
      this.getCaptionTypeDisplayName(type),
    );
  }
}
