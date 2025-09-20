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

export class ImageCanvas {
  private canvas: HTMLCanvasElement | null = null;

  /**
   * Calculate dimensions maintaining aspect ratio
   */
  calculateDimensions(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number,
    maintainAspectRatio: boolean = true
  ): { width: number; height: number } {
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
    } else {
      // Source is taller - fit to height
      height = targetHeight;
      width = targetHeight * sourceRatio;
    }

    return { width, height };
  }

  /**
   * Get canvas for drawing
   */
  getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
    }
    return this.canvas;
  }

  /**
   * Convert canvas to blob
   */
  async canvasToBlob(canvas: HTMLCanvasElement, options: ImageThumbnailGeneratorOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate image thumbnail"));
          }
        },
        `image/${options.format}`,
        (options.quality || 85) / 100
      );
    });
  }

  /**
   * Clean up canvas resources
   */
  destroy(): void {
    if (this.canvas) {
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.canvas = null;
    }
  }
}
