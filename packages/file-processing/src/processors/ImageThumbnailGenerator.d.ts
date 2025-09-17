/**
 * Image Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides specialized thumbnail generation for image files
 * including JPEG, PNG, GIF, WebP, and other image formats.
 */
import { ThumbnailOptions, ProcessingResult } from "../types";
import { ImageThumbnailGeneratorOptions } from "./utils/image-canvas";
export type { ImageThumbnailGeneratorOptions };
export declare class ImageThumbnailGenerator {
    private options;
    private imageLoader;
    private imageCanvas;
    constructor(options?: ImageThumbnailGeneratorOptions);
    /**
     * Generate thumbnail for image files
     */
    generateThumbnail(file: File | string, options?: Partial<ThumbnailOptions>): Promise<ProcessingResult<Blob>>;
    /**
     * Clean up resources
     */
    destroy(): void;
}
