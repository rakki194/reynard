/**
 * Canvas utilities for image thumbnail generation.
 */
export class ImageCanvas {
    constructor() {
        Object.defineProperty(this, "canvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * Calculate dimensions maintaining aspect ratio
     */
    calculateDimensions(sourceWidth, sourceHeight, targetWidth, targetHeight, maintainAspectRatio = true) {
        if (!maintainAspectRatio) {
            return { width: targetWidth, height: targetHeight };
        }
        const sourceRatio = sourceWidth / sourceHeight;
        const targetRatio = targetWidth / targetHeight;
        let width, height;
        if (sourceRatio > targetRatio) {
            // Source is wider - fit to width
            width = targetWidth;
            height = targetWidth / sourceRatio;
        }
        else {
            // Source is taller - fit to height
            height = targetHeight;
            width = targetHeight * sourceRatio;
        }
        return { width, height };
    }
    /**
     * Get canvas for drawing
     */
    getCanvas() {
        if (!this.canvas) {
            this.canvas = document.createElement("canvas");
        }
        return this.canvas;
    }
    /**
     * Convert canvas to blob
     */
    async canvasToBlob(canvas, options) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                }
                else {
                    reject(new Error("Failed to generate image thumbnail"));
                }
            }, `image/${options.format}`, (options.quality || 85) / 100);
        });
    }
    /**
     * Clean up canvas resources
     */
    destroy() {
        if (this.canvas) {
            this.canvas.width = 0;
            this.canvas.height = 0;
            this.canvas = null;
        }
    }
}
