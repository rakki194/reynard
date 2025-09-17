/**
 * Configuration management for file processing pipeline.
 *
 * Handles configuration updates and validation for the processing pipeline.
 */
import { ProcessingConfig } from "../../types";
export declare class ConfigManager {
    private config;
    constructor(config?: Partial<ProcessingConfig>);
    /**
     * Get current configuration
     */
    getConfig(): ProcessingConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<ProcessingConfig>): void;
    /**
     * Get thumbnail configuration
     */
    getThumbnailConfig(): {
        size: [number, number];
        format: "webp";
        quality: number;
        maintainAspectRatio: boolean;
    };
    /**
     * Get cache configuration
     */
    getCacheConfig(): {
        enabled: boolean;
        maxSize: number;
        ttl: number;
    };
    /**
     * Get threading configuration
     */
    getThreadingConfig(): {
        maxWorkers: number;
        thumbnailWorkers: number;
        metadataWorkers: number;
    };
    /**
     * Check if cache is enabled
     */
    isCacheEnabled(): boolean;
    /**
     * Get maximum file size
     */
    getMaxFileSize(): number;
    /**
     * Get timeout value
     */
    getTimeout(): number;
    /**
     * Get supported extensions
     */
    getSupportedExtensions(): Set<string>;
    /**
     * Validate configuration
     */
    validateConfig(): {
        isValid: boolean;
        errors: string[];
    };
}
