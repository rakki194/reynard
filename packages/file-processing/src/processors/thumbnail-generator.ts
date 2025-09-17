/**
 * Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides unified thumbnail generation for various file types
 * by orchestrating specialized generators through a factory pattern.
 */

import { ThumbnailOptions, ProcessingResult } from "../types";
import { getFileTypeInfo } from "../config/file-types";
import { ThumbnailGeneratorFactory, ThumbnailGeneratorFactoryOptions } from "./ThumbnailGeneratorFactory";

export interface ThumbnailGeneratorOptions extends ThumbnailOptions {
  /** Whether to enable Web Workers for background processing */
  useWebWorkers?: boolean;
  /** Maximum thumbnail size in bytes */
  maxThumbnailSize?: number;
  /** Whether to enable progressive loading */
  progressive?: boolean;
  /** Custom background color for transparent images */
  backgroundColor?: string;
}

export class ThumbnailGenerator {
  private factory: ThumbnailGeneratorFactory;

  constructor(private options: ThumbnailGeneratorOptions = { size: [200, 200] }) {
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

    this.factory = new ThumbnailGeneratorFactory(this.options as ThumbnailGeneratorFactoryOptions);
  }

  /**
   * Generate a thumbnail for any supported file type
   */
  async generateThumbnail(
    file: File | string,
    options?: Partial<ThumbnailOptions>
  ): Promise<ProcessingResult<Blob | string>> {
    const mergedOptions = { ...this.options, ...options };

    try {
      // Get file information for validation
      const fileInfo = await this.getFileInfo(file);
      if (!fileInfo.success) {
        return {
          success: false,
          error: fileInfo.error,
          duration: 0,
          timestamp: new Date(),
        };
      }

      const { name } = fileInfo.data!;
      const extension = this.getFileExtension(name);
      const fileTypeInfo = getFileTypeInfo(extension);

      // Check if file type supports thumbnails
      if (!fileTypeInfo.capabilities.thumbnail) {
        return {
          success: false,
          error: `File type ${extension} does not support thumbnail generation`,
          duration: 0,
          timestamp: new Date(),
        };
      }

      // Delegate to factory for actual generation
      return await this.factory.generateThumbnail(file, mergedOptions);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        duration: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get file information
   */
  private async getFileInfo(
    file: File | string
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
        error: error instanceof Error ? error.message : "Failed to get file info",
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
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex).toLowerCase() : "";
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Delegate cleanup to factory
    this.factory.destroy();
  }
}
