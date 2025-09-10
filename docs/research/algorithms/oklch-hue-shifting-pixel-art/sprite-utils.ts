/**
 * Utility functions for creating and manipulating pixel art sprites
 * Provides helper functions for common sprite operations
 */

import type { OKLCHColor } from 'reynard-colors';
import type { PixelSprite } from './sprite-renderer';

/**
 * Create a sprite from a 2D array of color indices
 */
export function createSprite(
  pixels: number[][],
  palette: OKLCHColor[]
): PixelSprite {
  return {
    width: pixels[0]?.length || 0,
    height: pixels.length,
    pixels,
    palette
  };
}

/**
 * Create a simple colored rectangle sprite
 */
export function createRectSprite(
  width: number,
  height: number,
  color: OKLCHColor
): PixelSprite {
  const pixels: number[][] = [];
  
  for (let row = 0; row < height; row++) {
    const pixelRow: number[] = [];
    for (let col = 0; col < width; col++) {
      pixelRow.push(1); // Use first color in palette
    }
    pixels.push(pixelRow);
  }
  
  return {
    width,
    height,
    pixels,
    palette: [color]
  };
}

/**
 * Create a checkerboard pattern sprite
 */
export function createCheckerboardSprite(
  width: number,
  height: number,
  color1: OKLCHColor,
  color2: OKLCHColor,
  checkerSize: number = 1
): PixelSprite {
  const pixels: number[][] = [];
  
  for (let row = 0; row < height; row++) {
    const pixelRow: number[] = [];
    for (let col = 0; col < width; col++) {
      const checkerX = Math.floor(col / checkerSize);
      const checkerY = Math.floor(row / checkerSize);
      const isEven = (checkerX + checkerY) % 2 === 0;
      pixelRow.push(isEven ? 1 : 2);
    }
    pixels.push(pixelRow);
  }
  
  return {
    width,
    height,
    pixels,
    palette: [color1, color2]
  };
}

/**
 * Create a circle sprite
 */
export function createCircleSprite(
  radius: number,
  color: OKLCHColor,
  fillColor?: OKLCHColor
): PixelSprite {
  const size = radius * 2 + 1;
  const pixels: number[][] = [];
  
  for (let row = 0; row < size; row++) {
    const pixelRow: number[] = [];
    for (let col = 0; col < size; col++) {
      const dx = col - radius;
      const dy = row - radius;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        if (fillColor && distance < radius - 1) {
          pixelRow.push(2); // Fill color
        } else {
          pixelRow.push(1); // Border color
        }
      } else {
        pixelRow.push(0); // Transparent
      }
    }
    pixels.push(pixelRow);
  }
  
  const palette = fillColor ? [color, fillColor] : [color];
  return {
    width: size,
    height: size,
    pixels,
    palette
  };
}

/**
 * Create a line sprite
 */
export function createLineSprite(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: OKLCHColor
): PixelSprite {
  const width = Math.max(x1, x2) + 1;
  const height = Math.max(y1, y2) + 1;
  const pixels: number[][] = [];
  
  // Initialize empty pixels
  for (let row = 0; row < height; row++) {
    const pixelRow: number[] = [];
    for (let col = 0; col < width; col++) {
      pixelRow.push(0);
    }
    pixels.push(pixelRow);
  }
  
  // Draw line using Bresenham's algorithm
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  
  let x = x1;
  let y = y1;
  
  while (true) {
    pixels[y][x] = 1;
    
    if (x === x2 && y === y2) break;
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  
  return {
    width,
    height,
    pixels,
    palette: [color]
  };
}

/**
 * Create a character sprite example
 */
export function createExampleCharacter(): PixelSprite {
  // Define sprite pixels (8x8 character)
  const pixels = [
    [0, 0, 1, 1, 1, 1, 0, 0], // Hair
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 2, 2, 2, 2, 1, 1], // Face
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 3, 3, 2, 2, 1], // Eyes
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1], // Mouth
    [0, 1, 1, 1, 1, 1, 1, 0]
  ];
  
  // Define color palette
  const palette: OKLCHColor[] = [
    { l: 30, c: 0.15, h: 20 }, // Hair (brown)
    { l: 70, c: 0.12, h: 30 }, // Skin (light)
    { l: 20, c: 0.05, h: 0 }   // Eyes (dark)
  ];
  
  return createSprite(pixels, palette);
}
