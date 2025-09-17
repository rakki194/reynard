/**
 * Gallery-dl Integration Types
 *
 * Core type definitions for the Reynard gallery-dl integration package.
 * Provides comprehensive type safety for all gallery download operations.
 */
// ============================================================================
// Error Types
// ============================================================================
export class GalleryDownloadError extends Error {
    constructor(message, code, context) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: code
        });
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: context
        });
        this.name = "GalleryDownloadError";
    }
}
export class ValidationError extends GalleryDownloadError {
    constructor(message, context) {
        super(message, "VALIDATION_ERROR", context);
        this.name = "ValidationError";
    }
}
export class ExtractorError extends GalleryDownloadError {
    constructor(message, context) {
        super(message, "EXTRACTOR_ERROR", context);
        this.name = "ExtractorError";
    }
}
export class DownloadError extends GalleryDownloadError {
    constructor(message, context) {
        super(message, "DOWNLOAD_ERROR", context);
        this.name = "DownloadError";
    }
}
