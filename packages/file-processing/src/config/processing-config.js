/**
 * Default processing configuration for the Reynard File Processing system.
 *
 * This module defines the default settings and configuration options
 * used throughout the file processing pipeline.
 */
/**
 * Default configuration for file processing
 */
export const DEFAULT_PROCESSING_CONFIG = {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    timeout: 30000, // 30 seconds
    thumbnailSize: [200, 200],
    previewSize: [800, 800],
    quality: 85,
    format: "webp",
};
