/**
 * Image Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides specialized thumbnail generation for image files
 * including JPEG, PNG, GIF, WebP, and other image formats.
 */
import { ImageLoader } from "./utils/image-loader";
import { ImageCanvas, } from "./utils/image-canvas";
export class ImageThumbnailGenerator {
    constructor(options = { size: [200, 200] }) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "imageLoader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new ImageLoader()
        });
        Object.defineProperty(this, "imageCanvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new ImageCanvas()
        });
        this.options = {
            format: "webp",
            quality: 85,
            maintainAspectRatio: true,
            backgroundColor: "#ffffff",
            enableAnimation: true,
            animationSlowdown: 2.0,
            useWebWorkers: false,
            maxThumbnailSize: 1024 * 1024, // 1MB
            progressive: true,
            ...options,
        };
    }
    /**
     * Generate thumbnail for image files
     */
    async generateThumbnail(file, options) {
        const startTime = Date.now();
        const mergedOptions = { ...this.options, ...options };
        try {
            const image = await this.imageLoader.loadImage(file);
            const canvas = this.imageCanvas.getCanvas();
            const ctx = canvas.getContext("2d");
            // Set canvas dimensions
            const [targetWidth, targetHeight] = mergedOptions.size || [200, 200];
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            // Clear canvas and set background
            ctx.fillStyle = mergedOptions.backgroundColor || "#ffffff";
            ctx.fillRect(0, 0, targetWidth, targetHeight);
            // Calculate dimensions maintaining aspect ratio
            const { width, height } = this.imageCanvas.calculateDimensions(image.naturalWidth, image.naturalHeight, targetWidth, targetHeight, mergedOptions.maintainAspectRatio);
            // Center the image
            const x = (targetWidth - width) / 2;
            const y = (targetHeight - height) / 2;
            // Draw image
            ctx.drawImage(image, x, y, width, height);
            // Convert to blob
            const blob = await this.imageCanvas.canvasToBlob(canvas, mergedOptions);
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
                    : "Failed to generate image thumbnail",
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.imageLoader.clearCache();
        this.imageCanvas.destroy();
    }
}
