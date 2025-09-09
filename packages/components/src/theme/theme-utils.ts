/**
 * Theme utility functions for the ThemeShowcase component
 */

import { getAvailableThemes } from "reynard-themes";

export interface ThemeColor {
  name: string;
  value: string;
  var: string;
}

/**
 * Get color palette for a specific theme
 */
export const getThemeColors = (themeName: string): ThemeColor[] => {
  const themeConfig = getAvailableThemes().find((t) => t.name === themeName);
  if (!themeConfig) return [];

  return [
    {
      name: "Primary",
      value: themeConfig.colors.primary,
      var: "--color-primary",
    },
    { name: "Accent", value: themeConfig.colors.accent, var: "--color-accent" },
    {
      name: "Background",
      value: themeConfig.colors.background,
      var: "--color-background",
    },
    {
      name: "Surface",
      value: themeConfig.colors.surface,
      var: "--color-surface",
    },
    { name: "Text", value: themeConfig.colors.text, var: "--color-text" },
    { name: "Border", value: themeConfig.colors.border, var: "--color-border" },
  ];
};

/**
 * Get current theme name (preview or active)
 */
export const getCurrentTheme = (
  previewTheme: string | null,
  activeTheme: string,
): string => {
  return previewTheme || activeTheme;
};
