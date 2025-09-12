/**
 * Material-Based Hue Shifting Patterns
 * Material-specific hue shifting for different surface types
 */

import type { OKLCHColor } from "reynard-colors";

/**
 * Material-specific hue shifting patterns
 */
export const MATERIAL_PATTERNS = {
  metal: {
    shadowShift: 30,
    highlightShift: 15,
    chromaBoost: 0.15,
    lightnessRange: 50,
  },
  skin: {
    shadowShift: 20,
    highlightShift: 25,
    chromaBoost: 0.08,
    lightnessRange: 35,
  },
  fabric: {
    shadowShift: 15,
    highlightShift: 10,
    chromaBoost: 0.05,
    lightnessRange: 40,
  },
  plastic: {
    shadowShift: 10,
    highlightShift: 20,
    chromaBoost: 0.12,
    lightnessRange: 45,
  },
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
  intensity: number = 1.0,
): { shadow: OKLCHColor; base: OKLCHColor; highlight: OKLCHColor } {
  const pattern = MATERIAL_PATTERNS[material];
  const { l, c, h } = baseColor;

  return {
    shadow: {
      l: Math.max(0, l - pattern.lightnessRange * 0.6 * intensity),
      c: Math.min(0.4, c + pattern.chromaBoost * intensity),
      h: (h - pattern.shadowShift * intensity + 360) % 360,
    },
    base: {
      l: l,
      c: c,
      h: h,
    },
    highlight: {
      l: Math.min(100, l + pattern.lightnessRange * 0.4 * intensity),
      c: Math.min(0.4, c + pattern.chromaBoost * 0.5 * intensity),
      h: (h + pattern.highlightShift * intensity + 360) % 360,
    },
  };
}

/**
 * Get material pattern configuration
 * @param material - Material type
 * @returns Material pattern configuration
 */
export function getMaterialPattern(
  material: keyof typeof MATERIAL_PATTERNS,
): (typeof MATERIAL_PATTERNS)[keyof typeof MATERIAL_PATTERNS] {
  return MATERIAL_PATTERNS[material];
}

/**
 * Check if material type is supported
 * @param material - Material type to check
 * @returns True if material is supported
 */
export function isSupportedMaterial(
  material: string,
): material is keyof typeof MATERIAL_PATTERNS {
  return material in MATERIAL_PATTERNS;
}

/**
 * Get all supported material types
 * @returns Array of supported material types
 */
export function getSupportedMaterials(): (keyof typeof MATERIAL_PATTERNS)[] {
  return Object.keys(MATERIAL_PATTERNS) as (keyof typeof MATERIAL_PATTERNS)[];
}
