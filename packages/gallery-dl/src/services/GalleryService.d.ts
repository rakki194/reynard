/**
 * Gallery Service
 *
 * Main service class for gallery-dl integration with Reynard.
 * Provides comprehensive download management, progress tracking, and error handling.
 */
import { AsyncResult, BatchDownload, BatchDownloadOptions, DownloadOptions, DownloadResult, ExtractorInfo, GalleryDownloadError, GalleryServiceConfig, ProgressState, ServiceHealth, ValidationResult } from "../types";
export declare class GalleryService {
    private httpClient;
    private config;
    private activeDownloads;
    private batchDownloads;
    constructor(config: GalleryServiceConfig);
    /**
     * Download a gallery from a URL
     */
    downloadGallery(url: string, options?: DownloadOptions): Promise<AsyncResult<DownloadResult, GalleryDownloadError>>;
    /**
     * Get available extractors
     */
    getExtractors(): Promise<AsyncResult<ExtractorInfo[], GalleryDownloadError>>;
    /**
     * Validate a URL and detect extractor
     */
    validateUrl(url: string): Promise<ValidationResult>;
    /**
     * Start a batch download
     */
    startBatchDownload(urls: string[], options?: BatchDownloadOptions): Promise<AsyncResult<BatchDownload, GalleryDownloadError>>;
    /**
     * Get batch download status
     */
    getBatchDownload(batchId: string): BatchDownload | undefined;
    /**
     * Cancel a batch download
     */
    cancelBatchDownload(batchId: string): Promise<AsyncResult<void, GalleryDownloadError>>;
    /**
     * Get active download progress
     */
    getDownloadProgress(downloadId: string): ProgressState | undefined;
    /**
     * Get all active downloads
     */
    getActiveDownloads(): Map<string, ProgressState>;
    /**
     * Get service health
     */
    getServiceHealth(): Promise<ServiceHealth>;
    /**
     * Create HTTP client with middleware
     */
    private _createHttpClient;
    /**
     * Perform the actual download
     */
    private _performDownload;
    /**
     * Process batch download
     */
    private _processBatch;
    /**
     * Download a single URL in batch
     */
    private _downloadInBatch;
    /**
     * Update download progress
     */
    private _updateProgress;
    /**
     * Update batch progress
     */
    private _updateBatchProgress;
    /**
     * Generate unique download ID
     */
    private _generateDownloadId;
    /**
     * Generate unique batch ID
     */
    private _generateBatchId;
}
