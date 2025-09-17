/**
 * Pipeline orchestrator for coordinating file processing operations.
 *
 * Handles the coordination between different processing modules.
 */
import { FileProcessor } from "./FileProcessor";
import { ProgressManager } from "./utils/ProgressManager";
import { FileTypeValidator } from "./utils/FileTypeValidator";
import { DirectoryScanner } from "./DirectoryScanner";
export class PipelineOrchestrator {
    constructor(configManager) {
        Object.defineProperty(this, "fileProcessor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "progressManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "configManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fileTypeValidator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "directoryScanner", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.configManager = configManager;
        this.progressManager = new ProgressManager();
        this.fileTypeValidator = new FileTypeValidator(configManager.getSupportedExtensions());
        this.directoryScanner = new DirectoryScanner();
        this.fileProcessor = new FileProcessor(configManager);
    }
    /**
     * Process multiple files with progress tracking
     */
    async processFiles(files, options) {
        const results = [];
        const totalFiles = files.length;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            this.progressManager.updateProgress(this.progressManager.createFileProgress("Processing files", i, totalFiles, typeof file === "string" ? file : file.name));
            try {
                const result = await this.fileProcessor.processFile(file, options);
                results.push(result);
            }
            catch (error) {
                results.push({
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error occurred",
                    duration: 0,
                    timestamp: new Date(),
                });
            }
        }
        this.progressManager.updateProgress(this.progressManager.createCompletionProgress("Processing files", totalFiles));
        return results;
    }
    /**
     * Get supported file types
     */
    getSupportedTypes() {
        return Array.from(this.fileTypeValidator.getAllSupportedExtensions()).map((ext) => this.fileTypeValidator.getFileTypeInfo(ext));
    }
    /**
     * Check if file type is supported
     */
    isSupported(file) {
        return this.fileTypeValidator.isSupported(file);
    }
    /**
     * Get progress manager
     */
    getProgressManager() {
        return this.progressManager;
    }
    /**
     * Get file processor
     */
    getFileProcessor() {
        return this.fileProcessor;
    }
    /**
     * Get directory scanner
     */
    getDirectoryScanner() {
        return this.directoryScanner;
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.configManager.updateConfig(updates);
        this.fileProcessor.updateConfig(updates);
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.fileProcessor.destroy();
        this.progressManager.clearCallbacks();
    }
}
