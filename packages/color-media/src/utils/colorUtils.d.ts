/**
 * Color utility functions for OKLCH color space
 * Provides consistent color generation and manipulation
 */
import type { OKLCHColor, ThemeName } from "../types";
/**
 * Generate a hash from a string for consistent color generation
 * @param str - The string to hash
 * @returns A numeric hash value
 */
export declare function hashString(str: string): number;
/**
 * Generate LCH color values from a tag string
 * @param tag - The tag to generate color for
 * @returns LCH color object
 */
export declare function getLCHColor(tag: string): OKLCHColor;
/**
 * Compute tag background color based on theme and tag
 * @param theme - The current theme
 * @param tag - The tag text
 * @returns CSS color string
 */
export declare function computeTagBackground(
  theme: ThemeName,
  tag: string,
): string;
/**
 * Compute tag text color based on theme and tag
 * @param theme - The current theme
 * @param tag - The tag text
 * @returns CSS color string
 */
export declare function computeTagColor(theme: ThemeName, tag: string): string;
/**
 * Compute hover styles based on theme
 * @param theme - The current theme
 * @returns Object with CSS properties for hover effects
 */
export declare function computeHoverStyles(
  theme: ThemeName,
): Record<string, string>;
/**
 * Compute animation style based on theme
 * @param theme - The current theme
 * @returns Animation identifier
 */
export declare function computeAnimation(theme: ThemeName): string;
/**
 * Format OKLCH color object into CSS color string
 * @param color - OKLCH color object
 * @returns CSS color string in OKLCH format
 */
export declare function formatOKLCH(color: OKLCHColor): string;
/**
 * Create a tag color generator with caching for performance
 * @returns Object with methods to generate and cache tag colors
 */
export declare function createTagColorGenerator(): {
  getTagColor(theme: string, tag: string, colorIntensity?: number): OKLCHColor;
  clearCache(): void;
};
/**
 * Generate a color palette with specified number of colors
 * @param count - Number of colors to generate
 * @param baseHue - Base hue value (0-360)
 * @param saturation - Saturation value (0-1)
 * @param lightness - Lightness value (0-1)
 * @returns Array of OKLCH color strings
 */
export declare function generateColorPalette(
  count: number,
  baseHue?: number,
  saturation?: number,
  lightness?: number,
): string[];
/**
 * Generate complementary colors
 * @param baseColor - Base OKLCH color
 * @returns Array of complementary colors
 */
export declare function generateComplementaryColors(
  baseColor: OKLCHColor,
): OKLCHColor[];
/**
 * Adjust color lightness
 * @param color - Base OKLCH color
 * @param factor - Lightness adjustment factor (0.5 = 50% lighter, 2.0 = 100% darker)
 * @returns Adjusted OKLCH color
 */
export declare function adjustLightness(
  color: OKLCHColor,
  factor: number,
): OKLCHColor;
/**
 * Adjust color saturation
 * @param color - Base OKLCH color
 * @param factor - Saturation adjustment factor
 * @returns Adjusted OKLCH color
 */
export declare function adjustSaturation(
  color: OKLCHColor,
  factor: number,
): OKLCHColor;
