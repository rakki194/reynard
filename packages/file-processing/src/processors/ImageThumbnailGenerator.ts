/**
 * Image Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides specialized thumbnail generation for image files
 * including JPEG, PNG, GIF, WebP, and other image formats.
 */

import { ThumbnailOptions, ProcessingResult } from "../types";

export interface ImageThumbnailGeneratorOptions extends ThumbnailOptions {
  /** Whether to enable Web Workers for background processing */
  useWebWorkers?: boolean;
  /** Maximum thumbnail size in bytes */
  maxThumbnailSize?: number;
  /** Whether to enable progressive loading */
  progressive?: boolean;
  /** Custom background color for transparent images */
  backgroundColor?: string;
}

export class ImageThumbnailGenerator {
  private canvas: HTMLCanvasElement | null = null;
  private imageCache = new Map<string, HTMLImageElement>();

  constructor(
    private options: ImageThumbnailGeneratorOptions = { size: [200, 200] },
  ) {
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
  async generateThumbnail(
    file: File | string,
    options?: Partial<ThumbnailOptions>,
  ): Promise<ProcessingResult<Blob>> {
    const startTime = Date.now();
    const mergedOptions = { ...this.options, ...options };

    try {
      const image = await this.loadImage(file);
      const canvas = this.getCanvas();
      const ctx = canvas.getContext("2d")!;

      // Set canvas dimensions
      const [targetWidth, targetHeight] = mergedOptions.size;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Clear canvas and set background
      ctx.fillStyle = mergedOptions.backgroundColor || "#ffffff";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calculate dimensions maintaining aspect ratio
      const { width, height } = this.calculateDimensions(
        image.naturalWidth,
        image.naturalHeight,
        targetWidth,
        targetHeight,
        mergedOptions.maintainAspectRatio,
      );

      // Center the image
      const x = (targetWidth - width) / 2;
      const y = (targetHeight - height) / 2;

      // Draw image
      ctx.drawImage(image, x, y, width, height);

      // Convert to blob
      const blob = await this.canvasToBlob(canvas, mergedOptions);

      return {
        success: true,
        data: blob,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate image thumbnail",
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Load image file
   */
  private async loadImage(file: File | string): Promise<HTMLImageElement> {
    const key = typeof file === "string" ? file : file.name;

    if (this.imageCache.has(key)) {
      return this.imageCache.get(key)!;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    if (typeof file === "string") {
      image.src = file;
    } else {
      image.src = URL.createObjectURL(file);
    }

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load image"));
    });

    this.imageCache.set(key, image);
    return image;
  }

  /**
   * Calculate dimensions maintaining aspect ratio
   */
  private calculateDimensions(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number,
    maintainAspectRatio: boolean = true,
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
  private getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
    }
    return this.canvas;
  }

  /**
   * Convert canvas to blob
   */
  private async canvasToBlob(
    canvas: HTMLCanvasElement,
    options: ImageThumbnailGeneratorOptions,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate image thumbnail"));
          }
        },
        `image/${options.format}`,
        (options.quality || 85) / 100,
      );
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clear cache
    this.imageCache.clear();

    // Clear canvas
    if (this.canvas) {
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.canvas = null;
    }
  }
}
