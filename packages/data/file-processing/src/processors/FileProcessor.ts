/**
 * Core file processing logic for the pipeline.
 *
 * Handles the main processing operations including metadata extraction,
 * thumbnail generation, and content analysis.
 */

import { ProcessingOptions, ProcessingResult, ThumbnailOptions } from "../types";
import { ThumbnailGenerator } from "./thumbnail-generator";
import { SecurityValidator } from "./security/SecurityValidator";
import { FileTypeValidator } from "./utils/FileTypeValidator";
import { ConfigManager } from "./utils/ConfigManager";
import { FileProcessingEngine } from "./FileProcessingEngine";

export class FileProcessor {
  private thumbnailGenerator: ThumbnailGenerator;
  private processingEngine: FileProcessingEngine;
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
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
  async processFile(file: File | string, options?: ProcessingOptions): Promise<ProcessingResult> {
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
  async generateThumbnail(file: File | string, options: ThumbnailOptions): Promise<ProcessingResult<Blob | string>> {
    return await this.thumbnailGenerator.generateThumbnail(file, options);
  }

  /**
   * Extract metadata from a file
   */
  async extractMetadata(_file: File | string): Promise<ProcessingResult> {
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
  updateConfig(updates: Partial<any>): void {
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
  destroy(): void {
    this.thumbnailGenerator.destroy();
  }
}
