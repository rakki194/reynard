/**
 * Validation Utilities for OKLCH Colors
 * Functions for validating and sanitizing OKLCH color values
 */

import type { OKLCHColor } from "reynard-colors";

/**
 * Validate OKLCH color values
 * @param color - OKLCH color to validate
 * @returns True if color is valid
 */
export function validateOKLCHColor(color: OKLCHColor): boolean {
  return (
    typeof color.l === "number" &&
    color.l >= 0 &&
    color.l <= 100 &&
    typeof color.c === "number" &&
    color.c >= 0 &&
    color.c <= 0.4 &&
    typeof color.h === "number" &&
    color.h >= 0 &&
    color.h < 360
  );
}

/**
 * Clamp OKLCH color values to valid ranges
 * @param color - OKLCH color to clamp
 * @returns Clamped OKLCH color
 */
export function clampOKLCHColor(color: OKLCHColor): OKLCHColor {
  return {
    l: Math.max(0, Math.min(100, color.l)),
    c: Math.max(0, Math.min(0.4, color.c)),
    h: ((color.h % 360) + 360) % 360,
  };
}

/**
 * Validate array of OKLCH colors
 * @param colors - Array of OKLCH colors
 * @returns True if all colors are valid
 */
export function validateOKLCHColorArray(colors: OKLCHColor[]): boolean {
  return colors.every((color) => validateOKLCHColor(color));
}

/**
 * Sanitize array of OKLCH colors by clamping invalid values
 * @param colors - Array of OKLCH colors
 * @returns Array of sanitized OKLCH colors
 */
export function sanitizeOKLCHColorArray(colors: OKLCHColor[]): OKLCHColor[] {
  return colors.map((color) => clampOKLCHColor(color));
}

/**
 * Check if two OKLCH colors are approximately equal
 * @param color1 - First OKLCH color
 * @param color2 - Second OKLCH color
 * @param tolerance - Tolerance for comparison
 * @returns True if colors are approximately equal
 */
export function colorsApproximatelyEqual(
  color1: OKLCHColor,
  color2: OKLCHColor,
  tolerance: number = 0.01,
): boolean {
  return (
    Math.abs(color1.l - color2.l) < tolerance &&
    Math.abs(color1.c - color2.c) < tolerance &&
    Math.abs(color1.h - color2.h) < tolerance
  );
}

/**
 * Validate color shift parameters
 * @param shiftType - Type of color shift
 * @param intensity - Shift intensity
 * @returns True if parameters are valid
 */
export function validateShiftParameters(
  shiftType: string,
  intensity: number,
): boolean {
  const validShiftTypes = ["shadow", "highlight", "midtone"];
  return (
    validShiftTypes.includes(shiftType) &&
    typeof intensity === "number" &&
    intensity >= 0 &&
    intensity <= 1
  );
}

/**
 * Validate animation parameters
 * @param keyframeCount - Number of keyframes
 * @param animationType - Type of animation
 * @returns True if parameters are valid
 */
export function validateAnimationParameters(
  keyframeCount: number,
  animationType: string,
): boolean {
  const validAnimationTypes = [
    "pulse",
    "shift",
    "fade",
    "breathing",
    "shimmer",
    "cycling",
    "rainbow",
  ];
  return (
    typeof keyframeCount === "number" &&
    keyframeCount > 0 &&
    keyframeCount <= 100 &&
    validAnimationTypes.includes(animationType)
  );
}

/**
 * Validate material type
 * @param material - Material type to validate
 * @returns True if material type is valid
 */
export function validateMaterialType(material: string): boolean {
  const validMaterials = ["metal", "skin", "fabric", "plastic"];
  return validMaterials.includes(material);
}

/**
 * Get validation errors for OKLCH color
 * @param color - OKLCH color to validate
 * @returns Array of validation error messages
 */
export function getOKLCHValidationErrors(color: OKLCHColor): string[] {
  const errors: string[] = [];

  if (typeof color.l !== "number" || color.l < 0 || color.l > 100) {
    errors.push(
      `Lightness (l) must be a number between 0 and 100, got: ${color.l}`,
    );
  }

  if (typeof color.c !== "number" || color.c < 0 || color.c > 0.4) {
    errors.push(
      `Chroma (c) must be a number between 0 and 0.4, got: ${color.c}`,
    );
  }

  if (typeof color.h !== "number" || color.h < 0 || color.h >= 360) {
    errors.push(`Hue (h) must be a number between 0 and 360, got: ${color.h}`);
  }

  return errors;
}
