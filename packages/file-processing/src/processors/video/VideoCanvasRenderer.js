/**
 * Video Canvas Rendering Module.
 *
 * Handles canvas operations, drawing, and blob conversion for video thumbnails.
 */
export class VideoCanvasRenderer {
    constructor() {
        Object.defineProperty(this, "canvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * Render video frame to canvas
     */
    async renderVideoFrame(video, dimensions, options) {
        const canvas = this.getCanvas();
        const ctx = canvas.getContext("2d");
        const [targetWidth, targetHeight] = options.size;
        // Set canvas dimensions
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        // Clear canvas and set background
        ctx.fillStyle = options.backgroundColor || "#000000";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        // Draw video frame
        ctx.drawImage(video, dimensions.x, dimensions.y, dimensions.width, dimensions.height);
        // Add play button overlay
        this.drawPlayButton(ctx, targetWidth, targetHeight);
        // Convert to blob
        return this.canvasToBlob(canvas, options);
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
     * Draw play button overlay for video thumbnails
     */
    drawPlayButton(ctx, width, height) {
        const size = Math.min(width, height) * 0.2;
        const x = (width - size) / 2;
        const y = (height - size) / 2;
        // Draw background circle
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI);
        ctx.fill();
        // Draw play triangle
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(x + size * 0.4, y + size * 0.3);
        ctx.lineTo(x + size * 0.4, y + size * 0.7);
        ctx.lineTo(x + size * 0.7, y + size * 0.5);
        ctx.closePath();
        ctx.fill();
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
                    reject(new Error("Failed to generate video thumbnail"));
                }
            }, `image/${options.format}`, (options.quality || 85) / 100);
        });
    }
    /**
     * Clean up resources
     */
    destroy() {
        if (this.canvas) {
            this.canvas.width = 0;
            this.canvas.height = 0;
            this.canvas = null;
        }
    }
}
