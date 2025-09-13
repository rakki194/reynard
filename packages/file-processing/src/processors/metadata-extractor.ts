/**
 * Metadata Extractor for the Reynard File Processing system.
 *
 * This module provides unified metadata extraction for various file types
 * using a factory pattern with specialized extractors.
 */

import {
  ProcessingResult,
  FileMetadata,
} from "../types";
import { getFileTypeInfo } from "../config/file-types";
import {
  MetadataExtractorFactory,
  MetadataExtractionOptions,
} from "./extractors";

export type { MetadataExtractionOptions };

export class MetadataExtractor {
  constructor(private options: MetadataExtractionOptions = {}) {
    this.options = {
      extractExif: true,
      analyzeContent: true,
      detectLanguage: true,
      extractEmbedded: true,
      maxContentLength: 1024 * 1024, // 1MB
      ...options,
    };
  }

  /**
   * Extract metadata from any supported file type
   */
  async extractMetadata(
    file: File | string,
    options?: Partial<MetadataExtractionOptions>,
  ): Promise<ProcessingResult<FileMetadata>> {
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

      const { name } = fileInfo.data!;
      const extension = this.getFileExtension(name);
      const fileTypeInfo = getFileTypeInfo(extension);

      // Check if file type supports metadata extraction
      if (!fileTypeInfo.capabilities.metadata) {
        return {
          success: false,
          error: `File type ${extension} does not support metadata extraction`,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      // Use factory-created extractor for all supported types
      const extractor = MetadataExtractorFactory.createExtractor(
        name,
        mergedOptions,
      );
      const metadata = await extractor.extractMetadata(file, mergedOptions);

      return {
        success: true,
        data: metadata,
        duration: Date.now() - startTime,
        timestamp: new Date(),
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

  private async getFileInfo(
    file: File | string,
  ): Promise<ProcessingResult<{ name: string; size: number; type: string }>> {
    try {
      if (typeof file === "string") {
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

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex !== -1
      ? filename.substring(lastDotIndex).toLowerCase()
      : "";
  }
}
