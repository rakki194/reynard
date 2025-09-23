/**
 * Proper Hue Shifting Algorithms
 * Implements true OKLCH hue shifting that preserves lightness and chroma
 * Migrated to use unified animation system
 */

import type { OKLCHColor } from "../types";
import { clampToGamut, handleEdgeCases } from "./colorConversion";

// Smart import for unified animation system
let animationPackage: unknown = null;
let isPackageAvailable = false;

const checkAnimationPackageAvailability = async () => {
  try {
    const packageCheck = await import("reynard-animation");
    if (packageCheck && packageCheck.useColorAnimation) {
      animationPackage = packageCheck;
      isPackageAvailable = true;
      return true;
    }
  } catch (error) {
    console.warn("🦊 Colors: reynard-animation package not available, using fallback color animations");
  }
  return false;
};

// Initialize package availability
checkAnimationPackageAvailability();

/**
 * Pure hue shift that preserves lightness and chroma
 * This is the mathematically correct way to shift hue in OKLCH
 * @param baseColor - Base OKLCH color
 * @param deltaH - Hue shift amount in degrees
 * @returns Shifted OKLCH color with same L and C
 */
export function pureHueShift(baseColor: OKLCHColor, deltaH: number): OKLCHColor {
  const shifted = {
    l: baseColor.l, // PRESERVE lightness
    c: baseColor.c, // PRESERVE chroma
    h: (baseColor.h + deltaH + 360) % 360, // ONLY shift hue
  };

  // Handle edge cases and ensure gamut compliance
  return handleEdgeCases(clampToGamut(shifted));
}

/**
 * Generate a hue shift ramp with pure hue shifting
 * @param baseColor - Base OKLCH color
 * @param stops - Number of color stops
 * @param hueRange - Total hue range to cover (degrees)
 * @returns Array of OKLCH colors with pure hue shifts
 */
export function generateHueShiftRamp(baseColor: OKLCHColor, stops: number = 5, hueRange: number = 60): OKLCHColor[] {
  const colors: OKLCHColor[] = [];
  const hueStep = hueRange / (stops - 1);

  for (let i = 0; i < stops; i++) {
    const hueOffset = i * hueStep;
    const shiftedColor = pureHueShift(baseColor, hueOffset);
    colors.push(shiftedColor);
  }

  return colors;
}

/**
 * Create a complementary color pair
 * @param baseColor - Base OKLCH color
 * @returns Array with base color and its complement
 */
export function createComplementaryPair(baseColor: OKLCHColor): OKLCHColor[] {
  return [baseColor, pureHueShift(baseColor, 180)];
}

/**
 * Create a triadic color set
 * @param baseColor - Base OKLCH color
 * @returns Array with three colors 120° apart
 */
export function createTriadicSet(baseColor: OKLCHColor): OKLCHColor[] {
  return [baseColor, pureHueShift(baseColor, 120), pureHueShift(baseColor, 240)];
}

/**
 * Create a tetradic color set
 * @param baseColor - Base OKLCH color
 * @returns Array with four colors 90° apart
 */
export function createTetradicSet(baseColor: OKLCHColor): OKLCHColor[] {
  return [baseColor, pureHueShift(baseColor, 90), pureHueShift(baseColor, 180), pureHueShift(baseColor, 270)];
}

/**
 * Create an analogous color set
 * @param baseColor - Base OKLCH color
 * @param count - Number of colors to generate
 * @param spread - Total hue spread in degrees
 * @returns Array of analogous colors
 */
export function createAnalogousSet(baseColor: OKLCHColor, count: number = 5, spread: number = 60): OKLCHColor[] {
  const colors: OKLCHColor[] = [];
  const step = spread / (count - 1);
  const startOffset = -spread / 2;

  for (let i = 0; i < count; i++) {
    const hueOffset = startOffset + i * step;
    colors.push(pureHueShift(baseColor, hueOffset));
  }

  return colors;
}

/**
 * Shift hue while maintaining perceptual relationships
 * @param baseColor - Base OKLCH color
 * @param deltaH - Hue shift amount
 * @param preserveRelationships - Whether to maintain color relationships
 * @returns Shifted OKLCH color
 */
export function perceptualHueShift(
  baseColor: OKLCHColor,
  deltaH: number,
  preserveRelationships: boolean = true
): OKLCHColor {
  if (!preserveRelationships) {
    return pureHueShift(baseColor, deltaH);
  }

  // For perceptual relationships, we might want to make small adjustments
  // to L and C to maintain visual harmony, but keep them minimal
  const shifted = pureHueShift(baseColor, deltaH);

  // Optional: Make tiny adjustments for perceptual harmony
  // This is more of an artistic choice than mathematical necessity
  return shifted;
}

/**
 * Batch hue shift multiple colors by the same amount
 * @param colors - Array of OKLCH colors
 * @param deltaH - Hue shift amount in degrees
 * @returns Array of shifted OKLCH colors
 */
export function batchHueShift(colors: OKLCHColor[], deltaH: number): OKLCHColor[] {
  return colors.map(color => pureHueShift(color, deltaH));
}

/**
 * Shift hue with easing function for smooth transitions
 * @param baseColor - Base OKLCH color
 * @param deltaH - Maximum hue shift amount
 * @param progress - Progress value (0-1)
 * @param easingFunction - Easing function (default: linear)
 * @returns Shifted OKLCH color
 */
export function easedHueShift(
  baseColor: OKLCHColor,
  deltaH: number,
  progress: number,
  easingFunction: (t: number) => number = (t: number) => t
): OKLCHColor {
  const easedProgress = easingFunction(progress);
  const actualDeltaH = deltaH * easedProgress;

  return pureHueShift(baseColor, actualDeltaH);
}

/**
 * Common easing functions for smooth hue transitions
 */
export const EasingFunctions = {
  linear: (t: number) => t,
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  bounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
} as const;
