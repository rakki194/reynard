/**
 * Canvas utilities for audio thumbnail generation.
 *
 * This module provides canvas management, drawing operations, and blob conversion
 * utilities specifically for audio thumbnail generation.
 */
export interface CanvasOptions {
    format?: string;
    quality?: number;
}
export declare class CanvasUtils {
    private canvas;
    /**
     * Get canvas for drawing
     */
    getCanvas(): HTMLCanvasElement;
    /**
     * Set up canvas with dimensions and background
     */
    setupCanvas(canvas: HTMLCanvasElement, width: number, height: number, backgroundColor: string): CanvasRenderingContext2D;
    /**
     * Draw audio icon overlay
     */
    drawAudioIcon(ctx: CanvasRenderingContext2D, width: number, height: number, smallCorner?: boolean): void;
    /**
     * Convert canvas to blob
     */
    canvasToBlob(canvas: HTMLCanvasElement, options: CanvasOptions): Promise<Blob>;
    /**
     * Clean up canvas resources
     */
    destroy(): void;
}
