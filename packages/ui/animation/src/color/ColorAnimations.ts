/**
 * 🦊 Color Animation System
 * 
 * Unified color animation functions consolidated from the colors package.
 * Provides smooth color transitions with easing and fallback support.
 */

import type { OKLCHColor } from "reynard-colors";
import { Easing } from "../easing/easing.js";

export interface ColorAnimationOptions {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Easing function to use */
  easing?: keyof typeof Easing;
  /** Whether to use fallback animations when package unavailable */
  useFallback?: boolean;
  /** Whether to respect global animation control */
  respectGlobalControl?: boolean;
}

export interface HueShiftOptions extends ColorAnimationOptions {
  /** Maximum hue shift amount in degrees */
  deltaH?: number;
  /** Progress value (0-1) */
  progress?: number;
}

/**
 * Shift hue with easing function for smooth transitions
 * Consolidated from packages/colors/src/utils/hueShifting.ts
 * 
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
  easingFunction: (t: number) => number = Easing.linear
): OKLCHColor {
  const easedProgress = easingFunction(progress);
  const actualDeltaH = deltaH * easedProgress;

  return pureHueShift(baseColor, actualDeltaH);
}

/**
 * Pure hue shift without easing
 * 
 * @param baseColor - Base OKLCH color
 * @param deltaH - Hue shift amount in degrees
 * @returns Shifted OKLCH color
 */
export function pureHueShift(baseColor: OKLCHColor, deltaH: number): OKLCHColor {
  return {
    ...baseColor,
    h: (baseColor.h + deltaH) % 360,
  };
}

/**
 * Batch hue shift multiple colors
 * 
 * @param colors - Array of OKLCH colors
 * @param deltaH - Hue shift amount in degrees
 * @returns Array of shifted OKLCH colors
 */
export function batchHueShift(colors: OKLCHColor[], deltaH: number): OKLCHColor[] {
  return colors.map(color => pureHueShift(color, deltaH));
}

/**
 * Enhanced easing functions specifically for color animations
 * Consolidated from packages/colors/src/utils/hueShifting.ts
 */
export const ColorEasingFunctions = {
  linear: Easing.linear,
  easeInQuad: Easing.easeInQuad,
  easeOutQuad: Easing.easeOutQuad,
  easeInOutQuad: Easing.easeInOutQuad,
  easeInCubic: Easing.easeInCubic,
  easeOutCubic: Easing.easeOutCubic,
  easeInOutCubic: Easing.easeInOutCubic,
  easeInElastic: Easing.easeInElastic,
  easeOutElastic: Easing.easeOutElastic,
  easeInOutElastic: Easing.easeInOutElastic,
  easeInBounce: Easing.easeInBounce,
  easeOutBounce: Easing.easeOutBounce,
  easeInOutBounce: Easing.easeInOutBounce,
} as const;

/**
 * Create a smooth color transition between two colors
 * 
 * @param startColor - Starting OKLCH color
 * @param endColor - Ending OKLCH color
 * @param progress - Progress value (0-1)
 * @param easingFunction - Easing function
 * @returns Interpolated OKLCH color
 */
export function interpolateColor(
  startColor: OKLCHColor,
  endColor: OKLCHColor,
  progress: number,
  easingFunction: (t: number) => number = Easing.linear
): OKLCHColor {
  const easedProgress = easingFunction(progress);
  
  return {
    l: startColor.l + (endColor.l - startColor.l) * easedProgress,
    c: startColor.c + (endColor.c - startColor.c) * easedProgress,
    h: interpolateHue(startColor.h, endColor.h, easedProgress),
  };
}

/**
 * Interpolate hue values considering the circular nature of hue
 * 
 * @param startHue - Starting hue
 * @param endHue - Ending hue
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated hue value
 */
export function interpolateHue(startHue: number, endHue: number, t: number): number {
  // Handle hue wrapping (0-360 degrees)
  let diff = endHue - startHue;
  
  if (diff > 180) {
    diff -= 360;
  } else if (diff < -180) {
    diff += 360;
  }
  
  const result = startHue + diff * t;
  return ((result % 360) + 360) % 360;
}

/**
 * Create a color ramp with custom easing
 * 
 * @param baseColor - Base OKLCH color
 * @param targetColor - Target OKLCH color
 * @param stops - Number of intermediate stops
 * @param easingFunction - Easing function
 * @returns Array of interpolated OKLCH colors
 */
export function generateEasedColorRamp(
  baseColor: OKLCHColor,
  targetColor: OKLCHColor,
  stops: number = 5,
  easingFunction: (t: number) => number = Easing.linear
): OKLCHColor[] {
  const colors: OKLCHColor[] = [];

  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1);
    const interpolated = interpolateColor(baseColor, targetColor, t, easingFunction);
    colors.push(interpolated);
  }

  return colors;
}

/**
 * Create a hue shift ramp with easing
 * 
 * @param baseColor - Base OKLCH color
 * @param stops - Number of stops
 * @param maxShift - Maximum hue shift
 * @param easingFunction - Easing function
 * @returns Array of hue-shifted colors
 */
export function generateEasedHueRamp(
  baseColor: OKLCHColor,
  stops: number = 5,
  maxShift: number = 60,
  easingFunction: (t: number) => number = Easing.linear
): OKLCHColor[] {
  const colors: OKLCHColor[] = [];

  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1);
    const eased = easedHueShift(baseColor, maxShift, t, easingFunction);
    colors.push(eased);
  }

  return colors;
}

/**
 * Smart color animation with fallback support
 * 
 * @param startColor - Starting color
 * @param endColor - Ending color
 * @param options - Animation options
 * @returns Promise that resolves when animation completes
 */
export async function animateColorTransition(
  startColor: OKLCHColor,
  endColor: OKLCHColor,
  options: ColorAnimationOptions = {}
): Promise<OKLCHColor[]> {
  const {
    duration = 300,
    easing = "linear",
    useFallback = true,
    respectGlobalControl = true,
  } = options;

  // Check if animations should be disabled
  if (respectGlobalControl && shouldDisableColorAnimations()) {
    return [endColor]; // Immediate completion
  }

  // Use fallback system if needed
  if (useFallback && !isColorAnimationPackageAvailable()) {
    return createFallbackColorTransition(startColor, endColor, options);
  }

  // Use full animation system
  return createFullColorTransition(startColor, endColor, options);
}

/**
 * Check if color animations should be disabled
 */
function shouldDisableColorAnimations(): boolean {
  if (typeof window === "undefined") return true;
  
  // Check for reduced motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }

  // Check for performance mode
  if (document.documentElement.classList.contains("performance-mode")) {
    return true;
  }

  // Check for animations disabled globally
  if (document.documentElement.classList.contains("animations-disabled")) {
    return true;
  }

  return false;
}

/**
 * Check if color animation package is available
 */
function isColorAnimationPackageAvailable(): boolean {
  try {
    // Try to access color animation functions
    return typeof easedHueShift === "function";
  } catch {
    return false;
  }
}

/**
 * Create fallback color transition
 */
async function createFallbackColorTransition(
  startColor: OKLCHColor,
  endColor: OKLCHColor,
  options: ColorAnimationOptions
): Promise<OKLCHColor[]> {
  const { duration = 300, easing = "linear" } = options;
  
  // Simple fallback: return end color immediately
  return [endColor];
}

/**
 * Create full color transition
 */
async function createFullColorTransition(
  startColor: OKLCHColor,
  endColor: OKLCHColor,
  options: ColorAnimationOptions
): Promise<OKLCHColor[]> {
  const { duration = 300, easing = "linear" } = options;
  
  // Create smooth transition with multiple steps
  const steps = Math.max(2, Math.floor(duration / 16)); // ~60fps
  const easingFunction = ColorEasingFunctions[easing] || Easing.linear;
  
  return generateEasedColorRamp(startColor, endColor, steps, easingFunction);
}
