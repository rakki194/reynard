/**
 * Thumbnail Generator Factory for the Reynard File Processing system.
 *
 * This module provides a factory pattern to create appropriate thumbnail generators
 * based on file type, ensuring optimal performance and specialized handling.
 */
import { getFileCategory } from "../config/file-types";
import { getFileInfo, getFileExtension } from "./utils/file-info";
import { GeneratorRegistry, } from "./utils/generator-registry";
export class ThumbnailGeneratorFactory {
    constructor(options = { size: [200, 200] }) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "registry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.options = {
            format: "webp",
            quality: 85,
            maintainAspectRatio: true,
            backgroundColor: "#ffffff",
            enableAnimation: true,
            animationSlowdown: 2.0,
            useWebWorkers: false,
            maxThumbnailSize: 1024 * 1024, // 1MB
            progressive: true,
            ...options,
        };
        this.registry = new GeneratorRegistry();
    }
    /**
     * Generate a thumbnail for any supported file type
     */
    async generateThumbnail(file, options) {
        const startTime = Date.now();
        const mergedOptions = { ...this.options, ...options };
        try {
            // Get file information
            const fileInfo = await getFileInfo(file);
            if (!fileInfo.success) {
                return this.createErrorResult(fileInfo.error, startTime);
            }
            const { name, size } = fileInfo.data;
            const extension = getFileExtension(name);
            const category = getFileCategory(extension);
            // Check file size limit
            if (size > (mergedOptions.maxThumbnailSize || Infinity)) {
                return this.createErrorResult(`File size ${size} exceeds maximum thumbnail size limit`, startTime);
            }
            // Get appropriate generator
            const generator = this.registry.getGenerator(category, mergedOptions);
            if (!generator) {
                return this.createErrorResult(`Unsupported file category: ${category}`, startTime);
            }
            // Generate thumbnail
            const result = await generator.generateThumbnail(file, mergedOptions);
            return {
                ...result,
                duration: Date.now() - startTime,
            };
        }
        catch (error) {
            return this.createErrorResult(error instanceof Error ? error.message : "Unknown error occurred", startTime);
        }
    }
    /**
     * Create error result with consistent format
     */
    createErrorResult(error, startTime) {
        return {
            success: false,
            error,
            duration: Date.now() - startTime,
            timestamp: new Date(),
        };
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.registry.destroy();
    }
}
