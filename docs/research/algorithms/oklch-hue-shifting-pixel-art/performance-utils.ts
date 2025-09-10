/**
 * Performance Optimization Utilities
 * Caching and batch processing for efficient hue shifting
 */

import type { OKLCHColor } from 'reynard-colors';
import { basicHueShift } from './core-algorithms';

/**
 * Cached hue shifting for performance
 */
export class CachedHueShifter {
  private cache = new Map<string, OKLCHColor>();
  private maxCacheSize: number;
  
  constructor(maxCacheSize: number = 1000) {
    this.maxCacheSize = maxCacheSize;
  }
  
  /**
   * Get shifted color with caching
   * @param baseColor - Base OKLCH color
   * @param shiftType - Type of shift
   * @param intensity - Shift intensity
   * @returns Shifted OKLCH color
   */
  getShiftedColor(
    baseColor: OKLCHColor,
    shiftType: string,
    intensity: number
  ): OKLCHColor {
    const key = `${baseColor.l}-${baseColor.c}-${baseColor.h}-${shiftType}-${intensity}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    // Check cache size and evict if necessary
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }
    
    const shifted = basicHueShift(baseColor, shiftType as any, intensity);
    this.cache.set(key, shifted);
    return shifted;
  }
  
  /**
   * Evict oldest cache entries
   */
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: 0 // Would need to track hits/misses for actual hit rate
    };
  }
}

/**
 * Batch process multiple colors for efficiency
 * @param colors - Array of OKLCH colors
 * @param shiftType - Type of shift
 * @param intensity - Shift intensity
 * @returns Array of shifted OKLCH colors
 */
export function batchHueShift(
  colors: OKLCHColor[],
  shiftType: 'shadow' | 'highlight' | 'midtone',
  intensity: number
): OKLCHColor[] {
  return colors.map(color => 
    basicHueShift(color, shiftType, intensity)
  );
}

/**
 * Pre-compute color lookup table for pixel art
 * @param baseColors - Array of base OKLCH colors
 * @param shiftTypes - Array of shift types
 * @param intensities - Array of intensities
 * @returns Map of color keys to shifted colors
 */
export function createColorLookupTable(
  baseColors: OKLCHColor[],
  shiftTypes: Array<'shadow' | 'highlight' | 'midtone'> = ['shadow', 'highlight', 'midtone'],
  intensities: number[] = [0.3, 0.5, 0.7]
): Map<string, OKLCHColor> {
  const lookup = new Map<string, OKLCHColor>();
  
  baseColors.forEach((baseColor, baseIndex) => {
    shiftTypes.forEach((shiftType, shiftIndex) => {
      intensities.forEach((intensity, intensityIndex) => {
        const shifted = basicHueShift(baseColor, shiftType, intensity);
        const key = `${baseIndex}-${shiftIndex}-${intensityIndex}`;
        lookup.set(key, shifted);
      });
    });
  });
  
  return lookup;
}

/**
 * Optimized color interpolation for smooth transitions
 * @param color1 - First OKLCH color
 * @param color2 - Second OKLCH color
 * @param steps - Number of interpolation steps
 * @returns Array of interpolated OKLCH colors
 */
export function interpolateColors(
  color1: OKLCHColor,
  color2: OKLCHColor,
  steps: number = 10
): OKLCHColor[] {
  const colors: OKLCHColor[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const l = color1.l + (color2.l - color1.l) * t;
    const c = color1.c + (color2.c - color1.c) * t;
    
    // Handle hue interpolation with shortest path
    let h = color1.h + (color2.h - color1.h) * t;
    if (Math.abs(color2.h - color1.h) > 180) {
      h = color1.h + ((color2.h - color1.h) % 360) * t;
    }
    h = (h + 360) % 360;
    
    colors.push({ l, c, h });
  }
  
  return colors;
}
