/**
 * Video Thumbnail Generator for the Reynard File Processing system.
 *
 * This module orchestrates video thumbnail generation using specialized
 * components for loading, rendering, and dimension calculations.
 */
import { ThumbnailOptions, ProcessingResult } from "../types";
export interface VideoThumbnailGeneratorOptions extends ThumbnailOptions {
    /** Whether to enable Web Workers for background processing */
    useWebWorkers?: boolean;
    /** Maximum thumbnail size in bytes */
    maxThumbnailSize?: number;
    /** Whether to enable progressive loading */
    progressive?: boolean;
    /** Custom background color for transparent videos */
    backgroundColor?: string;
    /** Time position to capture thumbnail (in seconds) */
    captureTime?: number;
}
export declare class VideoThumbnailGenerator {
    private options;
    private videoLoader;
    private canvasRenderer;
    constructor(options?: VideoThumbnailGeneratorOptions);
    /**
     * Generate thumbnail for video files
     */
    generateThumbnail(file: File | string, options?: Partial<ThumbnailOptions>): Promise<ProcessingResult<Blob>>;
    /**
     * Clean up resources
     */
    destroy(): void;
}
