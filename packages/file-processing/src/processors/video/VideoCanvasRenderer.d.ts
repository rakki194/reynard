/**
 * Video Canvas Rendering Module.
 *
 * Handles canvas operations, drawing, and blob conversion for video thumbnails.
 */
import { ThumbnailOptions } from "../../types";
import { DimensionResult } from "./VideoDimensions";
export interface VideoCanvasOptions extends ThumbnailOptions {
    backgroundColor?: string;
}
export declare class VideoCanvasRenderer {
    private canvas;
    /**
     * Render video frame to canvas
     */
    renderVideoFrame(video: HTMLVideoElement, dimensions: DimensionResult, options: VideoCanvasOptions): Promise<Blob>;
    /**
     * Get canvas for drawing
     */
    private getCanvas;
    /**
     * Draw play button overlay for video thumbnails
     */
    private drawPlayButton;
    /**
     * Convert canvas to blob
     */
    private canvasToBlob;
    /**
     * Clean up resources
     */
    destroy(): void;
}
