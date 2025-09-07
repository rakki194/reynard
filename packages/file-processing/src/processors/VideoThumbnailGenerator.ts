/**
 * Video Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides specialized thumbnail generation for video files
 * including MP4, WebM, AVI, and other video formats.
 */

import { ThumbnailOptions, ProcessingResult } from "../types";

export interface VideoThumbnailGeneratorOptions extends ThumbnailOptions {
  /** Whether to enable Web Workers for background processing */
  useWebWorkers?: boolean;
  /** Maximum thumbnail size in bytes */
  maxThumbnailSize?: number;
  /** Whether to enable progressive loading */
  progressive?: boolean;
  /** Custom background color for transparent videos */
  backgroundColor?: string;
  /** Time position to capture thumbnail (in seconds) */
  captureTime?: number;
}

export class VideoThumbnailGenerator {
  private canvas: HTMLCanvasElement | null = null;
  private videoCache = new Map<string, HTMLVideoElement>();

  constructor(
    private options: VideoThumbnailGeneratorOptions = { size: [200, 200] },
  ) {
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
  }

  /**
   * Generate thumbnail for video files
   */
  async generateThumbnail(
    file: File | string,
    options?: Partial<ThumbnailOptions>,
  ): Promise<ProcessingResult<Blob>> {
    const startTime = Date.now();
    const mergedOptions = { ...this.options, ...options };

    try {
      const video = await this.loadVideo(file);
      const canvas = this.getCanvas();
      const ctx = canvas.getContext("2d")!;

      // Set canvas dimensions
      const [targetWidth, targetHeight] = mergedOptions.size;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Clear canvas and set background
      ctx.fillStyle = mergedOptions.backgroundColor || "#000000";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Seek to a specific time for thumbnail
      const captureTime = mergedOptions.captureTime ?? Math.min(video.duration / 2, 5);
      video.currentTime = captureTime;

      // Wait for video to be ready
      await this.waitForVideoSeek(video);

      // Calculate dimensions maintaining aspect ratio
      const { width, height } = this.calculateDimensions(
        video.videoWidth,
        video.videoHeight,
        targetWidth,
        targetHeight,
        mergedOptions.maintainAspectRatio,
      );

      // Center the video frame
      const x = (targetWidth - width) / 2;
      const y = (targetHeight - height) / 2;

      // Draw video frame
      ctx.drawImage(video, x, y, width, height);

      // Add play button overlay
      this.drawPlayButton(ctx, targetWidth, targetHeight);

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
          error instanceof Error ? error.message : "Failed to generate video thumbnail",
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Load video file
   */
  private async loadVideo(file: File | string): Promise<HTMLVideoElement> {
    const key = typeof file === "string" ? file : file.name;

    if (this.videoCache.has(key)) {
      return this.videoCache.get(key)!;
    }

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    if (typeof file === "string") {
      video.src = file;
    } else {
      video.src = URL.createObjectURL(file);
    }

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video"));
    });

    this.videoCache.set(key, video);
    return video;
  }

  /**
   * Wait for video to seek to the specified time
   */
  private async waitForVideoSeek(video: HTMLVideoElement): Promise<void> {
    return new Promise<void>((resolve) => {
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      video.addEventListener("seeked", onSeeked);
    });
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
   * Draw play button overlay for video thumbnails
   */
  private drawPlayButton(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    const size = Math.min(width, height) * 0.2;
    const x = (width - size) / 2;
    const y = (height - size) / 2;

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
  private async canvasToBlob(
    canvas: HTMLCanvasElement,
    options: VideoThumbnailGeneratorOptions,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate video thumbnail"));
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
    this.videoCache.clear();

    // Clear canvas
    if (this.canvas) {
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.canvas = null;
    }
  }
}
