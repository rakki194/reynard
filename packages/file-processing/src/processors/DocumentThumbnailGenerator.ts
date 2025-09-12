/**
 * Document Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides specialized thumbnail generation for document files
 * including PDF, DOCX, TXT, and other document formats.
 */

import { ThumbnailOptions, ProcessingResult } from "../types";
import { createCanvas, canvasToBlob, clearCanvas } from "./utils";
import { drawDocumentIcon } from "./renderers/document-renderer";

export interface DocumentThumbnailGeneratorOptions extends ThumbnailOptions {
  /** Whether to enable Web Workers for background processing */
  useWebWorkers?: boolean;
  /** Maximum thumbnail size in bytes */
  maxThumbnailSize?: number;
  /** Whether to enable progressive loading */
  progressive?: boolean;
  /** Custom background color for document thumbnails */
  backgroundColor?: string;
  /** Document type for custom styling */
  documentType?: string;
}

export class DocumentThumbnailGenerator {
  private canvas: HTMLCanvasElement | null = null;

  constructor(
    private options: DocumentThumbnailGeneratorOptions = { size: [200, 200] },
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
      documentType: "document",
      ...options,
    };
  }

  /**
   * Generate thumbnail for document files
   */
  async generateThumbnail(
    file: File | string,
    options?: Partial<ThumbnailOptions>,
  ): Promise<ProcessingResult<Blob>> {
    const startTime = Date.now();
    const mergedOptions = { ...this.options, ...options };

    try {
      const canvas = this.getCanvas();
      const ctx = canvas.getContext("2d")!;

      // Set canvas dimensions
      const [targetWidth, targetHeight] = mergedOptions.size;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Clear canvas and set background
      clearCanvas(ctx, targetWidth, targetHeight, mergedOptions.backgroundColor);

      // Draw document icon based on file type
      drawDocumentIcon(ctx, targetWidth, targetHeight, {
        documentType: mergedOptions.documentType,
      });

      // Convert to blob
      const blob = await canvasToBlob(canvas, {
        format: mergedOptions.format || "webp",
        quality: mergedOptions.quality || 85,
      });

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
            : "Failed to generate document thumbnail",
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get canvas for drawing
   */
  private getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      this.canvas = createCanvas();
    }
    return this.canvas;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clear canvas
    if (this.canvas) {
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.canvas = null;
    }
  }
}
