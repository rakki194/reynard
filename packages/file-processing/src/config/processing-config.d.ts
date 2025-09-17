/**
 * Default processing configuration for the Reynard File Processing system.
 *
 * This module defines the default settings and configuration options
 * used throughout the file processing pipeline.
 */
/**
 * Default configuration for file processing
 */
export declare const DEFAULT_PROCESSING_CONFIG: {
    maxFileSize: number;
    timeout: number;
    thumbnailSize: [number, number];
    previewSize: [number, number];
    quality: number;
    format: "webp";
};
