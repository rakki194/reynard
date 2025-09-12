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

export class CanvasUtils {
  private canvas: HTMLCanvasElement | null = null;

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
   * Set up canvas with dimensions and background
   */
  setupCanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    backgroundColor: string,
  ): CanvasRenderingContext2D {
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    return ctx;
  }

  /**
   * Draw audio icon overlay
   */
  drawAudioIcon(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    smallCorner: boolean = false,
  ): void {
    if (smallCorner) {
      // Draw subtle audio indicator in bottom-right corner
      const size = Math.min(width, height) * 0.12;
      const x = width - size - 8;
      const y = height - size - 8;

      // Draw subtle background circle
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw audio waves icon
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";

      const centerX = x + size / 2;
      const centerY = y + size / 2;
      const waveRadius = size * 0.15;

      // Draw 3 audio waves
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius + i * 2, 0, Math.PI);
        ctx.stroke();
      }
    }
  }

  /**
   * Convert canvas to blob
   */
  async canvasToBlob(
    canvas: HTMLCanvasElement,
    options: CanvasOptions,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate audio thumbnail"));
          }
        },
        `image/${options.format || "webp"}`,
        (options.quality || 85) / 100,
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
