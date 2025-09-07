/**
 * Thumbnail Generator Factory for the Reynard File Processing system.
 *
 * This module provides a factory pattern to create appropriate thumbnail generators
 * based on file type, ensuring optimal performance and specialized handling.
 */

import { ThumbnailOptions, ProcessingResult } from "../types";
import { getFileCategory } from "../config/file-types";
import { ImageThumbnailGenerator } from "./ImageThumbnailGenerator";
import { VideoThumbnailGenerator } from "./VideoThumbnailGenerator";
import { AudioThumbnailGenerator } from "./AudioThumbnailGenerator";
import { DocumentThumbnailGenerator } from "./DocumentThumbnailGenerator";

export interface ThumbnailGeneratorFactoryOptions extends ThumbnailOptions {
  /** Whether to enable Web Workers for background processing */
  useWebWorkers?: boolean;
  /** Maximum thumbnail size in bytes */
  maxThumbnailSize?: number;
  /** Whether to enable progressive loading */
  progressive?: boolean;
  /** Custom background color for transparent images */
  backgroundColor?: string;
}

export class ThumbnailGeneratorFactory {
  private generators = new Map<string, any>();

  constructor(
    private options: ThumbnailGeneratorFactoryOptions = { size: [200, 200] },
  ) {
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
  }

  /**
   * Generate a thumbnail for any supported file type
   */
  async generateThumbnail(
    file: File | string,
    options?: Partial<ThumbnailOptions>,
  ): Promise<ProcessingResult<Blob | string>> {
    const startTime = Date.now();
    const mergedOptions = { ...this.options, ...options };

    try {
      // Get file information
      const fileInfo = await this.getFileInfo(file);
      if (!fileInfo.success) {
        return {
          success: false,
          error: fileInfo.error,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      const { name, size } = fileInfo.data!;
      const extension = this.getFileExtension(name);
      const category = getFileCategory(extension);

      // Check file size limit
      if (size > (mergedOptions.maxThumbnailSize || Infinity)) {
        return {
          success: false,
          error: `File size ${size} exceeds maximum thumbnail size limit`,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      // Get appropriate generator
      const generator = this.getGenerator(category, mergedOptions);
      if (!generator) {
        return {
          success: false,
          error: `Unsupported file category: ${category}`,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      // Generate thumbnail
      const result = await generator.generateThumbnail(file, mergedOptions);

      return {
        ...result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get appropriate generator for file category
   */
  private getGenerator(category: string, options: ThumbnailGeneratorFactoryOptions): any {
    const cacheKey = `${category}-${JSON.stringify(options)}`;
    
    if (this.generators.has(cacheKey)) {
      return this.generators.get(cacheKey);
    }

    let generator: any;

    switch (category) {
      case "image":
        generator = new ImageThumbnailGenerator(options);
        break;
      case "video":
        generator = new VideoThumbnailGenerator(options);
        break;
      case "audio":
        generator = new AudioThumbnailGenerator(options);
        break;
      case "text":
      case "code":
      case "document":
        generator = new DocumentThumbnailGenerator(options);
        break;
      default:
        return null;
    }

    this.generators.set(cacheKey, generator);
    return generator;
  }

  /**
   * Get file information
   */
  private async getFileInfo(
    file: File | string,
  ): Promise<ProcessingResult<{ name: string; size: number; type: string }>> {
    try {
      if (typeof file === "string") {
        // URL case - we can't get size without fetching
        return {
          success: true,
          data: {
            name: file.split("/").pop() || "unknown",
            size: 0,
            type: "unknown",
          },
          duration: 0,
          timestamp: new Date(),
        };
      } else {
        return {
          success: true,
          data: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
          duration: 0,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get file info",
        duration: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex !== -1
      ? filename.substring(lastDotIndex).toLowerCase()
      : "";
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clean up all generators
    this.generators.forEach((generator) => {
      if (generator && typeof generator.destroy === "function") {
        generator.destroy();
      }
    });
    this.generators.clear();
  }
}
