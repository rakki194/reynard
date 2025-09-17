/**
 * Canvas utility functions for thumbnail generation.
 *
 * Provides reusable canvas operations and blob conversion.
 */
/**
 * Get canvas for drawing
 */
export function createCanvas() {
    return document.createElement("canvas");
}
/**
 * Convert canvas to blob
 */
export async function canvasToBlob(canvas, options) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            }
            else {
                reject(new Error("Failed to generate thumbnail"));
            }
        }, `image/${options.format}`, (options.quality || 85) / 100);
    });
}
/**
 * Clear canvas and set background
 */
export function clearCanvas(ctx, width, height, backgroundColor = "#ffffff") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
}
