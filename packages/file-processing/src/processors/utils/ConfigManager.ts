/**
 * Configuration management for file processing pipeline.
 * 
 * Handles configuration updates and validation for the processing pipeline.
 */

import { ProcessingConfig } from "../../types";

export class ConfigManager {
  private config: ProcessingConfig;

  constructor(config?: Partial<ProcessingConfig>) {
    this.config = {
      defaultThumbnailSize: [200, 200],
      defaultPreviewSize: [800, 800],
      supportedExtensions: [],
      maxFileSize: 100 * 1024 * 1024, // 100MB
      timeout: 30000, // 30 seconds
      cache: {
        enabled: true,
        maxSize: 100 * 1024 * 1024, // 100MB
        ttl: 3600000, // 1 hour
      },
      threading: {
        maxWorkers: navigator.hardwareConcurrency || 4,
        thumbnailWorkers: Math.max(1, (navigator.hardwareConcurrency || 4) / 2),
        metadataWorkers: Math.max(1, (navigator.hardwareConcurrency || 4) / 2),
      },
      ...config,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): ProcessingConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ProcessingConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get thumbnail configuration
   */
  getThumbnailConfig() {
    return {
      size: this.config.defaultThumbnailSize,
      format: "webp" as const,
      quality: 85,
      maintainAspectRatio: true,
    };
  }

  /**
   * Get cache configuration
   */
  getCacheConfig() {
    return this.config.cache;
  }

  /**
   * Get threading configuration
   */
  getThreadingConfig() {
    return this.config.threading;
  }

  /**
   * Check if cache is enabled
   */
  isCacheEnabled(): boolean {
    return this.config.cache.enabled;
  }

  /**
   * Get maximum file size
   */
  getMaxFileSize(): number {
    return this.config.maxFileSize;
  }

  /**
   * Get timeout value
   */
  getTimeout(): number {
    return this.config.timeout;
  }

  /**
   * Get supported extensions
   */
  getSupportedExtensions(): Set<string> {
    return new Set(this.config.supportedExtensions);
  }

  /**
   * Validate configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.maxFileSize <= 0) {
      errors.push("maxFileSize must be greater than 0");
    }

    if (this.config.timeout <= 0) {
      errors.push("timeout must be greater than 0");
    }

    if (this.config.defaultThumbnailSize[0] <= 0 || this.config.defaultThumbnailSize[1] <= 0) {
      errors.push("defaultThumbnailSize dimensions must be greater than 0");
    }

    if (this.config.defaultPreviewSize[0] <= 0 || this.config.defaultPreviewSize[1] <= 0) {
      errors.push("defaultPreviewSize dimensions must be greater than 0");
    }

    if (this.config.threading.maxWorkers <= 0) {
      errors.push("maxWorkers must be greater than 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
