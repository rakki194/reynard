/**
 * Base metadata extractor interface
 *
 * Provides common functionality for all metadata extractors
 */

import { FileMetadata } from "../../types";

export interface MetadataExtractionOptions {
  /** Whether to extract EXIF data from images */
  extractExif?: boolean;
  /** Whether to perform content analysis */
  analyzeContent?: boolean;
  /** Whether to detect language for text files */
  detectLanguage?: boolean;
  /** Whether to extract embedded metadata */
  extractEmbedded?: boolean;
  /** Maximum content length to analyze */
  maxContentLength?: number;
}

export abstract class BaseMetadataExtractor {
  protected options: MetadataExtractionOptions;

  constructor(options: MetadataExtractionOptions = {}) {
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
   * Extract metadata from a file
   */
  abstract extractMetadata(
    file: File | string,
    options?: Partial<MetadataExtractionOptions>,
  ): Promise<FileMetadata>;

  /**
   * Get basic file information
   */
  protected async getBasicFileInfo(file: File | string): Promise<FileMetadata> {
    const fileInfo = await this.getFileInfo(file);
    if (!fileInfo.success) {
      throw new Error(fileInfo.error);
    }

    const { name, size, type } = fileInfo.data!;
    const extension = this.getFileExtension(name);
    const fullPath = typeof file === "string" ? file : file.name;
    const path = fullPath.split("/").slice(0, -1).join("/") || ".";

    return {
      name,
      size,
      mime: type,
      mtime: new Date(),
      path,
      fullPath,
      extension,
      isHidden: name.startsWith("."),
      isDirectory: false,
    };
  }

  /**
   * Get file information
   */
  protected async getFileInfo(file: File | string): Promise<{
    success: boolean;
    data?: { name: string; size: number; type: string };
    error?: string;
  }> {
    try {
      if (typeof file === "string") {
        return {
          success: true,
          data: {
            name: file.split("/").pop() || "unknown",
            size: 0,
            type: "unknown",
          },
        };
      } else {
        return {
          success: true,
          data: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get file info",
      };
    }
  }

  /**
   * Get file extension from filename
   */
  protected getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex !== -1
      ? filename.substring(lastDotIndex).toLowerCase()
      : "";
  }

  /**
   * Load text content from file
   */
  protected async loadText(file: File | string): Promise<string> {
    if (typeof file === "string") {
      const response = await fetch(file);
      return await response.text();
    } else {
      return await file.text();
    }
  }
}
