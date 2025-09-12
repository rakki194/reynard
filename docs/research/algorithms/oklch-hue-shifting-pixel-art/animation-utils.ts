/**
 * Animation Utilities for OKLCH Hue Shifting
 * Functions for creating animated color effects
 */

import type { OKLCHColor } from "reynard-colors";
import { temporalHueShift } from "./core-algorithms";

/**
 * Generate color animation keyframes
 * @param baseColor - Base OKLCH color
 * @param keyframeCount - Number of keyframes
 * @param animationType - Type of animation
 * @returns Array of OKLCH colors for keyframes
 */
export function generateColorKeyframes(
  baseColor: OKLCHColor,
  keyframeCount: number = 8,
  animationType: "pulse" | "shift" | "fade" = "pulse",
): OKLCHColor[] {
  const keyframes: OKLCHColor[] = [];

  for (let i = 0; i < keyframeCount; i++) {
    const t = i / (keyframeCount - 1);
    let animatedColor: OKLCHColor;

    switch (animationType) {
      case "pulse":
        animatedColor = {
          l: baseColor.l + Math.sin(t * Math.PI * 2) * 10,
          c: baseColor.c + Math.sin(t * Math.PI * 2) * 0.05,
          h: baseColor.h,
        };
        break;

      case "shift":
        animatedColor = temporalHueShift(baseColor, t, 1.0);
        break;

      case "fade":
        animatedColor = {
          l: baseColor.l,
          c: baseColor.c * (1 - t * 0.5),
          h: baseColor.h,
        };
        break;
    }

    keyframes.push(animatedColor);
  }

  return keyframes;
}

/**
 * Create breathing animation effect
 * @param baseColor - Base OKLCH color
 * @param keyframeCount - Number of keyframes
 * @param intensity - Animation intensity
 * @returns Array of OKLCH colors for breathing effect
 */
export function createBreathingAnimation(
  baseColor: OKLCHColor,
  keyframeCount: number = 16,
  intensity: number = 0.2,
): OKLCHColor[] {
  const keyframes: OKLCHColor[] = [];

  for (let i = 0; i < keyframeCount; i++) {
    const t = i / (keyframeCount - 1);
    const breathCycle = Math.sin(t * Math.PI * 2);

    keyframes.push({
      l: baseColor.l + breathCycle * intensity * 20,
      c: baseColor.c + breathCycle * intensity * 0.1,
      h: baseColor.h,
    });
  }

  return keyframes;
}

/**
 * Create shimmer animation effect
 * @param baseColor - Base OKLCH color
 * @param keyframeCount - Number of keyframes
 * @param shimmerIntensity - Shimmer effect intensity
 * @returns Array of OKLCH colors for shimmer effect
 */
export function createShimmerAnimation(
  baseColor: OKLCHColor,
  keyframeCount: number = 12,
  shimmerIntensity: number = 0.3,
): OKLCHColor[] {
  const keyframes: OKLCHColor[] = [];

  for (let i = 0; i < keyframeCount; i++) {
    const t = i / (keyframeCount - 1);
    const shimmerCycle = Math.sin(t * Math.PI * 4); // Faster oscillation

    keyframes.push({
      l: baseColor.l + shimmerCycle * shimmerIntensity * 15,
      c: baseColor.c + Math.abs(shimmerCycle) * shimmerIntensity * 0.15,
      h: baseColor.h + shimmerCycle * shimmerIntensity * 10,
    });
  }

  return keyframes;
}

/**
 * Create color cycling animation
 * @param baseColor - Base OKLCH color
 * @param keyframeCount - Number of keyframes
 * @param cycleRange - Hue range for cycling
 * @returns Array of OKLCH colors for cycling effect
 */
export function createColorCyclingAnimation(
  baseColor: OKLCHColor,
  keyframeCount: number = 20,
  cycleRange: number = 60,
): OKLCHColor[] {
  const keyframes: OKLCHColor[] = [];

  for (let i = 0; i < keyframeCount; i++) {
    const t = i / (keyframeCount - 1);
    const hueShift = Math.sin(t * Math.PI * 2) * cycleRange;

    keyframes.push({
      l: baseColor.l,
      c: baseColor.c,
      h: (baseColor.h + hueShift + 360) % 360,
    });
  }

  return keyframes;
}

/**
 * Create fade in/out animation
 * @param baseColor - Base OKLCH color
 * @param keyframeCount - Number of keyframes
 * @param fadeType - Type of fade effect
 * @returns Array of OKLCH colors for fade effect
 */
export function createFadeAnimation(
  baseColor: OKLCHColor,
  keyframeCount: number = 10,
  fadeType: "in" | "out" | "inout" = "inout",
): OKLCHColor[] {
  const keyframes: OKLCHColor[] = [];

  for (let i = 0; i < keyframeCount; i++) {
    const t = i / (keyframeCount - 1);
    let alpha: number;

    switch (fadeType) {
      case "in":
        alpha = t;
        break;
      case "out":
        alpha = 1 - t;
        break;
      case "inout":
        alpha = t < 0.5 ? t * 2 : 2 - t * 2;
        break;
    }

    keyframes.push({
      l: baseColor.l,
      c: baseColor.c * alpha,
      h: baseColor.h,
    });
  }

  return keyframes;
}

/**
 * Create rainbow animation effect
 * @param baseColor - Base OKLCH color
 * @param keyframeCount - Number of keyframes
 * @param saturation - Saturation level for rainbow
 * @returns Array of OKLCH colors for rainbow effect
 */
export function createRainbowAnimation(
  baseColor: OKLCHColor,
  keyframeCount: number = 24,
  saturation: number = 0.3,
): OKLCHColor[] {
  const keyframes: OKLCHColor[] = [];

  for (let i = 0; i < keyframeCount; i++) {
    const t = i / (keyframeCount - 1);
    const hue = (t * 360) % 360;

    keyframes.push({
      l: baseColor.l,
      c: saturation,
      h: hue,
    });
  }

  return keyframes;
}
