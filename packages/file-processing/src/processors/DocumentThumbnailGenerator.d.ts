/**
 * Document Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides specialized thumbnail generation for document files
 * including PDF, DOCX, TXT, and other document formats.
 */
import { ThumbnailOptions, ProcessingResult } from "../types";
export interface DocumentThumbnailGeneratorOptions extends ThumbnailOptions {
    /** Whether to enable Web Workers for background processing */
    useWebWorkers?: boolean;
    /** Maximum thumbnail size in bytes */
    maxThumbnailSize?: number;
    /** Whether to enable progressive loading */
    progressive?: boolean;
    /** Custom background color for document thumbnails */
    backgroundColor?: string;
    /** Document type for custom styling */
    documentType?: string;
}
export declare class DocumentThumbnailGenerator {
    private options;
    private canvas;
    constructor(options?: DocumentThumbnailGeneratorOptions);
    /**
     * Generate thumbnail for document files
     */
    generateThumbnail(file: File | string, options?: Partial<ThumbnailOptions>): Promise<ProcessingResult<Blob>>;
    /**
     * Get canvas for drawing
     */
    private getCanvas;
    /**
     * Clean up resources
     */
    destroy(): void;
}
