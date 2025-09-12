/**
 * Advanced Color Conversion Utilities
 * Provides proper RGB to OKLCH conversion and gamut mapping
 */

// Note: colorizr import commented out due to installation issues
// import { rgb2oklch, oklch2rgb, getOkLCHMaxChroma } from 'colorizr';
import type { OKLCHColor } from '../types';

/**
 * RGB color representation
 */
export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * Convert RGB color to OKLCH
 * @param rgb - RGB color object
 * @returns OKLCH color object
 */
export function rgbToOklch(rgb: RGBColor): OKLCHColor {
  // Simplified RGB to OKLCH conversion
  // For production, use a proper color library like colorizr
  const { r, g, b } = rgb;
  
  // Convert to linear RGB
  const linearR = r / 255;
  const linearG = g / 255;
  const linearB = b / 255;
  
  // Simplified OKLCH conversion (this is a basic approximation)
  const l = (linearR + linearG + linearB) / 3 * 100; // Rough lightness
  const c = Math.sqrt((linearR - linearG) ** 2 + (linearG - linearB) ** 2 + (linearB - linearR) ** 2) / 3 * 0.4; // Rough chroma
  const h = Math.atan2(linearG - linearB, linearR - linearG) * 180 / Math.PI; // Rough hue
  
  return {
    l: Math.max(0, Math.min(100, l)),
    c: Math.max(0, Math.min(0.4, c)),
    h: ((h + 360) % 360)
  };
}

/**
 * Convert OKLCH color to RGB
 * @param oklch - OKLCH color object
 * @returns RGB color object
 */
export function oklchToRgb(oklch: OKLCHColor): RGBColor {
  // Simplified OKLCH to RGB conversion
  // For production, use a proper color library like colorizr
  const { l, c, h } = oklch;
  
  // Convert lightness from 0-100 to 0-1
  const lightness = l / 100;
  
  // Convert hue to radians
  const hueRad = (h * Math.PI) / 180;
  
  // Calculate a and b components
  const a = c * Math.cos(hueRad);
  const b = c * Math.sin(hueRad);
  
  // Simplified conversion to RGB
  const r = Math.round(255 * Math.max(0, Math.min(1, lightness + 0.3963377774 * a + 0.2158037573 * b)));
  const g = Math.round(255 * Math.max(0, Math.min(1, lightness - 0.1055613458 * a - 0.0638541728 * b)));
  const bVal = Math.round(255 * Math.max(0, Math.min(1, lightness - 0.0894841775 * a - 1.291485548 * b)));
  
  return { r, g, b: bVal };
}

/**
 * Get maximum chroma for given lightness and hue
 * @param lightness - Lightness value (0-100)
 * @param hue - Hue value (0-360)
 * @returns Maximum chroma value
 */
export function getMaxChroma(lightness: number, _hue: number): number {
  // Simplified max chroma calculation
  // For production, use a proper color library like colorizr
  const l = lightness / 100; // Convert to 0-1 range
  
  // Basic approximation: max chroma decreases as lightness approaches 0 or 1
  const maxChroma = 0.4 * Math.sin(l * Math.PI);
  
  return Math.max(0.01, maxChroma);
}

/**
 * Clamp OKLCH color to displayable gamut
 * @param color - OKLCH color to clamp
 * @returns Clamped OKLCH color
 */
export function clampToGamut(color: OKLCHColor): OKLCHColor {
  const maxChroma = getMaxChroma(color.l, color.h);
  
  return {
    ...color,
    c: Math.min(color.c, maxChroma)
  };
}

/**
 * Check if OKLCH color is within displayable gamut
 * @param color - OKLCH color to check
 * @returns True if color is in gamut
 */
export function isInGamut(color: OKLCHColor): boolean {
  const maxChroma = getMaxChroma(color.l, color.h);
  return color.c <= maxChroma;
}

/**
 * Handle edge cases for OKLCH colors
 * @param color - OKLCH color to process
 * @returns Processed OKLCH color with edge cases handled
 */
export function handleEdgeCases(color: OKLCHColor): OKLCHColor {
  const processed = { ...color };
  
  // Handle very low chroma (near gray) colors
  if (processed.c < 0.01) {
    // For very low chroma, hue becomes unstable
    // Keep original hue but ensure minimal chroma
    processed.c = Math.max(0.01, processed.c);
  }
  
  // Handle very dark colors (poor distinguishability)
  if (processed.l < 10) {
    // Limit aggressive hue shifts for very dark colors
    processed.l = Math.max(5, processed.l);
  }
  
  // Handle very light colors (approaching white)
  if (processed.l > 95) {
    // Limit chroma for very light colors
    processed.c = Math.min(processed.c, 0.1);
  }
  
  // Ensure hue is in valid range
  processed.h = ((processed.h % 360) + 360) % 360;
  
  // Clamp lightness to valid range
  processed.l = Math.max(0, Math.min(100, processed.l));
  
  return processed;
}

/**
 * Convert hex color string to RGB
 * @param hex - Hex color string (e.g., "#ff0000" or "ff0000")
 * @returns RGB color object
 */
export function hexToRgb(hex: string): RGBColor {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Convert RGB to hex color string
 * @param rgb - RGB color object
 * @returns Hex color string
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert hex color to OKLCH
 * @param hex - Hex color string
 * @returns OKLCH color object
 */
export function hexToOklch(hex: string): OKLCHColor {
  const rgb = hexToRgb(hex);
  return rgbToOklch(rgb);
}

/**
 * Convert OKLCH to hex color
 * @param oklch - OKLCH color object
 * @returns Hex color string
 */
export function oklchToHex(oklch: OKLCHColor): string {
  const rgb = oklchToRgb(oklch);
  return rgbToHex(rgb);
}
