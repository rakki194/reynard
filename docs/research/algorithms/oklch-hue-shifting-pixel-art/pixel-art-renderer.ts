/**
 * Core pixel art renderer with OKLCH color support
 * Handles canvas-based rendering with color caching
 */

import type { OKLCHColor } from 'reynard-colors';
import { oklchToRgb } from 'reynard-colors';

/**
 * Canvas-based pixel art renderer with OKLCH color support
 */
export class PixelArtRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pixelSize: number;
  private colorCache = new Map<string, string>();
  
  constructor(canvas: HTMLCanvasElement, pixelSize: number = 1) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.pixelSize = pixelSize;
    
    // Disable image smoothing for crisp pixel art
    this.ctx.imageSmoothingEnabled = false;
  }
  
  /**
   * Convert OKLCH color to RGB string for canvas
   */
  private oklchToCanvasColor(color: OKLCHColor): string {
    const key = `${color.l}-${color.c}-${color.h}`;
    
    if (this.colorCache.has(key)) {
      return this.colorCache.get(key)!;
    }
    
    const rgb = oklchToRgb(color.l / 100, color.c, color.h);
    const colorString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    
    this.colorCache.set(key, colorString);
    return colorString;
  }
  
  /**
   * Draw a single pixel with OKLCH color
   */
  drawPixel(x: number, y: number, color: OKLCHColor): void {
    this.ctx.fillStyle = this.oklchToCanvasColor(color);
    this.ctx.fillRect(
      x * this.pixelSize, 
      y * this.pixelSize, 
      this.pixelSize, 
      this.pixelSize
    );
  }
  
  /**
   * Draw a rectangle with OKLCH color
   */
  drawRect(x: number, y: number, width: number, height: number, color: OKLCHColor): void {
    this.ctx.fillStyle = this.oklchToCanvasColor(color);
    this.ctx.fillRect(
      x * this.pixelSize,
      y * this.pixelSize,
      width * this.pixelSize,
      height * this.pixelSize
    );
  }
  
  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Set pixel size for scaling
   */
  setPixelSize(size: number): void {
    this.pixelSize = size;
  }
  
  /**
   * Clear color cache
   */
  clearColorCache(): void {
    this.colorCache.clear();
  }
  
  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
  
  /**
   * Get canvas context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
  
  /**
   * Get current pixel size
   */
  getPixelSize(): number {
    return this.pixelSize;
  }
}
