/**
 * Main Processing Pipeline for the Reynard File Processing system.
 *
 * This module orchestrates all file processing operations including
 * thumbnail generation, metadata extraction, and content analysis.
 */

import {
  ProcessingPipeline,
  ProcessingOptions,
  ProcessingResult,
  ThumbnailOptions,
  DirectoryListing,
  FileTypeInfo,
  ProcessingProgress,
  ProcessingConfig,
} from "./types";
import { ThumbnailGenerator } from "./processors/thumbnail-generator";
import {
  getFileTypeInfo,
  isSupportedExtension,
  getAllSupportedExtensions,
} from "./config/file-types";

export class FileProcessingPipeline implements ProcessingPipeline {
  private thumbnailGenerator: ThumbnailGenerator;
  private config: ProcessingConfig;
  private progressCallbacks: ((progress: ProcessingProgress) => void)[] = [];

  constructor(config?: Partial<ProcessingConfig>) {
    this.config = {
      defaultThumbnailSize: [200, 200],
      defaultPreviewSize: [800, 800],
      supportedExtensions: Array.from(getAllSupportedExtensions()),
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

    this.thumbnailGenerator = new ThumbnailGenerator({
      size: this.config.defaultThumbnailSize,
      format: "webp",
      quality: 85,
      maintainAspectRatio: true,
    });
  }

  /**
   * Process a single file
   */
  async processFile(
    file: File | string,
    options?: ProcessingOptions,
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      // Validate file
      if (!this.isSupported(file)) {
        return {
          success: false,
          error: "File type not supported",
          duration: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      // Check file size
      if (options?.maxFileSize && typeof file !== "string") {
        if (file.size > options.maxFileSize) {
          return {
            success: false,
            error: `File size ${file.size} exceeds maximum allowed size ${options.maxFileSize}`,
            duration: Date.now() - startTime,
            timestamp: new Date(),
          };
        }
      }

      // Process file based on options
      const results: Record<string, any> = {};

      if (options?.extractMetadata !== false) {
        // Extract metadata
        // This would call the metadata extractor
        results.metadata = { extracted: true };
      }

      if (options?.generateThumbnails !== false) {
        // Generate thumbnail
        const thumbnailResult = await this.generateThumbnail(file, {
          size: this.config.defaultThumbnailSize,
        });
        if (thumbnailResult.success) {
          results.thumbnail = thumbnailResult.data;
        }
      }

      if (options?.analyzeContent !== false) {
        // Analyze content
        results.content = { analyzed: true };
      }

      return {
        success: true,
        data: results,
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

  /**
   * Process multiple files
   */
  async processFiles(
    files: (File | string)[],
    options?: ProcessingOptions,
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Update progress
      this.updateProgress({
        operation: "Processing files",
        progress: (i / totalFiles) * 100,
        currentFile: typeof file === "string" ? file : file.name,
        totalFiles,
        processedFiles: i,
        status: `Processing ${i + 1} of ${totalFiles} files`,
      });

      try {
        const result = await this.processFile(file, options);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
          duration: 0,
          timestamp: new Date(),
        });
      }
    }

    // Final progress update
    this.updateProgress({
      operation: "Processing files",
      progress: 100,
      currentFile: undefined,
      totalFiles,
      processedFiles: totalFiles,
      status: "Processing complete",
    });

    return results;
  }

  /**
   * Generate thumbnail for a file
   */
  async generateThumbnail(
    file: File | string,
    options: ThumbnailOptions,
  ): Promise<ProcessingResult<Blob | string>> {
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
   * Scan directory contents
   */
  async scanDirectory(
    path: string,
    _options?: ProcessingOptions,
  ): Promise<ProcessingResult<DirectoryListing>> {
    try {
      // This would implement actual directory scanning
      // For now, return a placeholder result
      const listing: DirectoryListing = {
        path,
        mtime: new Date(),
        directories: [],
        files: [],
        totalCount: 0,
      };

      return {
        success: true,
        data: listing,
        duration: 0,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to scan directory",
        duration: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get supported file types
   */
  getSupportedTypes(): FileTypeInfo[] {
    return Array.from(getAllSupportedExtensions()).map((ext) =>
      getFileTypeInfo(ext),
    );
  }

  /**
   * Check if file type is supported
   */
  isSupported(file: File | string): boolean {
    if (typeof file === "string") {
      // URL case - extract extension from path
      const extension = this.getFileExtension(file);
      return isSupportedExtension(extension);
    } else {
      // File object case
      const extension = this.getFileExtension(file.name);
      return isSupportedExtension(extension);
    }
  }

  /**
   * Add progress callback
   */
  onProgress(callback: (progress: ProcessingProgress) => void): void {
    this.progressCallbacks.push(callback);
  }

  /**
   * Remove progress callback
   */
  offProgress(callback: (processing: ProcessingProgress) => void): void {
    const index = this.progressCallbacks.indexOf(callback);
    if (index > -1) {
      this.progressCallbacks.splice(index, 1);
    }
  }

  /**
   * Update progress and notify callbacks
   */
  private updateProgress(progress: ProcessingProgress): void {
    this.progressCallbacks.forEach((callback) => {
      try {
        callback(progress);
      } catch (error) {
        console.warn("Progress callback error:", error);
      }
    });
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

    // Update thumbnail generator if thumbnail size changed
    if (updates.defaultThumbnailSize) {
      this.thumbnailGenerator = new ThumbnailGenerator({
        size: updates.defaultThumbnailSize,
        format: "webp",
        quality: 85,
        maintainAspectRatio: true,
      });
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.thumbnailGenerator.destroy();
    this.progressCallbacks = [];
  }
}
