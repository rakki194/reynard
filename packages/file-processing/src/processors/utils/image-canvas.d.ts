/**
 * Canvas utilities for image thumbnail generation.
 */
import { ThumbnailOptions } from "../../types";
export interface ImageThumbnailGeneratorOptions extends ThumbnailOptions {
    /** Whether to enable Web Workers for background processing */
    useWebWorkers?: boolean;
    /** Maximum thumbnail size in bytes */
    maxThumbnailSize?: number;
    /** Whether to enable progressive loading */
    progressive?: boolean;
}
export declare class ImageCanvas {
    private canvas;
    /**
     * Calculate dimensions maintaining aspect ratio
     */
    calculateDimensions(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number, maintainAspectRatio?: boolean): {
        width: number;
        height: number;
    };
    /**
     * Get canvas for drawing
     */
    getCanvas(): HTMLCanvasElement;
    /**
     * Convert canvas to blob
     */
    canvasToBlob(canvas: HTMLCanvasElement, options: ImageThumbnailGeneratorOptions): Promise<Blob>;
    /**
     * Clean up canvas resources
     */
    destroy(): void;
}
