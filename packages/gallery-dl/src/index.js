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
// Main Implementation
// ============================================================================
import { GalleryService } from "./services/GalleryService";
export class ReynardGalleryDownloader {
    constructor(config) {
        Object.defineProperty(this, "service", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.service = new GalleryService(config);
    }
    async download(url, options = {}) {
        const result = await this.service.downloadGallery(url, options);
        if (!result.success) {
            throw result.error;
        }
        return result.data;
    }
    async getExtractors() {
        const result = await this.service.getExtractors();
        if (!result.success) {
            throw result.error;
        }
        return result.data;
    }
    async validateUrl(url) {
        return await this.service.validateUrl(url);
    }
    getProgress(downloadId) {
        return this.service.getDownloadProgress(downloadId);
    }
    async getHealth() {
        return await this.service.getServiceHealth();
    }
}
// ============================================================================
// Factory Functions
// ============================================================================
/**
 * Create a new GalleryDownloader instance
 */
export function createGalleryDownloader(config) {
    return new ReynardGalleryDownloader(config);
}
/**
 * Create a default GalleryDownloader with standard configuration
 */
export function createDefaultGalleryDownloader() {
    return new ReynardGalleryDownloader({
        name: "gallery-service",
        baseUrl: process.env.REYNARD_API_URL || "http://localhost:8000",
        timeout: 30000,
    });
}
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
