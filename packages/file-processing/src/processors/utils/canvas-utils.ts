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
export function createCanvas(): HTMLCanvasElement {
  return document.createElement("canvas");
}

/**
 * Convert canvas to blob
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  options: CanvasOptions,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to generate thumbnail"));
        }
      },
      `image/${options.format}`,
      (options.quality || 85) / 100,
    );
  });
}

/**
 * Clear canvas and set background
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor: string = "#ffffff",
): void {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
}
