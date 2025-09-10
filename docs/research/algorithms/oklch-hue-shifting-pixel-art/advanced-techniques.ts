/**
 * Advanced OKLCH Hue Shifting Techniques
 * Sophisticated algorithms for complex color manipulation
 */

import type { OKLCHColor } from 'reynard-colors';

/**
 * Generate hue-shifted palette using golden ratio distribution
 * @param baseColor - Base OKLCH color
 * @param count - Number of colors in palette
 * @returns Array of OKLCH colors
 */
export function goldenRatioHuePalette(
  baseColor: OKLCHColor,
  count: number = 8
): OKLCHColor[] {
  const GOLDEN_ANGLE = 137.508; // Golden angle in degrees
  const colors: OKLCHColor[] = [];
  const { l, c } = baseColor;
  
  for (let i = 0; i < count; i++) {
    const hue = (baseColor.h + (i * GOLDEN_ANGLE)) % 360;
    const lightnessVariation = Math.sin(i * 0.5) * 15; // Subtle lightness variation
    const chromaVariation = Math.cos(i * 0.3) * 0.05; // Subtle chroma variation
    
    colors.push({
      l: Math.max(0, Math.min(100, l + lightnessVariation)),
      c: Math.max(0.05, Math.min(0.4, c + chromaVariation)),
      h: hue
    });
  }
  
  return colors;
}

/**
 * Generate complementary color with hue shifting
 * @param baseColor - Base OKLCH color
 * @param shiftAmount - Amount to shift the complementary hue
 * @returns Complementary OKLCH color
 */
export function generateComplementaryColor(
  baseColor: OKLCHColor,
  shiftAmount: number = 0
): OKLCHColor {
  const complementaryHue = (baseColor.h + 180 + shiftAmount) % 360;
  
  return {
    l: baseColor.l,
    c: baseColor.c,
    h: complementaryHue
  };
}

/**
 * Generate triadic color scheme with hue shifting
 * @param baseColor - Base OKLCH color
 * @param shiftAmount - Amount to shift the triadic hues
 * @returns Array of three OKLCH colors
 */
export function generateTriadicColors(
  baseColor: OKLCHColor,
  shiftAmount: number = 0
): [OKLCHColor, OKLCHColor, OKLCHColor] {
  const hue1 = (baseColor.h + 120 + shiftAmount) % 360;
  const hue2 = (baseColor.h + 240 + shiftAmount) % 360;
  
  return [
    baseColor,
    { l: baseColor.l, c: baseColor.c, h: hue1 },
    { l: baseColor.l, c: baseColor.c, h: hue2 }
  ];
}

/**
 * Generate analogous color scheme with hue shifting
 * @param baseColor - Base OKLCH color
 * @param count - Number of analogous colors
 * @param spread - Hue spread in degrees
 * @returns Array of OKLCH colors
 */
export function generateAnalogousColors(
  baseColor: OKLCHColor,
  count: number = 5,
  spread: number = 30
): OKLCHColor[] {
  const colors: OKLCHColor[] = [];
  const step = spread / (count - 1);
  const startOffset = -spread / 2;
  
  for (let i = 0; i < count; i++) {
    const hue = (baseColor.h + startOffset + (i * step) + 360) % 360;
    colors.push({
      l: baseColor.l,
      c: baseColor.c,
      h: hue
    });
  }
  
  return colors;
}

/**
 * Generate split-complementary color scheme
 * @param baseColor - Base OKLCH color
 * @param spread - Hue spread for split complements
 * @returns Array of three OKLCH colors
 */
export function generateSplitComplementaryColors(
  baseColor: OKLCHColor,
  spread: number = 30
): [OKLCHColor, OKLCHColor, OKLCHColor] {
  const complementaryHue = (baseColor.h + 180) % 360;
  const hue1 = (complementaryHue - spread + 360) % 360;
  const hue2 = (complementaryHue + spread) % 360;
  
  return [
    baseColor,
    { l: baseColor.l, c: baseColor.c, h: hue1 },
    { l: baseColor.l, c: baseColor.c, h: hue2 }
  ];
}

/**
 * Generate tetradic (double complementary) color scheme
 * @param baseColor - Base OKLCH color
 * @param offset - Hue offset for the second pair
 * @returns Array of four OKLCH colors
 */
export function generateTetradicColors(
  baseColor: OKLCHColor,
  offset: number = 30
): [OKLCHColor, OKLCHColor, OKLCHColor, OKLCHColor] {
  const hue1 = (baseColor.h + offset) % 360;
  const hue2 = (baseColor.h + 180) % 360;
  const hue3 = (baseColor.h + 180 + offset) % 360;
  
  return [
    baseColor,
    { l: baseColor.l, c: baseColor.c, h: hue1 },
    { l: baseColor.l, c: baseColor.c, h: hue2 },
    { l: baseColor.l, c: baseColor.c, h: hue3 }
  ];
}
