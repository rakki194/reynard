/**
 * Canvas utility functions for thumbnail generation.
 *
 * Provides reusable canvas operations and blob conversion.
 */
export interface CanvasOptions {
    format: string;
    quality: number;
}
/**
 * Get canvas for drawing
 */
export declare function createCanvas(): HTMLCanvasElement;
/**
 * Convert canvas to blob
 */
export declare function canvasToBlob(canvas: HTMLCanvasElement, options: CanvasOptions): Promise<Blob>;
/**
 * Clear canvas and set background
 */
export declare function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number, backgroundColor?: string): void;
