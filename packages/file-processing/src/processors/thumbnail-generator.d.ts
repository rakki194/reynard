/**
 * Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides unified thumbnail generation for various file types
 * by orchestrating specialized generators through a factory pattern.
 */
import { ThumbnailOptions, ProcessingResult } from "../types";
export interface ThumbnailGeneratorOptions extends ThumbnailOptions {
    /** Whether to enable Web Workers for background processing */
    useWebWorkers?: boolean;
    /** Maximum thumbnail size in bytes */
    maxThumbnailSize?: number;
    /** Whether to enable progressive loading */
    progressive?: boolean;
    /** Custom background color for transparent images */
    backgroundColor?: string;
}
export declare class ThumbnailGenerator {
    private options;
    private factory;
    constructor(options?: ThumbnailGeneratorOptions);
    /**
     * Generate a thumbnail for any supported file type
     */
    generateThumbnail(file: File | string, options?: Partial<ThumbnailOptions>): Promise<ProcessingResult<Blob | string>>;
    /**
     * Get file information
     */
    private getFileInfo;
    /**
     * Get file extension from filename
     */
    private getFileExtension;
    /**
     * Clean up resources
     */
    destroy(): void;
}
