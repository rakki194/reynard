/**
 * Video Thumbnail Generator for the Reynard File Processing system.
 *
 * This module orchestrates video thumbnail generation using specialized
 * components for loading, rendering, and dimension calculations.
 */

import { ThumbnailOptions, ProcessingResult } from "../types";
import { VideoLoader } from "./video/VideoLoader";
import { VideoCanvasRenderer } from "./video/VideoCanvasRenderer";
import { VideoDimensions } from "./video/VideoDimensions";

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
  private videoLoader: VideoLoader;
  private canvasRenderer: VideoCanvasRenderer;

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

    this.videoLoader = new VideoLoader();
    this.canvasRenderer = new VideoCanvasRenderer();
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
      // Load video and get metadata
      const { video, duration, width, height } =
        await this.videoLoader.loadVideo(file);

      // Calculate capture time and seek to it
      const captureTime = VideoDimensions.calculateCaptureTime(
        duration,
        mergedOptions.captureTime,
      );
      video.currentTime = captureTime;
      await this.videoLoader.waitForVideoSeek(video);

      // Calculate dimensions
      const [targetWidth, targetHeight] = mergedOptions.size;
      const dimensions = VideoDimensions.calculateDimensions(
        width,
        height,
        targetWidth,
        targetHeight,
        mergedOptions.maintainAspectRatio,
      );

      // Render to canvas and convert to blob
      const blob = await this.canvasRenderer.renderVideoFrame(
        video,
        dimensions,
        mergedOptions,
      );

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
            : "Failed to generate video thumbnail",
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.videoLoader.destroy();
    this.canvasRenderer.destroy();
  }
}
