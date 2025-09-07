/**
 * Document Thumbnail Generator for the Reynard File Processing system.
 *
 * This module provides specialized thumbnail generation for document files
 * including PDF, DOCX, TXT, and other document formats.
 */

import { ThumbnailOptions, ProcessingResult } from "../types";

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
      ctx.fillStyle = mergedOptions.backgroundColor || "#ffffff";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Draw document icon based on file type
      this.drawDocumentIcon(ctx, targetWidth, targetHeight, mergedOptions);

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
          error instanceof Error ? error.message : "Failed to generate document thumbnail",
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Draw document icon based on document type
   */
  private drawDocumentIcon(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    options: DocumentThumbnailGeneratorOptions,
  ): void {
    const size = Math.min(width, height) * 0.6;
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    // Choose color based on document type
    const colors = this.getDocumentColors(options.documentType || "document");

    // Draw document shape
    ctx.fillStyle = colors.primary;
    ctx.fillRect(x, y, size * 0.8, size);

    // Draw folded corner
    ctx.fillStyle = colors.secondary;
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

    // Add document type indicator if specified
    if (options.documentType && options.documentType !== "document") {
      this.drawDocumentTypeIndicator(ctx, x, y, size, options.documentType);
    }
  }

  /**
   * Get colors for different document types
   */
  private getDocumentColors(documentType: string): { primary: string; secondary: string } {
    const colorMap: Record<string, { primary: string; secondary: string }> = {
      pdf: { primary: "#dc2626", secondary: "#b91c1c" }, // Red
      docx: { primary: "#2563eb", secondary: "#1d4ed8" }, // Blue
      txt: { primary: "#6b7280", secondary: "#4b5563" }, // Gray
      rtf: { primary: "#059669", secondary: "#047857" }, // Green
      odt: { primary: "#7c3aed", secondary: "#6d28d9" }, // Purple
      default: { primary: "#4285f4", secondary: "#3367d6" }, // Default blue
    };

    return colorMap[documentType] || colorMap.default;
  }

  /**
   * Draw document type indicator
   */
  private drawDocumentTypeIndicator(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    documentType: string,
  ): void {
    // Draw small indicator in top-right corner
    const indicatorSize = size * 0.15;
    const indicatorX = x + size * 0.7;
    const indicatorY = y + size * 0.1;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, indicatorSize / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Draw document type abbreviation
    ctx.fillStyle = "white";
    ctx.font = `bold ${indicatorSize * 0.6}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const abbreviation = documentType.toUpperCase().slice(0, 2);
    ctx.fillText(abbreviation, indicatorX, indicatorY);
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
    options: DocumentThumbnailGeneratorOptions,
  ): Promise<Blob> {
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
        (options.quality || 85) / 100,
      );
    });
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
