/**
 * OKLCH Color Ramping Algorithms for Demo
 * Renamed from "hue shifting" - these create artistic color variations
 * For true hue shifting, use the new hueShifting utilities
 */

import type { OKLCHColor } from "reynard-colors";
import {
  basicColorRamp as reynardBasicColorRamp,
  generateColorRamp as reynardGenerateColorRamp,
  applyMaterialPattern,
  getMaterialPattern,
  type MaterialType,
} from "reynard-colors";

/**
 * Basic color ramping algorithm for pixel art
 * @param baseColor - Base OKLCH color
 * @param shiftType - Type of shift (shadow, highlight, midtone)
 * @param intensity - Shift intensity (0-1)
 * @returns Ramped OKLCH color
 */
export function basicColorRamp(
  baseColor: OKLCHColor,
  shiftType: "shadow" | "highlight" | "midtone",
  intensity: number = 0.3
): OKLCHColor {
  return reynardBasicColorRamp(baseColor, shiftType, intensity);
}

/**
 * Generate a complete color ramp with artistic variations
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
  return reynardGenerateColorRamp(baseColor, stops, shadowShift, highlightShift);
}

/**
 * Material-specific color ramping patterns
 * Now using the advanced material pattern system
 */
export const MATERIAL_PATTERNS = {
  metal: getMaterialPattern("metal"),
  skin: getMaterialPattern("skin"),
  fabric: getMaterialPattern("fabric"),
  plastic: getMaterialPattern("plastic"),
  wood: getMaterialPattern("wood"),
  stone: getMaterialPattern("stone"),
  glass: getMaterialPattern("glass"),
  ceramic: getMaterialPattern("ceramic"),
  leather: getMaterialPattern("leather"),
  custom: getMaterialPattern("custom"),
} as const;

/**
 * Apply material-specific color ramping
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
  return applyMaterialPattern(baseColor, material as MaterialType, intensity);
}
