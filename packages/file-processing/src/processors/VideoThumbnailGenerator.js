/**
 * Video Thumbnail Generator for the Reynard File Processing system.
 *
 * This module orchestrates video thumbnail generation using specialized
 * components for loading, rendering, and dimension calculations.
 */
import { VideoLoader } from "./video/VideoLoader";
import { VideoCanvasRenderer } from "./video/VideoCanvasRenderer";
import { VideoDimensions } from "./video/VideoDimensions";
export class VideoThumbnailGenerator {
    constructor(options = { size: [200, 200] }) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "videoLoader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "canvasRenderer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.options = {
            format: "webp",
            quality: 85,
            maintainAspectRatio: true,
            backgroundColor: "#000000",
            enableAnimation: true,
            animationSlowdown: 2.0,
            useWebWorkers: false,
            maxThumbnailSize: 1024 * 1024, // 1MB
            progressive: true,
            captureTime: undefined, // Will default to middle of video
            ...options,
        };
        this.videoLoader = new VideoLoader();
        this.canvasRenderer = new VideoCanvasRenderer();
    }
    /**
     * Generate thumbnail for video files
     */
    async generateThumbnail(file, options) {
        const startTime = Date.now();
        const mergedOptions = { ...this.options, ...options };
        try {
            // Load video and get metadata
            const { video, duration, width, height } = await this.videoLoader.loadVideo(file);
            // Calculate capture time and seek to it
            const captureTime = VideoDimensions.calculateCaptureTime(duration, mergedOptions.captureTime);
            video.currentTime = captureTime;
            await this.videoLoader.waitForVideoSeek(video);
            // Calculate dimensions
            const [targetWidth, targetHeight] = mergedOptions.size;
            const dimensions = VideoDimensions.calculateDimensions(width, height, targetWidth, targetHeight, mergedOptions.maintainAspectRatio);
            // Render to canvas and convert to blob
            const blob = await this.canvasRenderer.renderVideoFrame(video, dimensions, mergedOptions);
            return {
                success: true,
                data: blob,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : "Failed to generate video thumbnail",
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.videoLoader.destroy();
        this.canvasRenderer.destroy();
    }
}
