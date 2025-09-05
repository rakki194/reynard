/**
 * Theme utilities for the Reynard theming system
 * Based on yipyap's theme utility functions
 */

import type { ThemeName } from "./types";

// LCH color space utilities for consistent color generation
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
}

function getLCHColor(tag: string): { l: number; c: number; h: number } {
  const hash = hashString(tag);
  return {
    l: 65 + (hash % 20), // Lightness: 65-85
    c: 40 + (hash % 40), // Chroma: 40-80
    h: hash % 360, // Hue: 0-360
  };
}

/**
 * Compute tag background color based on theme and tag name
 */
export function computeTagBackground(theme: ThemeName, tag: string): string {
  const { l, c, h } = getLCHColor(tag);

  // Adjust lightness based on theme
  const lightness =
    theme === "dark" || theme === "high-contrast-black" ? l * 0.7 : l;

  return `lch(${lightness}% ${c} ${h})`;
}

/**
 * Compute tag text color based on theme and tag name
 */
export function computeTagColor(theme: ThemeName, tag: string): string {
  const { l } = getLCHColor(tag);

  // For dark themes, use lighter text
  if (theme === "dark" || theme === "high-contrast-black") {
    return l < 60 ? "rgb(240, 240, 240)" : "rgb(20, 20, 20)";
  }

  // For light themes, ensure contrast
  return l > 65 ? "rgb(20, 20, 20)" : "rgb(240, 240, 240)";
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
  const { themes } = require("./themes");
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
    const { themes } = require("./themes");
    const theme = themes[themeName];
    if (theme) {
      metaThemeColor.setAttribute("content", theme.colors.primary);
    }
  }
}

/**
 * Get theme icon name for a given theme
 */
export function getThemeIcon(themeName: ThemeName): string {
  return computeAnimation(themeName);
}

/**
 * Check if theme supports reduced motion
 */
export function supportsReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get system theme preference
 */
export function getSystemThemePreference(): "light" | "dark" {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/**
 * Listen for system theme changes
 */
export function onSystemThemeChange(
  callback: (theme: "light" | "dark") => void,
): () => void {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? "dark" : "light");
  };

  mediaQuery.addEventListener("change", handleChange);

  // Return cleanup function
  return () => {
    mediaQuery.removeEventListener("change", handleChange);
  };
}
