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
import type { DownloadOptions, DownloadResult, ExtractorInfo, GalleryServiceConfig, ProgressState, ServiceHealth, ValidationResult } from "./types";
export declare class ReynardGalleryDownloader implements GalleryDownloader {
    private service;
    constructor(config: GalleryServiceConfig);
    download(url: string, options?: DownloadOptions): Promise<DownloadResult>;
    getExtractors(): Promise<ExtractorInfo[]>;
    validateUrl(url: string): Promise<ValidationResult>;
    getProgress(downloadId: string): ProgressState | undefined;
    getHealth(): Promise<ServiceHealth>;
}
/**
 * Create a new GalleryDownloader instance
 */
export declare function createGalleryDownloader(config: GalleryServiceConfig): GalleryDownloader;
/**
 * Create a default GalleryDownloader with standard configuration
 */
export declare function createDefaultGalleryDownloader(): GalleryDownloader;
export type { AsyncResult, BatchDownload, BatchDownloadOptions, BatchStatus, DownloadOptions, DownloadQueue, DownloadResult, DownloadStats, DownloadStatus, DownloadedFile, ExtractorConfigOption, ExtractorInfo, FileMetadata, GalleryServiceConfig, ProgressState, QueuedDownload, RetryConfig, ServiceHealth, ServiceMetrics, ValidationResult, } from "./types";
export { DownloadError, ExtractorError, GalleryDownloadError, ValidationError } from "./types";
export { GalleryService } from "./services/GalleryService";
export * from "./components";
export * from "./composables";
