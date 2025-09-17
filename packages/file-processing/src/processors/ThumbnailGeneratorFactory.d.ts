/**
 * Thumbnail Generator Factory for the Reynard File Processing system.
 *
 * This module provides a factory pattern to create appropriate thumbnail generators
 * based on file type, ensuring optimal performance and specialized handling.
 */
import { ThumbnailOptions, ProcessingResult } from "../types";
import { GeneratorRegistryOptions } from "./utils/generator-registry";
export type ThumbnailGeneratorFactoryOptions = GeneratorRegistryOptions;
export declare class ThumbnailGeneratorFactory {
    private options;
    private registry;
    constructor(options?: ThumbnailGeneratorFactoryOptions);
    /**
     * Generate a thumbnail for any supported file type
     */
    generateThumbnail(file: File | string, options?: Partial<ThumbnailOptions>): Promise<ProcessingResult<Blob | string>>;
    /**
     * Create error result with consistent format
     */
    private createErrorResult;
    /**
     * Clean up resources
     */
    destroy(): void;
}
