/**
 * Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides unified thumbnail generation for various file types
 * including images, videos, audio, text, code, and documents.
 */

import { ThumbnailOptions, ProcessingResult, FileTypeInfo } from "../types";
import { getFileTypeInfo, getFileCategory } from "../config/file-types";

export interface ThumbnailGeneratorOptions extends ThumbnailOptions {
  /** Whether to enable Web Workers for background processing */
  useWebWorkers?: boolean;
  /** Maximum thumbnail size in bytes */
  maxThumbnailSize?: number;
  /** Whether to enable progressive loading */
  progressive?: boolean;
  /** Custom background color for transparent images */
  backgroundColor?: string;
}

export class ThumbnailGenerator {
  private canvas: HTMLCanvasElement | null = null;
  private offscreenCanvas: OffscreenCanvas | null = null;
  private imageCache = new Map<string, HTMLImageElement>();
  private videoCache = new Map<string, HTMLVideoElement>();
  private audioCache = new Map<string, HTMLAudioElement>();

  constructor(private options: ThumbnailGeneratorOptions = {}) {
    this.options = {
      size: [200, 200],
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
   * Generate a thumbnail for any supported file type
   */
  async generateThumbnail(
    file: File | string,
    options?: Partial<ThumbnailOptions>,
  ): Promise<ProcessingResult<Blob | string>> {
    const startTime = Date.now();
    const mergedOptions = { ...this.options, ...options };

    try {
      // Get file information
      const fileInfo = await this.getFileInfo(file);
      if (!fileInfo.success) {
        return fileInfo;
      }

      const { name, size, type } = fileInfo.data!;
      const extension = this.getFileExtension(name);
      const fileTypeInfo = getFileTypeInfo(extension);

      // Check if file type supports thumbnails
      if (!fileTypeInfo.capabilities.thumbnail) {
        return {
          success: false,
          error: `File type ${extension} does not support thumbnail generation`,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      // Check file size limit
      if (size > (mergedOptions.maxThumbnailSize || Infinity)) {
        return {
          success: false,
          error: `File size ${size} exceeds maximum thumbnail size limit`,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      // Generate thumbnail based on file type
      let thumbnail: Blob | string;
      const category = getFileCategory(extension);

      switch (category) {
        case "image":
          thumbnail = await this.generateImageThumbnail(file, mergedOptions);
          break;
        case "video":
          thumbnail = await this.generateVideoThumbnail(file, mergedOptions);
          break;
        case "audio":
          thumbnail = await this.generateAudioThumbnail(file, mergedOptions);
          break;
        case "text":
        case "code":
          thumbnail = await this.generateTextThumbnail(file, mergedOptions);
          break;
        case "document":
          thumbnail = await this.generateDocumentThumbnail(file, mergedOptions);
          break;
        default:
          return {
            success: false,
            error: `Unsupported file category: ${category}`,
            duration: Date.now() - startTime,
            timestamp: new Date(),
          };
      }

      return {
        success: true,
        data: thumbnail,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generate thumbnail for image files
   */
  private async generateImageThumbnail(
    file: File | string,
    options: ThumbnailGeneratorOptions,
  ): Promise<Blob> {
    const image = await this.loadImage(file);
    const canvas = this.getCanvas();
    const ctx = canvas.getContext("2d")!;

    // Set canvas dimensions
    const [targetWidth, targetHeight] = options.size;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Clear canvas and set background
    ctx.fillStyle = options.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Calculate dimensions maintaining aspect ratio
    const { width, height } = this.calculateDimensions(
      image.naturalWidth,
      image.naturalHeight,
      targetWidth,
      targetHeight,
      options.maintainAspectRatio,
    );

    // Center the image
    const x = (targetWidth - width) / 2;
    const y = (targetHeight - height) / 2;

    // Draw image
    ctx.drawImage(image, x, y, width, height);

    // Convert to blob
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
        options.quality / 100,
      );
    });
  }

  /**
   * Generate thumbnail for video files
   */
  private async generateVideoThumbnail(
    file: File | string,
    options: ThumbnailGeneratorOptions,
  ): Promise<Blob> {
    const video = await this.loadVideo(file);
    const canvas = this.getCanvas();
    const ctx = canvas.getContext("2d")!;

    // Set canvas dimensions
    const [targetWidth, targetHeight] = options.size;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Clear canvas and set background
    ctx.fillStyle = options.backgroundColor || "#000000";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Seek to a specific time for thumbnail
    video.currentTime = Math.min(video.duration / 2, 5); // 5 seconds or halfway

    // Wait for video to be ready
    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      video.addEventListener("seeked", onSeeked);
    });

    // Calculate dimensions maintaining aspect ratio
    const { width, height } = this.calculateDimensions(
      video.videoWidth,
      video.videoHeight,
      targetWidth,
      targetHeight,
      options.maintainAspectRatio,
    );

    // Center the video frame
    const x = (targetWidth - width) / 2;
    const y = (targetHeight - height) / 2;

    // Draw video frame
    ctx.drawImage(video, x, y, width, height);

    // Add play button overlay
    this.drawPlayButton(ctx, targetWidth, targetHeight);

    // Convert to blob
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
        options.quality / 100,
      );
    });
  }

  /**
   * Generate thumbnail for audio files
   */
  private async generateAudioThumbnail(
    file: File | string,
    options: ThumbnailGeneratorOptions,
  ): Promise<Blob> {
    const audio = await this.loadAudio(file);
    const canvas = this.getCanvas();
    const ctx = canvas.getContext("2d")!;

    // Set canvas dimensions
    const [targetWidth, targetHeight] = options.size;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Clear canvas and set background
    ctx.fillStyle = options.backgroundColor || "#1db954"; // Spotify green
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw audio waveform visualization
    this.drawAudioWaveform(ctx, targetWidth, targetHeight, audio.duration);

    // Add audio icon overlay
    this.drawAudioIcon(ctx, targetWidth, targetHeight);

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate audio thumbnail"));
          }
        },
        `image/${options.format}`,
        options.quality / 100,
      );
    });
  }

  /**
   * Generate thumbnail for text/code files
   */
  private async generateTextThumbnail(
    file: File | string,
    options: ThumbnailGeneratorOptions,
  ): Promise<Blob> {
    const text = await this.loadText(file);
    const canvas = this.getCanvas();
    const ctx = canvas.getContext("2d")!;

    // Set canvas dimensions
    const [targetWidth, targetHeight] = options.size;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Clear canvas and set background
    ctx.fillStyle = options.backgroundColor || "#f8f9fa";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw text content
    this.drawTextContent(ctx, text, targetWidth, targetHeight);

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate text thumbnail"));
          }
        },
        `image/${options.format}`,
        options.quality / 100,
      );
    });
  }

  /**
   * Generate thumbnail for document files
   */
  private async generateDocumentThumbnail(
    file: File | string,
    options: ThumbnailGeneratorOptions,
  ): Promise<Blob> {
    const canvas = this.getCanvas();
    const ctx = canvas.getContext("2d")!;

    // Set canvas dimensions
    const [targetWidth, targetHeight] = options.size;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Clear canvas and set background
    ctx.fillStyle = options.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw document icon
    this.drawDocumentIcon(ctx, targetWidth, targetHeight);

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate document thumbnail"));
          }
        },
        `image/${options.format}`,
        options.quality / 100,
      );
    });
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
   * Load audio file
   */
  private async loadAudio(file: File | string): Promise<HTMLAudioElement> {
    const key = typeof file === "string" ? file : file.name;

    if (this.audioCache.has(key)) {
      return this.audioCache.get(key)!;
    }

    const audio = new Audio();
    audio.crossOrigin = "anonymous";

    if (typeof file === "string") {
      audio.src = file;
    } else {
      audio.src = URL.createObjectURL(file);
    }

    await new Promise<void>((resolve, reject) => {
      audio.onloadedmetadata = () => resolve();
      audio.onerror = () => reject(new Error("Failed to load audio"));
    });

    this.audioCache.set(key, audio);
    return audio;
  }

  /**
   * Load text file
   */
  private async loadText(file: File | string): Promise<string> {
    if (typeof file === "string") {
      // For URLs, we'd need to fetch the content
      const response = await fetch(file);
      return await response.text();
    } else {
      return await file.text();
    }
  }

  /**
   * Get file information
   */
  private async getFileInfo(
    file: File | string,
  ): Promise<ProcessingResult<{ name: string; size: number; type: string }>> {
    try {
      if (typeof file === "string") {
        // URL case - we can't get size without fetching
        return {
          success: true,
          data: {
            name: file.split("/").pop() || "unknown",
            size: 0,
            type: "unknown",
          },
          duration: 0,
          timestamp: new Date(),
        };
      } else {
        return {
          success: true,
          data: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
          duration: 0,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get file info",
        duration: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex !== -1
      ? filename.substring(lastDotIndex).toLowerCase()
      : "";
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
   * Draw audio waveform visualization
   */
  private drawAudioWaveform(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    duration: number,
  ): void {
    const bars = 20;
    const barWidth = width / bars;
    const barSpacing = 2;

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

    for (let i = 0; i < bars; i++) {
      const barHeight = (Math.random() * 0.6 + 0.2) * height * 0.6;
      const x = i * barWidth + barSpacing;
      const y = (height - barHeight) / 2;

      ctx.fillRect(x, y, barWidth - barSpacing, barHeight);
    }
  }

  /**
   * Draw audio icon overlay
   */
  private drawAudioIcon(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    const size = Math.min(width, height) * 0.3;
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Draw speaker icon
    ctx.fillStyle = "#1db954";
    ctx.fillRect(x + size * 0.3, y + size * 0.3, size * 0.4, size * 0.4);
  }

  /**
   * Draw text content for text/code thumbnails
   */
  private drawTextContent(
    ctx: CanvasRenderingContext2D,
    text: string,
    width: number,
    height: number,
  ): void {
    const lines = text.split("\n").slice(0, 10); // Show first 10 lines
    const fontSize = Math.max(12, Math.min(width, height) / 20);

    ctx.font = `${fontSize}px 'Monaco', 'Menlo', 'Ubuntu Mono', monospace`;
    ctx.fillStyle = "#333";
    ctx.textBaseline = "top";

    const lineHeight = fontSize * 1.2;
    const maxWidth = width * 0.9;

    lines.forEach((line, index) => {
      const y = 10 + index * lineHeight;
      if (y + lineHeight > height) return;

      // Truncate long lines
      let displayLine = line;
      while (
        ctx.measureText(displayLine).width > maxWidth &&
        displayLine.length > 0
      ) {
        displayLine = displayLine.slice(0, -1);
      }
      if (displayLine.length < line.length) {
        displayLine += "...";
      }

      ctx.fillText(displayLine, 10, y);
    });
  }

  /**
   * Draw document icon
   */
  private drawDocumentIcon(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    const size = Math.min(width, height) * 0.6;
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    // Draw document shape
    ctx.fillStyle = "#4285f4";
    ctx.fillRect(x, y, size * 0.8, size);

    // Draw folded corner
    ctx.fillStyle = "#3367d6";
    ctx.beginPath();
    ctx.moveTo(x + size * 0.8, y);
    ctx.lineTo(x + size, y + size * 0.2);
    ctx.lineTo(x + size * 0.8, y + size * 0.2);
    ctx.closePath();
    ctx.fill();

    // Draw lines representing text
    ctx.fillStyle = "white";
    const lineHeight = size * 0.08;
    const lineSpacing = size * 0.12;

    for (let i = 0; i < 5; i++) {
      const lineY = y + size * 0.3 + i * lineSpacing;
      const lineWidth = size * 0.6 - i * 0.1;
      ctx.fillRect(x + size * 0.1, lineY, lineWidth, lineHeight);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clear caches
    this.imageCache.clear();
    this.videoCache.clear();
    this.audioCache.clear();

    // Clear canvas
    if (this.canvas) {
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.canvas = null;
    }

    if (this.offscreenCanvas) {
      this.offscreenCanvas.width = 0;
      this.offscreenCanvas.height = 0;
      this.offscreenCanvas = null;
    }
  }
}
