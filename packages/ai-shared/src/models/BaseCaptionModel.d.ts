/**
 * Base Caption Model
 *
 * Abstract base class for all caption generation models in the Reynard framework.
 * Extends BaseModel to provide caption-specific functionality while maintaining
 * the standard model lifecycle management.
 */
import { CaptionResult, CaptionTask, CaptionType } from "../types/index.js";
import { ModelInfo } from "../types/model-management.js";
import { BaseModel } from "./BaseModel.js";
/**
 * Abstract base class for caption generation models
 */
export declare abstract class BaseCaptionModel extends BaseModel {
    protected _supportedCaptionTypes: CaptionType[];
    protected _defaultCaptionType: CaptionType;
    protected _maxImageSize: number;
    protected _supportedFormats: string[];
    constructor(id: string, name: string, version: string, description: string, supportedCaptionTypes?: CaptionType[], configSchema?: Record<string, any>, metadata?: Record<string, any>);
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
    /**
     * Get supported caption types
     */
    get supportedCaptionTypes(): CaptionType[];
    /**
     * Get default caption type
     */
    get defaultCaptionType(): CaptionType;
    /**
     * Get maximum supported image size
     */
    get maxImageSize(): number;
    /**
     * Get supported image formats
     */
    get supportedImageFormats(): string[];
    /**
     * Check if the model supports a specific caption type
     */
    supportsCaptionType(captionType: CaptionType): boolean;
    /**
     * Check if the model supports a specific image format
     */
    supportsImageFormat(format: string): boolean;
    /**
     * Validate a caption task
     */
    validateCaptionTask(task: CaptionTask): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Get model information including caption-specific details
     */
    getModelInfo(): Promise<ModelInfo>;
    /**
     * Set supported caption types
     */
    setSupportedCaptionTypes(types: CaptionType[]): void;
    /**
     * Set default caption type
     */
    setDefaultCaptionType(type: CaptionType): void;
    /**
     * Set maximum image size
     */
    setMaxImageSize(size: number): void;
    /**
     * Set supported image formats
     */
    setSupportedImageFormats(formats: string[]): void;
    /**
     * Get human-readable maximum image size
     */
    getFormattedMaxImageSize(): string;
    /**
     * Get caption type display name
     */
    getCaptionTypeDisplayName(captionType: CaptionType): string;
    /**
     * Get all supported caption types as display names
     */
    getSupportedCaptionTypeDisplayNames(): string[];
}
