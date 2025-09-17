/**
 * Gallery Service
 *
 * Main service class for gallery-dl integration with Reynard.
 * Provides comprehensive download management, progress tracking, and error handling.
 */
import { HTTPClient, createAuthMiddleware, createLoggingMiddleware } from "reynard-connection";
import { DownloadError, GalleryDownloadError, ValidationError, } from "../types";
export class GalleryService {
    constructor(config) {
        Object.defineProperty(this, "httpClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "activeDownloads", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "batchDownloads", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.config = config;
        this.httpClient = this._createHttpClient();
    }
    /**
     * Download a gallery from a URL
     */
    async downloadGallery(url, options = {}) {
        try {
            // Validate URL first
            const validation = await this.validateUrl(url);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: new ValidationError(`Invalid URL: ${validation.error}`, { url, validation }),
                };
            }
            // Create download ID
            const downloadId = this._generateDownloadId();
            // Initialize progress tracking
            const progressState = {
                percentage: 0,
                status: "pending",
                message: "Starting download...",
            };
            this.activeDownloads.set(downloadId, progressState);
            // Start download
            const result = await this._performDownload(downloadId, url, options);
            // Clean up progress tracking
            this.activeDownloads.delete(downloadId);
            return { success: true, data: result };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof GalleryDownloadError
                    ? error
                    : new DownloadError(`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`, {
                        url,
                        options,
                    }),
            };
        }
    }
    /**
     * Get available extractors
     */
    async getExtractors() {
        try {
            const response = await this.httpClient.get("/api/gallery/extractors");
            return { success: true, data: response.data };
        }
        catch (error) {
            return {
                success: false,
                error: new GalleryDownloadError(`Failed to get extractors: ${error instanceof Error ? error.message : "Unknown error"}`, "EXTRACTOR_LIST_ERROR"),
            };
        }
    }
    /**
     * Validate a URL and detect extractor
     */
    async validateUrl(url) {
        try {
            const response = await this.httpClient.post("/api/gallery/validate", { url });
            return response.data;
        }
        catch (error) {
            return {
                isValid: false,
                error: `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    /**
     * Start a batch download
     */
    async startBatchDownload(urls, options = {}) {
        try {
            const batchId = this._generateBatchId();
            const batch = {
                id: batchId,
                name: options.filename || `Batch ${batchId}`,
                urls,
                options,
                status: "pending",
                progress: {
                    total: urls.length,
                    completed: 0,
                    failed: 0,
                    active: 0,
                    percentage: 0,
                },
                createdAt: new Date(),
            };
            this.batchDownloads.set(batchId, batch);
            // Start batch processing
            this._processBatch(batchId);
            return { success: true, data: batch };
        }
        catch (error) {
            return {
                success: false,
                error: new GalleryDownloadError(`Batch download failed: ${error instanceof Error ? error.message : "Unknown error"}`, "BATCH_DOWNLOAD_ERROR", { urls, options }),
            };
        }
    }
    /**
     * Get batch download status
     */
    getBatchDownload(batchId) {
        return this.batchDownloads.get(batchId);
    }
    /**
     * Cancel a batch download
     */
    async cancelBatchDownload(batchId) {
        try {
            const batch = this.batchDownloads.get(batchId);
            if (!batch) {
                return {
                    success: false,
                    error: new GalleryDownloadError(`Batch download not found: ${batchId}`, "BATCH_NOT_FOUND"),
                };
            }
            batch.status = "cancelled";
            batch.completedAt = new Date();
            return { success: true, data: undefined };
        }
        catch (error) {
            return {
                success: false,
                error: new GalleryDownloadError(`Failed to cancel batch: ${error instanceof Error ? error.message : "Unknown error"}`, "BATCH_CANCEL_ERROR"),
            };
        }
    }
    /**
     * Get active download progress
     */
    getDownloadProgress(downloadId) {
        return this.activeDownloads.get(downloadId);
    }
    /**
     * Get all active downloads
     */
    getActiveDownloads() {
        return new Map(this.activeDownloads);
    }
    /**
     * Get service health
     */
    async getServiceHealth() {
        try {
            const startTime = Date.now();
            const response = await this.httpClient.get("/api/gallery/health");
            const duration = Date.now() - startTime;
            return {
                status: "healthy",
                lastCheck: new Date(),
                checkDuration: duration,
                metrics: response.data,
            };
        }
        catch (error) {
            return {
                status: "unhealthy",
                lastCheck: new Date(),
                checkDuration: 0,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    /**
     * Create HTTP client with middleware
     */
    _createHttpClient() {
        const client = new HTTPClient({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout || 30000,
        });
        // Add authentication middleware if token provided
        if (this.config.token) {
            client.use(createAuthMiddleware({
                token: this.config.token,
                headerName: "Authorization",
                headerValue: `Bearer ${this.config.token}`,
            }));
        }
        // Add logging middleware
        client.use(createLoggingMiddleware({
            logRequests: true,
            logResponses: true,
            logErrors: true,
        }));
        return client;
    }
    /**
     * Perform the actual download
     */
    async _performDownload(downloadId, url, options) {
        const startTime = Date.now();
        try {
            // Update progress
            this._updateProgress(downloadId, {
                percentage: 10,
                status: "validating",
                message: "Validating URL...",
            });
            // Start download
            const response = await this.httpClient.post("/api/gallery/download", {
                url,
                options,
            });
            // Update progress
            this._updateProgress(downloadId, {
                percentage: 100,
                status: "completed",
                message: "Download completed successfully",
            });
            const duration = Date.now() - startTime;
            return {
                success: true,
                files: response.data.files || [],
                stats: response.data.stats || {
                    totalFiles: 0,
                    totalBytes: 0,
                    averageSpeed: 0,
                    successRate: 100,
                    failedDownloads: 0,
                    skippedFiles: 0,
                },
                duration,
                extractor: response.data.extractor,
            };
        }
        catch (error) {
            this._updateProgress(downloadId, {
                percentage: 0,
                status: "error",
                message: `Download failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
            throw new DownloadError(`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`, {
                url,
                options,
                downloadId,
            });
        }
    }
    /**
     * Process batch download
     */
    async _processBatch(batchId) {
        const batch = this.batchDownloads.get(batchId);
        if (!batch)
            return;
        batch.status = "running";
        batch.startedAt = new Date();
        const maxConcurrent = batch.options.maxConcurrent || 3;
        const urls = [...batch.urls];
        const activeDownloads = [];
        while (urls.length > 0 || activeDownloads.length > 0) {
            // Start new downloads up to max concurrent
            while (activeDownloads.length < maxConcurrent && urls.length > 0) {
                const url = urls.shift();
                const downloadPromise = this._downloadInBatch(batchId, url, batch.options);
                activeDownloads.push(downloadPromise);
            }
            // Wait for at least one download to complete
            if (activeDownloads.length > 0) {
                await Promise.race(activeDownloads);
                // Remove completed downloads
                for (let i = activeDownloads.length - 1; i >= 0; i--) {
                    try {
                        await activeDownloads[i];
                        activeDownloads.splice(i, 1);
                    }
                    catch (error) {
                        activeDownloads.splice(i, 1);
                    }
                }
            }
        }
        batch.status = "completed";
        batch.completedAt = new Date();
    }
    /**
     * Download a single URL in batch
     */
    async _downloadInBatch(batchId, url, options) {
        const batch = this.batchDownloads.get(batchId);
        if (!batch)
            return;
        try {
            batch.progress.active++;
            this._updateBatchProgress(batchId);
            const result = await this.downloadGallery(url, options);
            if (result.success) {
                batch.progress.completed++;
            }
            else {
                batch.progress.failed++;
            }
        }
        catch (error) {
            batch.progress.failed++;
        }
        finally {
            batch.progress.active--;
            this._updateBatchProgress(batchId);
        }
    }
    /**
     * Update download progress
     */
    _updateProgress(downloadId, progress) {
        const current = this.activeDownloads.get(downloadId);
        if (current) {
            this.activeDownloads.set(downloadId, { ...current, ...progress });
        }
    }
    /**
     * Update batch progress
     */
    _updateBatchProgress(batchId) {
        const batch = this.batchDownloads.get(batchId);
        if (batch) {
            batch.progress.percentage = (batch.progress.completed / batch.progress.total) * 100;
        }
    }
    /**
     * Generate unique download ID
     */
    _generateDownloadId() {
        return `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Generate unique batch ID
     */
    _generateBatchId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
