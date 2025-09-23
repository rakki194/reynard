/**
 * 🦊 Color Animation System
 * 
 * Smart import system for color animations with fallback support.
 * Integrates with the unified animation system.
 */

import type { OKLCHColor } from "reynard-colors";
import { 
  easedHueShift,
  pureHueShift,
  batchHueShift,
  interpolateColor,
  generateEasedColorRamp,
  generateEasedHueRamp,
  animateColorTransition,
  ColorEasingFunctions,
  type ColorAnimationOptions, 
  type HueShiftOptions 
} from "./ColorAnimations.js";

/**
 * Smart import system for color animation package
 */
async function importColorAnimationPackage(): Promise<unknown | null> {
  try {
    // Dynamic import with type assertion for optional dependency
    const colorModule = await import("reynard-colors" as string);
    return colorModule;
  } catch (error) {
    console.warn("🦊 ColorAnimation: Color package not available, using fallback");
    return null;
  }
}

/**
 * Import fallback animation system
 */
async function importFallbackSystem(): Promise<unknown | null> {
  try {
    // Dynamic import with type assertion for optional dependency
    const fallbackModule = await import("reynard-composables" as string);
    return (fallbackModule as Record<string, unknown>).useAnimationFallback;
  } catch (error) {
    console.warn("🦊 ColorAnimation: Fallback system not available");
    return null;
  }
}

/**
 * Import global animation control
 */
async function importGlobalControl(): Promise<unknown | null> {
  try {
    // Dynamic import with type assertion for optional dependency
    const controlModule = await import("reynard-composables" as string);
    return (controlModule as Record<string, unknown>).useAnimationControl;
  } catch (error) {
    console.warn("🦊 ColorAnimation: Global animation control not available");
    return null;
  }
}

export interface ColorAnimationSystemState {
  /** Current animation engine being used */
  animationEngine: () => "full" | "fallback" | "disabled";
  /** Whether animations are currently disabled */
  isAnimationsDisabled: () => boolean;
  /** Whether color package is available */
  isColorPackageAvailable: () => boolean;
}

/**
 * Create color animation system with smart imports
 */
export function createColorAnimationSystem(): {
  state: ColorAnimationSystemState;
  functions: {
    easedHueShift: typeof easedHueShift;
    pureHueShift: typeof pureHueShift;
    batchHueShift: typeof batchHueShift;
    interpolateColor: typeof interpolateColor;
    generateEasedColorRamp: typeof generateEasedColorRamp;
    generateEasedHueRamp: typeof generateEasedHueRamp;
    animateColorTransition: typeof animateColorTransition;
  };
} {
  let animationEngine: "full" | "fallback" | "disabled" = "full";
  let isAnimationsDisabled = false;
  let isColorPackageAvailable = false;
  let fallbackSystem: unknown = null;
  let globalControl: unknown = null;

  // Initialize animation system
  const initializeAnimationSystem = async () => {
    try {
      // Try to import global animation control first
      const controlModule = await importGlobalControl();
      if (controlModule) {
        globalControl = controlModule;
      }

      // Try to import color package
      const colorModule = await importColorAnimationPackage();
      if (colorModule) {
        isColorPackageAvailable = true;
        animationEngine = "full";
        return;
      }

      // Fallback to CSS-based animations
      const fallbackModule = await importFallbackSystem();
      if (fallbackModule) {
        fallbackSystem = fallbackModule;
        animationEngine = "fallback";
        return;
      }

      // No animation system available
      animationEngine = "disabled";
    } catch (error) {
      console.warn("🦊 ColorAnimation: Failed to initialize animation system:", error);
      animationEngine = "disabled";
    }
  };

  // Initialize on creation
  initializeAnimationSystem();

  // Check if animations should be disabled
  const checkAnimationsDisabled = () => {
    if (animationEngine === "disabled") return true;
    
    if (globalControl) {
      const control = globalControl as Record<string, unknown>;
      const isDisabled = control.isAnimationsDisabled as (() => boolean) | undefined;
      return isDisabled?.() || false;
    }
    
    return false;
  };

  // Enhanced color animation functions with smart imports
  const enhancedEasedHueShift = (
    baseColor: OKLCHColor,
    deltaH: number,
    progress: number,
    easingFunction?: (t: number) => number
  ): OKLCHColor => {
    if (checkAnimationsDisabled()) {
      return baseColor; // No animation when disabled
    }

    return easedHueShift(baseColor, deltaH, progress, easingFunction);
  };

  const enhancedPureHueShift = (baseColor: OKLCHColor, deltaH: number): OKLCHColor => {
    if (checkAnimationsDisabled()) {
      return baseColor; // No animation when disabled
    }

    return pureHueShift(baseColor, deltaH);
  };

  const enhancedBatchHueShift = (colors: OKLCHColor[], deltaH: number): OKLCHColor[] => {
    if (checkAnimationsDisabled()) {
      return colors; // No animation when disabled
    }

    return batchHueShift(colors, deltaH);
  };

  const enhancedInterpolateColor = (
    startColor: OKLCHColor,
    endColor: OKLCHColor,
    progress: number,
    easingFunction?: (t: number) => number
  ): OKLCHColor => {
    if (checkAnimationsDisabled()) {
      return endColor; // Immediate completion when disabled
    }

    return interpolateColor(startColor, endColor, progress, easingFunction);
  };

  const enhancedGenerateEasedColorRamp = (
    baseColor: OKLCHColor,
    targetColor: OKLCHColor,
    stops: number = 5,
    easingFunction?: (t: number) => number
  ): OKLCHColor[] => {
    if (checkAnimationsDisabled()) {
      return [targetColor]; // Single color when disabled
    }

    return generateEasedColorRamp(baseColor, targetColor, stops, easingFunction);
  };

  const enhancedGenerateEasedHueRamp = (
    baseColor: OKLCHColor,
    stops: number = 5,
    maxShift: number = 60,
    easingFunction?: (t: number) => number
  ): OKLCHColor[] => {
    if (checkAnimationsDisabled()) {
      return [baseColor]; // Single color when disabled
    }

    return generateEasedHueRamp(baseColor, stops, maxShift, easingFunction);
  };

  const enhancedAnimateColorTransition = async (
    startColor: OKLCHColor,
    endColor: OKLCHColor,
    options: ColorAnimationOptions = {}
  ): Promise<OKLCHColor[]> => {
    if (checkAnimationsDisabled()) {
      return [endColor]; // Immediate completion when disabled
    }

    return animateColorTransition(startColor, endColor, options);
  };

  const state: ColorAnimationSystemState = {
    animationEngine: () => animationEngine,
    isAnimationsDisabled: checkAnimationsDisabled,
    isColorPackageAvailable: () => isColorPackageAvailable,
  };

  const functions = {
    easedHueShift: enhancedEasedHueShift,
    pureHueShift: enhancedPureHueShift,
    batchHueShift: enhancedBatchHueShift,
    interpolateColor: enhancedInterpolateColor,
    generateEasedColorRamp: enhancedGenerateEasedColorRamp,
    generateEasedHueRamp: enhancedGenerateEasedHueRamp,
    animateColorTransition: enhancedAnimateColorTransition,
  };

  return { state, functions };
}

/**
 * Global color animation system instance
 */
let globalColorAnimationSystem: ReturnType<typeof createColorAnimationSystem> | null = null;

/**
 * Get or create the global color animation system
 */
export function getColorAnimationSystem() {
  if (!globalColorAnimationSystem) {
    globalColorAnimationSystem = createColorAnimationSystem();
  }
  return globalColorAnimationSystem;
}

/**
 * Reset the global color animation system
 */
export function resetColorAnimationSystem() {
  globalColorAnimationSystem = null;
}
