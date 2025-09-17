/**
 * Core OKLCH Hue Shifting Algorithms
 * Basic algorithms for pixel art game development
 */

import type { OKLCHColor } from "reynard-colors";

/**
 * Basic hue shifting algorithm for pixel art
 * @param baseColor - Base OKLCH color
 * @param shiftType - Type of shift (shadow, highlight, midtone)
 * @param intensity - Shift intensity (0-1)
 * @returns Shifted OKLCH color
 */
export function basicHueShift(
  baseColor: OKLCHColor,
  shiftType: "shadow" | "highlight" | "midtone",
  intensity: number = 0.3
): OKLCHColor {
  const { l, c, h } = baseColor;

  switch (shiftType) {
    case "shadow":
      return {
        l: Math.max(0, l - intensity * 30), // Darker
        c: Math.min(0.4, c + intensity * 0.1), // More saturated
        h: (h - intensity * 20 + 360) % 360, // Shift toward cooler colors
      };

    case "highlight":
      return {
        l: Math.min(100, l + intensity * 25), // Lighter
        c: Math.min(0.4, c + intensity * 0.05), // Slightly more saturated
        h: (h + intensity * 15 + 360) % 360, // Shift toward warmer colors
      };

    case "midtone":
      return {
        l: l, // Keep same lightness
        c: Math.min(0.4, c + intensity * 0.08), // Increase saturation
        h: (h + intensity * 5 + 360) % 360, // Subtle hue shift
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
      h: (h + hueShift + 360) % 360,
    });
  }

  return colors;
}

/**
 * Temporal hue shifting for animations
 * @param baseColor - Base OKLCH color
 * @param time - Animation time (0-1)
 * @param frequency - Hue shift frequency
 * @returns Animated OKLCH color
 */
export function temporalHueShift(baseColor: OKLCHColor, time: number, frequency: number = 1.0): OKLCHColor {
  const { l, c, h } = baseColor;
  const hueShift = Math.sin(time * Math.PI * 2 * frequency) * 10;

  return {
    l: l,
    c: c,
    h: (h + hueShift + 360) % 360,
  };
}

/**
 * Adaptive hue shifting based on color properties
 * @param baseColor - Base OKLCH color
 * @param context - Shading context
 * @returns Shifted colors
 */
export function adaptiveHueShift(
  baseColor: OKLCHColor,
  context: {
    isWarm: boolean;
    isSaturated: boolean;
    isDark: boolean;
  }
): { shadow: OKLCHColor; highlight: OKLCHColor } {
  const { l, c, h } = baseColor;

  // Calculate adaptive shift amounts
  const baseShift = context.isSaturated ? 15 : 25;
  const lightnessFactor = context.isDark ? 0.8 : 1.2;
  const chromaFactor = context.isSaturated ? 0.5 : 1.0;

  // Determine shift direction based on color temperature
  const shadowDirection = context.isWarm ? -1 : 1;
  const highlightDirection = context.isWarm ? 1 : -1;

  return {
    shadow: {
      l: Math.max(0, l - 25 * lightnessFactor),
      c: Math.min(0.4, c + 0.1 * chromaFactor),
      h: (h + baseShift * shadowDirection + 360) % 360,
    },
    highlight: {
      l: Math.min(100, l + 20 * lightnessFactor),
      c: Math.min(0.4, c + 0.05 * chromaFactor),
      h: (h + baseShift * highlightDirection + 360) % 360,
    },
  };
}
