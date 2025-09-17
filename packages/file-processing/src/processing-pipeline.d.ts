/**
 * Main Processing Pipeline for the Reynard File Processing system.
 *
 * This module orchestrates all file processing operations including
 * thumbnail generation, metadata extraction, and content analysis.
 */
import { ProcessingPipeline, ProcessingOptions, ProcessingResult, ThumbnailOptions, DirectoryListing, FileTypeInfo, ProcessingProgress, ProcessingConfig } from "./types";
export declare class FileProcessingPipeline implements ProcessingPipeline {
    private orchestrator;
    private configManager;
    constructor(config?: Partial<ProcessingConfig>);
    /**
     * Process a single file with security validation
     */
    processFile(file: File | string, options?: ProcessingOptions): Promise<ProcessingResult>;
    /**
     * Process multiple files
     */
    processFiles(files: (File | string)[], options?: ProcessingOptions): Promise<ProcessingResult[]>;
    /**
     * Generate thumbnail for a file
     */
    generateThumbnail(file: File | string, options: ThumbnailOptions): Promise<ProcessingResult<Blob | string>>;
    /**
     * Extract metadata from a file
     */
    extractMetadata(file: File | string): Promise<ProcessingResult>;
    /**
     * Scan directory contents
     */
    scanDirectory(path: string, options?: ProcessingOptions): Promise<ProcessingResult<DirectoryListing>>;
    /**
     * Get supported file types
     */
    getSupportedTypes(): FileTypeInfo[];
    /**
     * Check if file type is supported
     */
    isSupported(file: File | string): boolean;
    /**
     * Add progress callback
     */
    onProgress(callback: (progress: ProcessingProgress) => void): void;
    /**
     * Remove progress callback
     */
    offProgress(callback: (progress: ProcessingProgress) => void): void;
    /**
     * Get current configuration
     */
    getConfig(): ProcessingConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<ProcessingConfig>): void;
    /**
     * Clean up resources
     */
    destroy(): void;
}
