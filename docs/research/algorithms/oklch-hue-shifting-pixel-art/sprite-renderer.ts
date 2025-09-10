/**
 * Sprite rendering utilities for pixel art
 * Handles sprite drawing with palette support and hue shifting
 */

import type { OKLCHColor } from 'reynard-colors';
import { PixelArtRenderer } from './pixel-art-renderer';

/**
 * Sprite data structure for pixel art
 */
export interface PixelSprite {
  width: number;
  height: number;
  pixels: number[][]; // 2D array where 0 = transparent, 1+ = color indices
  palette: OKLCHColor[]; // Color palette indexed by pixel values
}

/**
 * Sprite renderer with hue shifting support
 */
export class SpriteRenderer {
  private renderer: PixelArtRenderer;
  
  constructor(renderer: PixelArtRenderer) {
    this.renderer = renderer;
  }
  
  /**
   * Draw a sprite at the specified position
   */
  drawSprite(sprite: PixelSprite, x: number, y: number): void {
    for (let row = 0; row < sprite.height; row++) {
      for (let col = 0; col < sprite.width; col++) {
        const pixelValue = sprite.pixels[row][col];
        
        if (pixelValue === 0) continue; // Skip transparent pixels
        
        const colorIndex = pixelValue - 1; // Convert to 0-based index
        if (colorIndex >= 0 && colorIndex < sprite.palette.length) {
          const color = sprite.palette[colorIndex];
          this.renderer.drawPixel(x + col, y + row, color);
        }
      }
    }
  }
  
  /**
   * Draw a sprite with custom palette (for hue shifting effects)
   */
  drawSpriteWithPalette(
    sprite: PixelSprite, 
    x: number, 
    y: number, 
    customPalette: OKLCHColor[]
  ): void {
    for (let row = 0; row < sprite.height; row++) {
      for (let col = 0; col < sprite.width; col++) {
        const pixelValue = sprite.pixels[row][col];
        
        if (pixelValue === 0) continue; // Skip transparent pixels
        
        const colorIndex = pixelValue - 1; // Convert to 0-based index
        if (colorIndex >= 0 && colorIndex < customPalette.length) {
          const color = customPalette[colorIndex];
          this.renderer.drawPixel(x + col, y + row, color);
        }
      }
    }
  }
  
  /**
   * Draw a sprite with hue shifting applied
   */
  drawSpriteWithHueShift(
    sprite: PixelSprite,
    x: number,
    y: number,
    hueShift: number,
    intensity: number = 1.0
  ): void {
    const shiftedPalette = sprite.palette.map(color => ({
      l: color.l,
      c: color.c,
      h: (color.h + hueShift * intensity + 360) % 360
    }));
    
    this.drawSpriteWithPalette(sprite, x, y, shiftedPalette);
  }
  
  /**
   * Get the underlying pixel art renderer
   */
  getRenderer(): PixelArtRenderer {
    return this.renderer;
  }
}
