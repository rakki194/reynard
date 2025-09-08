/**
 * OKLCH Color Management System
 * Provides OKLCH-based color generation and management for themes
 */

import type { ThemeName } from "./types";
import { 
  createTagColorGenerator, 
  formatOKLCH, 
  adjustLightness,
  type OKLCHColor 
} from "reynard-color-media";
import { themeOKLCHPalettes } from "./oklchPalettes";

// Create a cached color generator for performance
const colorGenerator = createTagColorGenerator();

/**
 * Get OKLCH color for a specific theme and color name
 */
export function getOKLCHColor(theme: ThemeName, colorName: string): OKLCHColor {
  const palette = themeOKLCHPalettes[theme];
  if (!palette || !palette[colorName]) {
    console.warn(`Color ${colorName} not found for theme ${theme}, using fallback`);
    return { l: 50, c: 0.1, h: 0 }; // Fallback color
  }
  return palette[colorName];
}

/**
 * Get CSS color string from OKLCH color
 */
export function getOKLCHCSSColor(theme: ThemeName, colorName: string): string {
  const oklchColor = getOKLCHColor(theme, colorName);
  return formatOKLCH(oklchColor);
}

/**
 * Generate a color variant (lighter/darker) from base OKLCH color
 */
export function generateColorVariant(
  theme: ThemeName, 
  colorName: string, 
  variant: 'lighter' | 'darker' | 'hover' | 'active',
  intensity: number = 0.2
): string {
  const baseColor = getOKLCHColor(theme, colorName);
  let adjustedColor: OKLCHColor;

  switch (variant) {
    case 'lighter':
      adjustedColor = adjustLightness(baseColor, 1 + intensity);
      break;
    case 'darker':
      adjustedColor = adjustLightness(baseColor, 1 - intensity);
      break;
    case 'hover':
      adjustedColor = adjustLightness(baseColor, theme.includes('dark') ? 1.1 : 0.9);
      break;
    case 'active':
      adjustedColor = adjustLightness(baseColor, theme.includes('dark') ? 1.2 : 0.8);
      break;
    default:
      adjustedColor = baseColor;
  }

  return formatOKLCH(adjustedColor);
}

/**
 * Generate a complete color palette for a theme
 */
export function generateThemeColorPalette(theme: ThemeName): Record<string, string> {
  const palette: Record<string, string> = {};
  const oklchPalette = themeOKLCHPalettes[theme];

  // Base colors
  Object.entries(oklchPalette).forEach(([name, color]) => {
    palette[name] = formatOKLCH(color);
  });

  // Generate variants
  const baseColors = Object.keys(oklchPalette);
  baseColors.forEach(colorName => {
    palette[`${colorName}Hover`] = generateColorVariant(theme, colorName, 'hover');
    palette[`${colorName}Active`] = generateColorVariant(theme, colorName, 'active');
    palette[`${colorName}Light`] = generateColorVariant(theme, colorName, 'lighter', 0.3);
    palette[`${colorName}Dark`] = generateColorVariant(theme, colorName, 'darker', 0.3);
  });

  return palette;
}

/**
 * Generate dynamic tag colors using OKLCH
 */
export function generateTagColor(theme: ThemeName, tag: string, intensity: number = 1.0): string {
  const oklchColor = colorGenerator.getTagColor(theme, tag, intensity);
  return formatOKLCH(oklchColor);
}

/**
 * Generate complementary colors for a given OKLCH color
 */
export function generateComplementaryColors(theme: ThemeName, colorName: string): string[] {
  const baseColor = getOKLCHColor(theme, colorName);
  const complementary = [
    baseColor,
    { ...baseColor, h: (baseColor.h + 180) % 360 },
    { ...baseColor, h: (baseColor.h + 90) % 360 },
    { ...baseColor, h: (baseColor.h + 270) % 360 },
  ];
  
  return complementary.map(color => formatOKLCH(color));
}

/**
 * Generate a gradient from OKLCH colors
 */
export function generateOKLCHGradient(
  theme: ThemeName, 
  startColor: string, 
  endColor: string, 
  direction: string = '135deg'
): string {
  const startOKLCH = getOKLCHCSSColor(theme, startColor);
  const endOKLCH = getOKLCHCSSColor(theme, endColor);
  
  return `linear-gradient(${direction}, ${startOKLCH}, ${endOKLCH})`;
}
