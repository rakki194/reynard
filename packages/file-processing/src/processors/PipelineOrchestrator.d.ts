/**
 * Pipeline orchestrator for coordinating file processing operations.
 *
 * Handles the coordination between different processing modules.
 */
import { ProcessingOptions, ProcessingResult, FileTypeInfo, ProcessingConfig } from "../types";
import { FileProcessor } from "./FileProcessor";
import { ProgressManager } from "./utils/ProgressManager";
import { ConfigManager } from "./utils/ConfigManager";
import { DirectoryScanner } from "./DirectoryScanner";
export declare class PipelineOrchestrator {
    private fileProcessor;
    private progressManager;
    private configManager;
    private fileTypeValidator;
    private directoryScanner;
    constructor(configManager: ConfigManager);
    /**
     * Process multiple files with progress tracking
     */
    processFiles(files: (File | string)[], options?: ProcessingOptions): Promise<ProcessingResult[]>;
    /**
     * Get supported file types
     */
    getSupportedTypes(): FileTypeInfo[];
    /**
     * Check if file type is supported
     */
    isSupported(file: File | string): boolean;
    /**
     * Get progress manager
     */
    getProgressManager(): ProgressManager;
    /**
     * Get file processor
     */
    getFileProcessor(): FileProcessor;
    /**
     * Get directory scanner
     */
    getDirectoryScanner(): DirectoryScanner;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<ProcessingConfig>): void;
    /**
     * Clean up resources
     */
    destroy(): void;
}
