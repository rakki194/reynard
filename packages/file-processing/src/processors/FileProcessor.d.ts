/**
 * Core file processing logic for the pipeline.
 *
 * Handles the main processing operations including metadata extraction,
 * thumbnail generation, and content analysis.
 */
import { ProcessingOptions, ProcessingResult, ThumbnailOptions } from "../types";
import { ConfigManager } from "./utils/ConfigManager";
export declare class FileProcessor {
    private thumbnailGenerator;
    private processingEngine;
    private configManager;
    constructor(configManager: ConfigManager);
    /**
     * Process a single file with security validation
     */
    processFile(file: File | string, options?: ProcessingOptions): Promise<ProcessingResult>;
    /**
     * Generate thumbnail for a file
     */
    generateThumbnail(file: File | string, options: ThumbnailOptions): Promise<ProcessingResult<Blob | string>>;
    /**
     * Extract metadata from a file
     */
    extractMetadata(_file: File | string): Promise<ProcessingResult>;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<any>): void;
    /**
     * Clean up resources
     */
    destroy(): void;
}
