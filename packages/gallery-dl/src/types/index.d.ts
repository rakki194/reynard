/**
 * Gallery-dl Integration Types
 *
 * Core type definitions for the Reynard gallery-dl integration package.
 * Provides comprehensive type safety for all gallery download operations.
 */
export interface DownloadOptions {
    /** Output directory for downloaded files */
    outputDirectory?: string;
    /** Custom filename pattern */
    filename?: string;
    /** Post-processors to apply */
    postprocessors?: string[];
    /** Extractor-specific options */
    extractorOptions?: Record<string, any>;
    /** Maximum concurrent downloads */
    maxConcurrent?: number;
    /** Retry configuration */
    retryConfig?: RetryConfig;
    /** Progress callback */
    onProgress?: ProgressCallback;
}
export interface RetryConfig {
    /** Maximum number of retries */
    maxRetries: number;
    /** Base delay between retries (ms) */
    baseDelay: number;
    /** Maximum delay between retries (ms) */
    maxDelay: number;
    /** Exponential backoff multiplier */
    backoffMultiplier: number;
}
export interface DownloadResult {
    /** Download success status */
    success: boolean;
    /** Downloaded files */
    files: DownloadedFile[];
    /** Download statistics */
    stats: DownloadStats;
    /** Error information if failed */
    error?: string;
    /** Download duration */
    duration: number;
    /** Extractor information */
    extractor: ExtractorInfo;
}
export interface DownloadedFile {
    /** File path */
    path: string;
    /** Original URL */
    url: string;
    /** File size in bytes */
    size: number;
    /** File extension */
    extension: string;
    /** Download timestamp */
    timestamp: Date;
    /** File metadata */
    metadata?: FileMetadata;
}
export interface FileMetadata {
    /** File title */
    title?: string;
    /** File description */
    description?: string;
    /** File tags */
    tags?: string[];
    /** Author information */
    author?: string;
    /** Creation date */
    date?: Date;
    /** File dimensions (for images/videos) */
    dimensions?: {
        width: number;
        height: number;
    };
}
export interface DownloadStats {
    /** Total files downloaded */
    totalFiles: number;
    /** Total bytes downloaded */
    totalBytes: number;
    /** Download speed (bytes/second) */
    averageSpeed: number;
    /** Success rate */
    successRate: number;
    /** Failed downloads */
    failedDownloads: number;
    /** Skipped files */
    skippedFiles: number;
}
export interface ExtractorInfo {
    /** Extractor name */
    name: string;
    /** Extractor category */
    category: string;
    /** Extractor subcategory */
    subcategory?: string;
    /** Supported URL patterns */
    patterns: string[];
    /** Extractor description */
    description?: string;
    /** Configuration options */
    configOptions?: ExtractorConfigOption[];
    /** Whether extractor is available */
    available: boolean;
}
export interface ExtractorConfigOption {
    /** Option name */
    name: string;
    /** Option type */
    type: "string" | "number" | "boolean" | "array" | "object";
    /** Default value */
    default?: any;
    /** Option description */
    description?: string;
    /** Whether option is required */
    required?: boolean;
    /** Valid values (for enum-like options) */
    values?: any[];
}
export interface ValidationResult {
    /** Whether URL is valid */
    isValid: boolean;
    /** Detected extractor */
    extractor?: ExtractorInfo;
    /** Validation error message */
    error?: string;
    /** URL pattern match */
    pattern?: string;
}
export interface ProgressState {
    /** Current progress percentage (0-100) */
    percentage: number;
    /** Current status */
    status: DownloadStatus;
    /** Current file being processed */
    currentFile?: string;
    /** Estimated time remaining (seconds) */
    estimatedTime?: number;
    /** Download speed (bytes/second) */
    speed?: number;
    /** Total bytes downloaded */
    bytesDownloaded?: number;
    /** Total bytes to download */
    totalBytes?: number;
    /** Progress message */
    message?: string;
}
export type DownloadStatus = "pending" | "validating" | "extracting" | "downloading" | "processing" | "completed" | "error" | "cancelled";
export type ProgressCallback = (progress: ProgressState) => void;
export interface BatchDownload {
    /** Unique batch ID */
    id: string;
    /** Batch name */
    name: string;
    /** URLs to download */
    urls: string[];
    /** Batch options */
    options: DownloadOptions;
    /** Batch status */
    status: BatchStatus;
    /** Batch progress */
    progress: BatchProgress;
    /** Created timestamp */
    createdAt: Date;
    /** Started timestamp */
    startedAt?: Date;
    /** Completed timestamp */
    completedAt?: Date;
}
export type BatchStatus = "pending" | "running" | "paused" | "completed" | "error" | "cancelled";
export interface BatchProgress {
    /** Total downloads in batch */
    total: number;
    /** Completed downloads */
    completed: number;
    /** Failed downloads */
    failed: number;
    /** Currently downloading */
    active: number;
    /** Overall progress percentage */
    percentage: number;
}
export interface BatchDownloadOptions extends DownloadOptions {
    /** Maximum concurrent downloads in batch */
    maxConcurrent?: number;
    /** Delay between downloads (ms) */
    delayBetweenDownloads?: number;
    /** Stop on first error */
    stopOnError?: boolean;
    /** Retry failed downloads */
    retryFailed?: boolean;
}
export interface GalleryServiceConfig {
    /** Service name */
    name: string;
    /** Base URL for API */
    baseUrl: string;
    /** API timeout (ms) */
    timeout?: number;
    /** Authentication token */
    token?: string;
    /** Retry configuration */
    retryConfig?: RetryConfig;
}
export interface ServiceHealth {
    /** Service status */
    status: "healthy" | "degraded" | "unhealthy";
    /** Last health check */
    lastCheck: Date;
    /** Health check duration */
    checkDuration: number;
    /** Error message if unhealthy */
    error?: string;
    /** Service metrics */
    metrics?: ServiceMetrics;
}
export interface ServiceMetrics {
    /** Total requests */
    totalRequests: number;
    /** Successful requests */
    successfulRequests: number;
    /** Failed requests */
    failedRequests: number;
    /** Average response time */
    averageResponseTime: number;
    /** Active downloads */
    activeDownloads: number;
    /** Queue size */
    queueSize: number;
}
export declare class GalleryDownloadError extends Error {
    code: string;
    context?: Record<string, any> | undefined;
    constructor(message: string, code: string, context?: Record<string, any> | undefined);
}
export declare class ValidationError extends GalleryDownloadError {
    constructor(message: string, context?: Record<string, any>);
}
export declare class ExtractorError extends GalleryDownloadError {
    constructor(message: string, context?: Record<string, any>);
}
export declare class DownloadError extends GalleryDownloadError {
    constructor(message: string, context?: Record<string, any>);
}
export type AsyncResult<T, E = Error> = Promise<{
    success: true;
    data: T;
} | {
    success: false;
    error: E;
}>;
export interface DownloadQueue {
    /** Queue ID */
    id: string;
    /** Queued downloads */
    downloads: QueuedDownload[];
    /** Queue status */
    status: "active" | "paused" | "stopped";
    /** Maximum concurrent downloads */
    maxConcurrent: number;
    /** Created timestamp */
    createdAt: Date;
}
export interface QueuedDownload {
    /** Download ID */
    id: string;
    /** URL to download */
    url: string;
    /** Download options */
    options: DownloadOptions;
    /** Queue position */
    position: number;
    /** Status */
    status: "queued" | "downloading" | "completed" | "failed" | "cancelled";
    /** Progress */
    progress: ProgressState;
    /** Created timestamp */
    createdAt: Date;
    /** Started timestamp */
    startedAt?: Date;
    /** Completed timestamp */
    completedAt?: Date;
}
