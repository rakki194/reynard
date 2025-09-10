/**
 * Theme utilities for the Reynard theming system
 * Based on yipyap's theme utility functions
 * Now using OKLCH color space from reynard-colors for better perceptual uniformity
 */

import {
  createTagColorGenerator,
  formatOKLCH,
  type OKLCHColor,
} from "reynard-colors";
import { themes } from "./themes";
import type { ThemeName } from "./types";

// Create a cached tag color generator for performance
const tagColorGenerator = createTagColorGenerator();

/**
 * Compute tag background color based on theme and tag name
 * Uses OKLCH color space for better perceptual uniformity
 */
export function computeTagBackground(theme: ThemeName, tag: string): string {
  // Get the base OKLCH color from the cached generator
  const baseColor = tagColorGenerator.getTagColor(theme, tag);

  // Adjust lightness based on theme for better contrast
  const adjustedColor: OKLCHColor = {
    ...baseColor,
    l:
      theme === "dark" || theme === "high-contrast-black"
        ? baseColor.l * 0.7 // Darker for dark themes
        : baseColor.l * 1.1, // Slightly lighter for light themes
  };

  return formatOKLCH(adjustedColor);
}

/**
 * Compute tag text color based on theme and tag name
 * Uses OKLCH color space for better perceptual uniformity
 */
export function computeTagColor(theme: ThemeName, tag: string): string {
  // Get the base OKLCH color from the cached generator
  const baseColor = tagColorGenerator.getTagColor(theme, tag);

  // Generate high-contrast text color based on background lightness
  const textColor: OKLCHColor = {
    l:
      baseColor.l > 50
        ? 20 // Dark text for light backgrounds
        : 90, // Light text for dark backgrounds
    c: 0.02, // Very low chroma for text readability
    h: baseColor.h, // Keep the same hue for color harmony
  };

  return formatOKLCH(textColor);
}

/**
 * Compute hover styles based on theme
 */
export function computeHoverStyles(theme: ThemeName): Record<string, string> {
  switch (theme) {
    case "dark":
    case "high-contrast-black":
      return {
        filter: "brightness(1.2)",
        transform: "scale(1.05)",
      };
    case "light":
    case "high-contrast-inverse":
      return {
        filter: "brightness(0.9)",
        transform: "scale(1.05)",
      };
    case "banana":
      return {
        filter: "brightness(1.1) saturate(1.2)",
        transform: "scale(1.05)",
      };
    case "strawberry":
      return {
        filter: "brightness(1.1) saturate(1.3)",
        transform: "scale(1.05)",
      };
    case "peanut":
      return {
        filter: "brightness(1.1) saturate(1.1)",
        transform: "scale(1.05)",
      };
    default:
      return {
        filter: "brightness(1.1)",
        transform: "scale(1.05)",
      };
  }
}

/**
 * Compute animation type based on theme
 */
export function computeAnimation(theme: ThemeName): string {
  switch (theme) {
    case "dark":
    case "high-contrast-black":
      return "moon";
    case "light":
    case "high-contrast-inverse":
      return "sun";
    case "gray":
      return "cloud";
    case "banana":
      return "banana";
    case "strawberry":
      return "strawberry";
    case "peanut":
      return "peanut";
    default:
      return "sun";
  }
}

/**
 * Generate CSS custom properties for a theme
 */
export function generateThemeCSS(themeName: ThemeName): string {
  const theme = themes[themeName];

  if (!theme) {
    throw new Error(`Theme "${themeName}" not found`);
  }

  const cssVars: string[] = [];

  // Color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    cssVars.push(
      `  --color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`,
    );
  });

  // Animation variables
  Object.entries(theme.animations.duration).forEach(([key, value]) => {
    cssVars.push(`  --duration-${key}: ${value};`);
  });

  Object.entries(theme.animations.easing).forEach(([key, value]) => {
    cssVars.push(`  --easing-${key}: ${value};`);
  });

  // Typography variables
  Object.entries(theme.typography.fontFamily).forEach(([key, value]) => {
    cssVars.push(`  --font-family-${key}: ${value};`);
  });

  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    cssVars.push(`  --font-size-${key}: ${value};`);
  });

  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    cssVars.push(`  --font-weight-${key}: ${value};`);
  });

  Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
    cssVars.push(`  --line-height-${key}: ${value};`);
  });

  // Spacing variables
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVars.push(`  --spacing-${key}: ${value};`);
  });

  // Shadow variables
  Object.entries(theme.shadows).forEach(([key, value]) => {
    cssVars.push(`  --shadow-${key}: ${value};`);
  });

  // Border variables
  Object.entries(theme.borders.radius).forEach(([key, value]) => {
    cssVars.push(`  --border-radius-${key}: ${value};`);
  });

  Object.entries(theme.borders.width).forEach(([key, value]) => {
    cssVars.push(`  --border-width-${key}: ${value};`);
  });

  return `:root[data-theme="${themeName}"] {\n${cssVars.join("\n")}\n}`;
}

/**
 * Apply theme to document
 */
export function applyTheme(themeName: ThemeName): void {
  document.documentElement.setAttribute("data-theme", themeName);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const theme = themes[themeName];
    if (theme) {
      metaThemeColor.setAttribute("content", theme.colors.primary);
    }
  }
}
