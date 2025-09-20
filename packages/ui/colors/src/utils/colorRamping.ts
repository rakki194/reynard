/**
 * Color Ramping Algorithms
 * Renamed from the original "hue shifting" - these create color variations
 * that modify lightness, chroma, and hue for artistic effects
 */

import type { OKLCHColor } from "../types";
import { clampToGamut, handleEdgeCases } from "./colorConversion";

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
  const { l, c, h } = baseColor;

  let ramped: OKLCHColor;

  switch (shiftType) {
    case "shadow":
      ramped = {
        l: Math.max(0, l - intensity * 30), // Darker
        c: Math.min(0.4, c + intensity * 0.1), // More saturated
        h: (h - intensity * 20 + 360) % 360, // Shift toward cooler colors
      };
      break;

    case "highlight":
      ramped = {
        l: Math.min(100, l + intensity * 25), // Lighter
        c: Math.min(0.4, c + intensity * 0.05), // Slightly more saturated
        h: (h + intensity * 15 + 360) % 360, // Shift toward warmer colors
      };
      break;

    case "midtone":
      ramped = {
        l: l, // Keep same lightness
        c: Math.min(0.4, c + intensity * 0.08), // Increase saturation
        h: (h + intensity * 5 + 360) % 360, // Subtle hue shift
      };
      break;
  }

  return handleEdgeCases(clampToGamut(ramped));
}

/**
 * Generate a complete color ramp with artistic color variations
 * @param baseColor - Base OKLCH color
 * @param stops - Number of color stops
 * @param shadowShift - Shadow hue shift amount
 * @param highlightShift - Highlight hue shift amount
 * @returns Array of OKLCH colors
 */
export function generateColorRamp(
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

    const ramped = {
      l: Math.max(0, Math.min(100, lightness)),
      c: Math.max(0.05, Math.min(0.4, chroma)),
      h: (h + hueShift + 360) % 360,
    };

    colors.push(handleEdgeCases(clampToGamut(ramped)));
  }

  return colors;
}

/**
 * Create a lightness-only ramp (monochromatic)
 * @param baseColor - Base OKLCH color
 * @param stops - Number of color stops
 * @param lightnessRange - Range of lightness variation
 * @returns Array of OKLCH colors with varying lightness
 */
export function generateLightnessRamp(
  baseColor: OKLCHColor,
  stops: number = 5,
  lightnessRange: number = 60
): OKLCHColor[] {
  const colors: OKLCHColor[] = [];
  const { c, h } = baseColor;

  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1);
    const lightness = baseColor.l + (t - 0.5) * lightnessRange;

    const ramped = {
      l: Math.max(0, Math.min(100, lightness)),
      c: c,
      h: h,
    };

    colors.push(handleEdgeCases(clampToGamut(ramped)));
  }

  return colors;
}

/**
 * Create a chroma-only ramp (saturation variation)
 * @param baseColor - Base OKLCH color
 * @param stops - Number of color stops
 * @param chromaRange - Range of chroma variation
 * @returns Array of OKLCH colors with varying chroma
 */
export function generateChromaRamp(baseColor: OKLCHColor, stops: number = 5, chromaRange: number = 0.3): OKLCHColor[] {
  const colors: OKLCHColor[] = [];
  const { l, h } = baseColor;

  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1);
    const chroma = Math.max(0.01, baseColor.c + (t - 0.5) * chromaRange);

    const ramped = {
      l: l,
      c: Math.min(0.4, chroma),
      h: h,
    };

    colors.push(handleEdgeCases(clampToGamut(ramped)));
  }

  return colors;
}

/**
 * Create a multi-dimensional color ramp
 * @param baseColor - Base OKLCH color
 * @param stops - Number of color stops
 * @param options - Ramping options
 * @returns Array of OKLCH colors
 */
export function generateMultiDimensionalRamp(
  baseColor: OKLCHColor,
  stops: number = 5,
  options: {
    lightnessRange?: number;
    chromaRange?: number;
    hueRange?: number;
    lightnessCurve?: "linear" | "sine" | "cosine";
    chromaCurve?: "linear" | "sine" | "cosine";
    hueCurve?: "linear" | "sine" | "cosine";
  } = {}
): OKLCHColor[] {
  const {
    lightnessRange = 40,
    chromaRange = 0.2,
    hueRange = 30,
    lightnessCurve = "linear",
    chromaCurve = "sine",
    hueCurve = "linear",
  } = options;

  const colors: OKLCHColor[] = [];

  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1);

    // Apply curve functions
    const lightnessT = applyCurve(t, lightnessCurve);
    const chromaT = applyCurve(t, chromaCurve);
    const hueT = applyCurve(t, hueCurve);

    const lightness = baseColor.l + (lightnessT - 0.5) * lightnessRange;
    const chroma = Math.max(0.01, baseColor.c + (chromaT - 0.5) * chromaRange);
    const hue = baseColor.h + (hueT - 0.5) * hueRange;

    const ramped = {
      l: Math.max(0, Math.min(100, lightness)),
      c: Math.min(0.4, chroma),
      h: (hue + 360) % 360,
    };

    colors.push(handleEdgeCases(clampToGamut(ramped)));
  }

  return colors;
}

/**
 * Apply curve function to a value
 * @param t - Input value (0-1)
 * @param curve - Curve type
 * @returns Transformed value
 */
function applyCurve(t: number, curve: "linear" | "sine" | "cosine"): number {
  switch (curve) {
    case "linear":
      return t;
    case "sine":
      return Math.sin(t * Math.PI);
    case "cosine":
      return (1 - Math.cos(t * Math.PI)) / 2;
    default:
      return t;
  }
}

/**
 * Create a color ramp with custom easing
 * @param baseColor - Base OKLCH color
 * @param targetColor - Target OKLCH color
 * @param stops - Number of intermediate stops
 * @param easingFunction - Easing function
 * @returns Array of interpolated OKLCH colors
 */
export function generateEasedRamp(
  baseColor: OKLCHColor,
  targetColor: OKLCHColor,
  stops: number = 5,
  easingFunction: (t: number) => number = (t: number) => t
): OKLCHColor[] {
  const colors: OKLCHColor[] = [];

  for (let i = 0; i < stops; i++) {
    const t = i / (stops - 1);
    const easedT = easingFunction(t);

    const interpolated = {
      l: baseColor.l + (targetColor.l - baseColor.l) * easedT,
      c: baseColor.c + (targetColor.c - baseColor.c) * easedT,
      h: interpolateHue(baseColor.h, targetColor.h, easedT),
    };

    colors.push(handleEdgeCases(clampToGamut(interpolated)));
  }

  return colors;
}

/**
 * Interpolate hue values considering the circular nature of hue
 * @param startHue - Starting hue
 * @param endHue - Ending hue
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated hue value
 */
function interpolateHue(startHue: number, endHue: number, t: number): number {
  // Handle hue wrapping
  let diff = endHue - startHue;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return (startHue + diff * t + 360) % 360;
}
