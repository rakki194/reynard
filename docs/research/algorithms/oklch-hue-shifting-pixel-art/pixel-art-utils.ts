/**
 * Pixel Art Specific Utilities
 * Specialized functions for pixel art game development
 */

import type { OKLCHColor } from "reynard-colors";
import { basicHueShift, generateHueShiftRamp } from "./core-algorithms";
import { materialHueShift } from "./material-patterns";

/**
 * Generate sprite colors with hue shifting
 * @param baseColor - Base OKLCH color
 * @param spriteType - Type of sprite
 * @param material - Optional material type
 * @returns Sprite color set
 */
export function generateSpriteColors(
  baseColor: OKLCHColor,
  spriteType: "character" | "environment" | "ui",
  material?: keyof typeof import("./material-patterns").MATERIAL_PATTERNS,
): {
  shadow: OKLCHColor;
  base: OKLCHColor;
  highlight: OKLCHColor;
  accent: OKLCHColor;
} {
  let shadow: OKLCHColor;
  let highlight: OKLCHColor;
  let accent: OKLCHColor;

  if (material) {
    const materialColors = materialHueShift(baseColor, material);
    shadow = materialColors.shadow;
    highlight = materialColors.highlight;
    accent = basicHueShift(baseColor, "midtone", 0.2);
  } else {
    shadow = basicHueShift(baseColor, "shadow", 0.4);
    highlight = basicHueShift(baseColor, "highlight", 0.3);
    accent = basicHueShift(baseColor, "midtone", 0.2);
  }

  return {
    shadow,
    base: baseColor,
    highlight,
    accent,
  };
}

/**
 * Generate palette for pixel art tileset
 * @param baseColors - Array of base OKLCH colors
 * @param tileCount - Maximum number of tiles
 * @returns Array of OKLCH colors for tileset
 */
export function generateTilesetPalette(
  baseColors: OKLCHColor[],
  tileCount: number = 16,
): OKLCHColor[] {
  const palette: OKLCHColor[] = [];

  baseColors.forEach((baseColor) => {
    const ramp = generateHueShiftRamp(baseColor, 4);
    palette.push(...ramp);
  });

  return palette.slice(0, tileCount);
}

/**
 * Create color lookup table for pixel art
 * @param baseColors - Array of base OKLCH colors
 * @param shiftTypes - Array of shift types
 * @returns Map of color keys to shifted colors
 */
export function createColorLookupTable(
  baseColors: OKLCHColor[],
  shiftTypes: Array<"shadow" | "highlight" | "midtone"> = [
    "shadow",
    "highlight",
    "midtone",
  ],
): Map<string, OKLCHColor> {
  const lookup = new Map<string, OKLCHColor>();

  baseColors.forEach((baseColor, baseIndex) => {
    shiftTypes.forEach((shiftType, shiftIndex) => {
      const shifted = basicHueShift(baseColor, shiftType, 0.3);
      const key = `${baseIndex}-${shiftIndex}`;
      lookup.set(key, shifted);
    });
  });

  return lookup;
}

/**
 * Generate character sprite palette
 * @param skinColor - Base skin color
 * @param hairColor - Base hair color
 * @param clothingColor - Base clothing color
 * @returns Array of OKLCH colors for character
 */
export function generateCharacterPalette(
  skinColor: OKLCHColor,
  hairColor: OKLCHColor,
  clothingColor: OKLCHColor,
): OKLCHColor[] {
  const skinColors = generateSpriteColors(skinColor, "character", "skin");
  const hairColors = generateSpriteColors(hairColor, "character", "fabric");
  const clothingColors = generateSpriteColors(
    clothingColor,
    "character",
    "fabric",
  );

  return [
    skinColors.shadow,
    skinColors.base,
    skinColors.highlight,
    hairColors.shadow,
    hairColors.base,
    hairColors.highlight,
    clothingColors.shadow,
    clothingColors.base,
    clothingColors.highlight,
  ];
}

/**
 * Generate environment tileset palette
 * @param grassColor - Base grass color
 * @param stoneColor - Base stone color
 * @param waterColor - Base water color
 * @returns Array of OKLCH colors for environment
 */
export function generateEnvironmentPalette(
  grassColor: OKLCHColor,
  stoneColor: OKLCHColor,
  waterColor: OKLCHColor,
): OKLCHColor[] {
  const grassRamp = generateHueShiftRamp(grassColor, 4);
  const stoneRamp = generateHueShiftRamp(stoneColor, 4);
  const waterRamp = generateHueShiftRamp(waterColor, 4);

  return [...grassRamp, ...stoneRamp, ...waterRamp];
}

/**
 * Generate UI element palette
 * @param primaryColor - Primary UI color
 * @param secondaryColor - Secondary UI color
 * @param accentColor - Accent UI color
 * @returns Array of OKLCH colors for UI
 */
export function generateUIPalette(
  primaryColor: OKLCHColor,
  secondaryColor: OKLCHColor,
  accentColor: OKLCHColor,
): OKLCHColor[] {
  const primaryColors = generateSpriteColors(primaryColor, "ui");
  const secondaryColors = generateSpriteColors(secondaryColor, "ui");
  const accentColors = generateSpriteColors(accentColor, "ui");

  return [
    primaryColors.shadow,
    primaryColors.base,
    primaryColors.highlight,
    secondaryColors.shadow,
    secondaryColors.base,
    secondaryColors.highlight,
    accentColors.shadow,
    accentColors.base,
    accentColors.highlight,
  ];
}
