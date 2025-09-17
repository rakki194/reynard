/**
 * Main Processing Pipeline for the Reynard File Processing system.
 *
 * This module orchestrates all file processing operations including
 * thumbnail generation, metadata extraction, and content analysis.
 */
import { PipelineOrchestrator } from "./processors/PipelineOrchestrator";
import { ConfigManager } from "./processors/utils/ConfigManager";
import { getAllSupportedExtensions } from "./config/file-types";
export class FileProcessingPipeline {
    constructor(config) {
        Object.defineProperty(this, "orchestrator", {
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
        this.configManager = new ConfigManager({
            ...config,
            supportedExtensions: Array.from(getAllSupportedExtensions()),
        });
        this.orchestrator = new PipelineOrchestrator(this.configManager);
    }
    /**
     * Process a single file with security validation
     */
    async processFile(file, options) {
        return await this.orchestrator
            .getFileProcessor()
            .processFile(file, options);
    }
    /**
     * Process multiple files
     */
    async processFiles(files, options) {
        return await this.orchestrator.processFiles(files, options);
    }
    /**
     * Generate thumbnail for a file
     */
    async generateThumbnail(file, options) {
        return await this.orchestrator
            .getFileProcessor()
            .generateThumbnail(file, options);
    }
    /**
     * Extract metadata from a file
     */
    async extractMetadata(file) {
        return await this.orchestrator.getFileProcessor().extractMetadata(file);
    }
    /**
     * Scan directory contents
     */
    async scanDirectory(path, options) {
        return await this.orchestrator
            .getDirectoryScanner()
            .scanDirectory(path, options);
    }
    /**
     * Get supported file types
     */
    getSupportedTypes() {
        return this.orchestrator.getSupportedTypes();
    }
    /**
     * Check if file type is supported
     */
    isSupported(file) {
        return this.orchestrator.isSupported(file);
    }
    /**
     * Add progress callback
     */
    onProgress(callback) {
        this.orchestrator.getProgressManager().onProgress(callback);
    }
    /**
     * Remove progress callback
     */
    offProgress(callback) {
        this.orchestrator.getProgressManager().offProgress(callback);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return this.configManager.getConfig();
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.orchestrator.updateConfig(updates);
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.orchestrator.destroy();
    }
}
