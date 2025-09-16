/**
 * Reynard Gallery-dl Integration
 *
 * Comprehensive gallery download system with progress tracking, batch processing,
 * and seamless integration with the Reynard ecosystem.
 *
 * @example
 * ```typescript
 * import { GalleryDownloader } from 'reynard-gallery-dl';
 *
 * const downloader = new GalleryDownloader({
 *   name: 'gallery-service',
 *   baseUrl: 'http://localhost:8000',
 *   timeout: 30000
 * });
 *
 * const result = await downloader.download('https://example.com/gallery');
 * if (result.success) {
 *   console.log(`Downloaded ${result.data.files.length} files`);
 * }
 * ```
 */

// ============================================================================
// Core Interfaces
// ============================================================================

export interface GalleryDownloader {
  /** Download a gallery from URL */
  download(url: string, options?: DownloadOptions): Promise<DownloadResult>;
  /** Get available extractors */
  getExtractors(): Promise<ExtractorInfo[]>;
  /** Validate URL and detect extractor */
  validateUrl(url: string): Promise<ValidationResult>;
  /** Get download progress */
  getProgress(downloadId: string): ProgressState | undefined;
  /** Get service health */
  getHealth(): Promise<ServiceHealth>;
}

// ============================================================================
// Main Implementation
// ============================================================================

import { GalleryService } from "./services/GalleryService";
import type {
  DownloadOptions,
  DownloadResult,
  ExtractorInfo,
  GalleryServiceConfig,
  ProgressState,
  ServiceHealth,
  ValidationResult,
} from "./types";

export class ReynardGalleryDownloader implements GalleryDownloader {
  private service: GalleryService;

  constructor(config: GalleryServiceConfig) {
    this.service = new GalleryService(config);
  }

  async download(url: string, options: DownloadOptions = {}): Promise<DownloadResult> {
    const result = await this.service.downloadGallery(url, options);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  async getExtractors(): Promise<ExtractorInfo[]> {
    const result = await this.service.getExtractors();
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  async validateUrl(url: string): Promise<ValidationResult> {
    return await this.service.validateUrl(url);
  }

  getProgress(downloadId: string): ProgressState | undefined {
    return this.service.getDownloadProgress(downloadId);
  }

  async getHealth(): Promise<ServiceHealth> {
    return await this.service.getServiceHealth();
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a new GalleryDownloader instance
 */
export function createGalleryDownloader(config: GalleryServiceConfig): GalleryDownloader {
  return new ReynardGalleryDownloader(config);
}

/**
 * Create a default GalleryDownloader with standard configuration
 */
export function createDefaultGalleryDownloader(): GalleryDownloader {
  return new ReynardGalleryDownloader({
    name: "gallery-service",
    baseUrl: process.env.REYNARD_API_URL || "http://localhost:8000",
    timeout: 30000,
  });
}

// ============================================================================
// Re-exports
// ============================================================================

// Core types
export type {
  AsyncResult,
  BatchDownload,
  BatchDownloadOptions,
  BatchStatus,
  DownloadOptions,
  DownloadQueue,
  DownloadResult,
  DownloadStats,
  DownloadStatus,
  DownloadedFile,
  ExtractorConfigOption,
  ExtractorInfo,
  FileMetadata,
  GalleryServiceConfig,
  ProgressState,
  QueuedDownload,
  RetryConfig,
  ServiceHealth,
  ServiceMetrics,
  ValidationResult,
} from "./types";

// Error types
export { DownloadError, ExtractorError, GalleryDownloadError, ValidationError } from "./types";

// Services
export { GalleryService } from "./services/GalleryService";

// Components
export * from "./components";

// Composables
export * from "./composables";

// Utils (will be added as needed)
// export * from './utils';
