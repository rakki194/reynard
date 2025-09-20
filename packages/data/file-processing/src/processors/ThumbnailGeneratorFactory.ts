/**
 * Thumbnail Generator Factory for the Reynard File Processing system.
 *
 * This module provides a factory pattern to create appropriate thumbnail generators
 * based on file type, ensuring optimal performance and specialized handling.
 */

import { ThumbnailOptions, ProcessingResult } from "../types";
import { getFileCategory } from "../config/file-types";
import { getFileInfo, getFileExtension } from "./utils/file-info";
import { GeneratorRegistry, GeneratorRegistryOptions } from "./utils/generator-registry";

export type ThumbnailGeneratorFactoryOptions = GeneratorRegistryOptions;

export class ThumbnailGeneratorFactory {
  private registry: GeneratorRegistry;

  constructor(private options: ThumbnailGeneratorFactoryOptions = { size: [200, 200] }) {
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
  async generateThumbnail(
    file: File | string,
    options?: Partial<ThumbnailOptions>
  ): Promise<ProcessingResult<Blob | string>> {
    const startTime = Date.now();
    const mergedOptions = { ...this.options, ...options };

    try {
      // Get file information
      const fileInfo = await getFileInfo(file);
      if (!fileInfo.success) {
        return this.createErrorResult(fileInfo.error!, startTime);
      }

      const { name, size } = fileInfo.data!;
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
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error.message : "Unknown error occurred", startTime);
    }
  }

  /**
   * Create error result with consistent format
   */
  private createErrorResult(error: string, startTime: number): ProcessingResult<Blob | string> {
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
  destroy(): void {
    this.registry.destroy();
  }
}
