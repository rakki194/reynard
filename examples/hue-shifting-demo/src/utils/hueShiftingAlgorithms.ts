/**
 * OKLCH Hue Shifting Algorithms for Demo
 * Core algorithms moved from research documentation
 */

import type { OKLCHColor } from 'reynard-colors';

/**
 * Basic hue shifting algorithm for pixel art
 * @param baseColor - Base OKLCH color
 * @param shiftType - Type of shift (shadow, highlight, midtone)
 * @param intensity - Shift intensity (0-1)
 * @returns Shifted OKLCH color
 */
export function basicHueShift(
  baseColor: OKLCHColor,
  shiftType: 'shadow' | 'highlight' | 'midtone',
  intensity: number = 0.3
): OKLCHColor {
  const { l, c, h } = baseColor;
  
  switch (shiftType) {
    case 'shadow':
      return {
        l: Math.max(0, l - (intensity * 30)), // Darker
        c: Math.min(0.4, c + (intensity * 0.1)), // More saturated
        h: (h - (intensity * 20) + 360) % 360 // Shift toward cooler colors
      };
    
    case 'highlight':
      return {
        l: Math.min(100, l + (intensity * 25)), // Lighter
        c: Math.min(0.4, c + (intensity * 0.05)), // Slightly more saturated
        h: (h + (intensity * 15) + 360) % 360 // Shift toward warmer colors
      };
    
    case 'midtone':
      return {
        l: l, // Keep same lightness
        c: Math.min(0.4, c + (intensity * 0.08)), // Increase saturation
        h: (h + (intensity * 5) + 360) % 360 // Subtle hue shift
      };
  }
}

/**
 * Generate a complete color ramp with hue shifting
 * @param baseColor - Base OKLCH color
 * @param stops - Number of color stops
 * @param shadowShift - Shadow hue shift amount
 * @param highlightShift - Highlight hue shift amount
 * @returns Array of OKLCH colors
 */
export function generateHueShiftRamp(
  baseColor: OKLCHColor,
  stops: number = 5,
  shadowShift: number = 25,
  highlightShift: number = 20
): OKLCHColor[] {
  const colors: OKLCHColor[] = [];
  const { l, c, h } = baseColor;
  
  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1); // 0 to 1
    const lightness = l + (t - 0.5) * 40; // -20 to +20 from base
    const chroma = c + Math.sin(t * Math.PI) * 0.1; // Peak at middle
    
    // Calculate hue shift based on position
    let hueShift = 0;
    if (t < 0.5) {
      // Shadow side - shift toward cooler colors
      hueShift = -shadowShift * (0.5 - t) * 2;
    } else {
      // Highlight side - shift toward warmer colors
      hueShift = highlightShift * (t - 0.5) * 2;
    }
    
    colors.push({
      l: Math.max(0, Math.min(100, lightness)),
      c: Math.max(0.05, Math.min(0.4, chroma)),
      h: (h + hueShift + 360) % 360
    });
  }
  
  return colors;
}

/**
 * Material-specific hue shifting patterns
 */
export const MATERIAL_PATTERNS = {
  metal: {
    shadowShift: 30,
    highlightShift: 15,
    chromaBoost: 0.15,
    lightnessRange: 50
  },
  skin: {
    shadowShift: 20,
    highlightShift: 25,
    chromaBoost: 0.08,
    lightnessRange: 35
  },
  fabric: {
    shadowShift: 15,
    highlightShift: 10,
    chromaBoost: 0.05,
    lightnessRange: 40
  },
  plastic: {
    shadowShift: 10,
    highlightShift: 20,
    chromaBoost: 0.12,
    lightnessRange: 45
  }
} as const;

/**
 * Apply material-specific hue shifting
 * @param baseColor - Base OKLCH color
 * @param material - Material type
 * @param intensity - Shift intensity (0-1)
 * @returns Material-adjusted colors
 */
export function materialHueShift(
  baseColor: OKLCHColor,
  material: keyof typeof MATERIAL_PATTERNS,
  intensity: number = 1.0
): { shadow: OKLCHColor; base: OKLCHColor; highlight: OKLCHColor } {
  const pattern = MATERIAL_PATTERNS[material];
  const { l, c, h } = baseColor;
  
  return {
    shadow: {
      l: Math.max(0, l - (pattern.lightnessRange * 0.6 * intensity)),
      c: Math.min(0.4, c + (pattern.chromaBoost * intensity)),
      h: (h - (pattern.shadowShift * intensity) + 360) % 360
    },
    base: {
      l: l,
      c: c,
      h: h
    },
    highlight: {
      l: Math.min(100, l + (pattern.lightnessRange * 0.4 * intensity)),
      c: Math.min(0.4, c + (pattern.chromaBoost * 0.5 * intensity)),
      h: (h + (pattern.highlightShift * intensity) + 360) % 360
    }
  };
}
