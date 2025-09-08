/**
 * System theme utilities for the Reynard theming system
 * Handles system theme detection and media query management
 */

import type { ThemeName } from "./types";

/**
 * Get theme icon name for a given theme
 */
export function getThemeIcon(themeName: ThemeName): string {
  switch (themeName) {
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
