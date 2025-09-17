/**
 * Core file processing logic for the pipeline.
 *
 * Handles the main processing operations including metadata extraction,
 * thumbnail generation, and content analysis.
 */
import { ThumbnailGenerator } from "./thumbnail-generator";
import { SecurityValidator } from "./security/SecurityValidator";
import { FileTypeValidator } from "./utils/FileTypeValidator";
import { FileProcessingEngine } from "./FileProcessingEngine";
export class FileProcessor {
    constructor(configManager) {
        Object.defineProperty(this, "thumbnailGenerator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "processingEngine", {
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
        this.configManager = configManager;
        this.thumbnailGenerator = new ThumbnailGenerator(configManager.getThumbnailConfig());
        const securityValidator = new SecurityValidator({
            maxFileSize: configManager.getMaxFileSize(),
            allowedExtensions: configManager.getSupportedExtensions(),
            blockedExtensions: new Set(),
        });
        const fileTypeValidator = new FileTypeValidator(configManager.getSupportedExtensions());
        this.processingEngine = new FileProcessingEngine(securityValidator, fileTypeValidator, configManager);
    }
    /**
     * Process a single file with security validation
     */
    async processFile(file, options) {
        const result = await this.processingEngine.processFile(file, options);
        // Add thumbnail generation if requested
        if (result.success && options?.generateThumbnails !== false) {
            const thumbnailResult = await this.generateThumbnail(file, {
                size: this.configManager.getConfig().defaultThumbnailSize,
            });
            if (thumbnailResult.success) {
                result.data.thumbnail = thumbnailResult.data;
            }
        }
        return result;
    }
    /**
     * Generate thumbnail for a file
     */
    async generateThumbnail(file, options) {
        return await this.thumbnailGenerator.generateThumbnail(file, options);
    }
    /**
     * Extract metadata from a file
     */
    async extractMetadata(_file) {
        // This would call the metadata extractor
        // For now, return a placeholder result
        return {
            success: true,
            data: { metadata: "extracted" },
            duration: 0,
            timestamp: new Date(),
        };
    }
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.configManager.updateConfig(updates);
        // Update thumbnail generator if thumbnail size changed
        if (updates.defaultThumbnailSize) {
            this.thumbnailGenerator = new ThumbnailGenerator(this.configManager.getThumbnailConfig());
        }
        // Update processing engine with new config
        // The processing engine will handle updating its internal validators
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.thumbnailGenerator.destroy();
    }
}
