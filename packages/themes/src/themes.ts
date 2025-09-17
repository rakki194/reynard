/**
 * Theme configurations for the Reynard theming system
 * Based on yipyap's comprehensive theme definitions
 */

import type { ThemeConfig, ThemeName } from "./types";

// Light theme configuration
const lightTheme: ThemeConfig = {
  name: "light",
  displayName: "Light",
  description: "Clean and bright light theme",
  colors: {
    primary: "oklch(60% 0.25 240)",
    primaryHover: "oklch(50% 0.25 240)",
    primaryActive: "oklch(40% 0.25 240)",
    primaryDisabled: "oklch(50% 0.05 0)",

    secondary: "oklch(50% 0.05 0)",
    secondaryHover: "oklch(40% 0.05 0)",
    secondaryActive: "oklch(30% 0.05 0)",
    secondaryDisabled: "oklch(50% 0.01 0)",

    background: "oklch(98% 0.01 0)",
    backgroundSecondary: "oklch(95% 0.02 0)",
    backgroundTertiary: "oklch(90% 0.02 0)",
    backgroundOverlay: "oklch(0% 0 0 / 0.5)",

    surface: "oklch(95% 0.02 0)",
    surfaceHover: "oklch(90% 0.02 0)",
    surfaceActive: "oklch(85% 0.02 0)",
    surfaceSelected: "oklch(90% 0.08 240)",

    text: "oklch(15% 0.01 0)",
    textSecondary: "oklch(30% 0.01 0)",
    textTertiary: "oklch(50% 0.01 0)",
    textDisabled: "oklch(50% 0.01 0)",
    textInverse: "oklch(95% 0.01 0)",

    border: "oklch(85% 0.02 0)",
    borderHover: "oklch(80% 0.02 0)",
    borderActive: "oklch(60% 0.25 240)",
    borderDisabled: "oklch(85% 0.02 0)",

    success: "oklch(55% 0.2 140)",
    warning: "oklch(75% 0.2 80)",
    error: "oklch(55% 0.25 20)",
    info: "oklch(60% 0.2 200)",

    accent: "oklch(60% 0.25 240)",
    accentHover: "oklch(50% 0.25 240)",
    accentActive: "oklch(40% 0.25 240)",
  },
  animations: {
    duration: {
      fast: "120ms",
      base: "200ms",
      slow: "320ms",
    },
    easing: {
      standard: "cubic-bezier(0.2, 0, 0, 1)",
      decelerate: "cubic-bezier(0, 0, 0, 1)",
      accelerate: "cubic-bezier(0.3, 0, 1, 1)",
    },
    icon: "sun",
  },
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      secondary: 'Georgia, "Times New Roman", Times, serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    base: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    "4xl": "6rem",
  },
  shadows: {
    sm: "0 1px 2px oklch(0% 0 0 / 0.05)",
    base: "0 1px 3px oklch(0% 0 0 / 0.1), 0 1px 2px oklch(0% 0 0 / 0.06)",
    md: "0 4px 6px oklch(0% 0 0 / 0.07), 0 2px 4px oklch(0% 0 0 / 0.06)",
    lg: "0 10px 15px oklch(0% 0 0 / 0.1), 0 4px 6px oklch(0% 0 0 / 0.05)",
    xl: "0 20px 25px oklch(0% 0 0 / 0.1), 0 10px 10px oklch(0% 0 0 / 0.04)",
  },
  borders: {
    radius: {
      sm: "0.125rem",
      base: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      full: "9999px",
    },
    width: {
      thin: "1px",
      base: "2px",
      thick: "4px",
    },
  },
};

// Dark theme configuration
const darkTheme: ThemeConfig = {
  name: "dark",
  displayName: "Dark",
  description: "Modern dark theme with high contrast",
  colors: {
    primary: "oklch(65% 0.25 240)",
    primaryHover: "oklch(70% 0.25 240)",
    primaryActive: "oklch(75% 0.25 240)",
    primaryDisabled: "oklch(50% 0.01 0)",

    secondary: "oklch(60% 0.05 0)",
    secondaryHover: "oklch(65% 0.05 0)",
    secondaryActive: "oklch(70% 0.05 0)",
    secondaryDisabled: "oklch(50% 0.01 0)",

    background: "oklch(15% 0.01 0)",
    backgroundSecondary: "oklch(20% 0.02 0)",
    backgroundTertiary: "oklch(25% 0.02 0)",
    backgroundOverlay: "oklch(0% 0 0 / 0.8)",

    surface: "oklch(25% 0.02 0)",
    surfaceHover: "oklch(30% 0.02 0)",
    surfaceActive: "oklch(35% 0.02 0)",
    surfaceSelected: "oklch(30% 0.08 240)",

    text: "oklch(90% 0.01 0)",
    textSecondary: "oklch(70% 0.01 0)",
    textTertiary: "oklch(50% 0.01 0)",
    textDisabled: "oklch(50% 0.01 0)",
    textInverse: "oklch(15% 0.01 0)",

    border: "oklch(35% 0.02 0)",
    borderHover: "oklch(40% 0.02 0)",
    borderActive: "oklch(65% 0.25 240)",
    borderDisabled: "oklch(25% 0.02 0)",

    success: "oklch(60% 0.2 140)",
    warning: "oklch(70% 0.2 80)",
    error: "oklch(60% 0.25 20)",
    info: "oklch(65% 0.2 200)",

    accent: "oklch(65% 0.25 240)",
    accentHover: "oklch(70% 0.25 240)",
    accentActive: "oklch(75% 0.25 240)",
  },
  animations: {
    duration: {
      fast: "120ms",
      base: "200ms",
      slow: "320ms",
    },
    easing: {
      standard: "cubic-bezier(0.2, 0, 0, 1)",
      decelerate: "cubic-bezier(0, 0, 0, 1)",
      accelerate: "cubic-bezier(0.3, 0, 1, 1)",
    },
    icon: "moon",
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  shadows: {
    sm: "0 1px 2px oklch(0% 0 0 / 0.3)",
    base: "0 1px 3px oklch(0% 0 0 / 0.4), 0 1px 2px oklch(0% 0 0 / 0.3)",
    md: "0 4px 6px oklch(0% 0 0 / 0.4), 0 2px 4px oklch(0% 0 0 / 0.3)",
    lg: "0 10px 15px oklch(0% 0 0 / 0.4), 0 4px 6px oklch(0% 0 0 / 0.3)",
    xl: "0 20px 25px oklch(0% 0 0 / 0.4), 0 10px 10px oklch(0% 0 0 / 0.3)",
  },
  borders: lightTheme.borders,
};

// Gray theme configuration
const grayTheme: ThemeConfig = {
  name: "gray",
  displayName: "Gray",
  description: "Neutral gray theme for professional use",
  colors: {
    ...lightTheme.colors,
    primary: "oklch(50% 0 0)",
    primaryHover: "oklch(40% 0 0)",
    primaryActive: "oklch(30% 0 0)",

    background: "oklch(95% 0.01 0)",
    backgroundSecondary: "oklch(90% 0.02 0)",
    backgroundTertiary: "oklch(85% 0.02 0)",

    surface: "oklch(90% 0.02 0)",
    surfaceHover: "oklch(85% 0.02 0)",
    surfaceActive: "oklch(80% 0.02 0)",
    surfaceSelected: "oklch(85% 0.02 0)",

    accent: "oklch(50% 0 0)",
    accentHover: "oklch(40% 0 0)",
    accentActive: "oklch(30% 0 0)",

    success: "oklch(55% 0.15 140)",
    warning: "oklch(70% 0.15 80)",
    error: "oklch(55% 0.2 20)",
    info: "oklch(60% 0.15 200)",
  },
  animations: {
    ...lightTheme.animations,
    icon: "cloud",
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  shadows: lightTheme.shadows,
  borders: lightTheme.borders,
};

// Banana theme configuration
const bananaTheme: ThemeConfig = {
  name: "banana",
  displayName: "Banana",
  description: "Warm yellow theme inspired by bananas",
  colors: {
    ...lightTheme.colors,
    primary: "oklch(75% 0.2 60)",
    primaryHover: "oklch(70% 0.2 60)",
    primaryActive: "oklch(65% 0.2 60)",

    background: "oklch(95% 0.05 60)",
    backgroundSecondary: "oklch(90% 0.08 60)",
    backgroundTertiary: "oklch(85% 0.08 60)",

    surface: "oklch(90% 0.08 60)",
    surfaceHover: "oklch(85% 0.08 60)",
    surfaceActive: "oklch(80% 0.08 60)",
    surfaceSelected: "oklch(85% 0.08 60)",

    accent: "oklch(75% 0.2 60)",
    accentHover: "oklch(70% 0.2 60)",
    accentActive: "oklch(65% 0.2 60)",

    border: "oklch(80% 0.08 60)",
    borderHover: "oklch(75% 0.08 60)",

    warning: "oklch(75% 0.2 60)",

    banana: "oklch(75% 0.2 60)",
  },
  animations: {
    ...lightTheme.animations,
    icon: "banana",
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  shadows: lightTheme.shadows,
  borders: lightTheme.borders,
};

// Strawberry theme configuration
const strawberryTheme: ThemeConfig = {
  name: "strawberry",
  displayName: "Strawberry",
  description: "Sweet pink theme inspired by strawberries",
  colors: {
    ...lightTheme.colors,
    primary: "oklch(60% 0.25 340)",
    primaryHover: "oklch(55% 0.25 340)",
    primaryActive: "oklch(50% 0.25 340)",

    background: "oklch(95% 0.05 340)",
    backgroundSecondary: "oklch(90% 0.08 340)",
    backgroundTertiary: "oklch(85% 0.08 340)",

    surface: "oklch(90% 0.08 340)",
    surfaceHover: "oklch(85% 0.08 340)",
    surfaceActive: "oklch(80% 0.08 340)",
    surfaceSelected: "oklch(85% 0.08 340)",

    accent: "oklch(60% 0.25 340)",
    accentHover: "oklch(55% 0.25 340)",
    accentActive: "oklch(50% 0.25 340)",

    border: "oklch(80% 0.08 340)",
    borderHover: "oklch(75% 0.08 340)",

    error: "oklch(60% 0.25 340)",

    strawberry: "oklch(60% 0.25 340)",
  },
  animations: {
    ...lightTheme.animations,
    icon: "strawberry",
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  shadows: lightTheme.shadows,
  borders: lightTheme.borders,
};

// Peanut theme configuration
const peanutTheme: ThemeConfig = {
  name: "peanut",
  displayName: "Peanut",
  description: "Rich brown theme inspired by peanuts",
  colors: {
    ...lightTheme.colors,
    primary: "oklch(45% 0.15 30)",
    primaryHover: "oklch(40% 0.15 30)",
    primaryActive: "oklch(35% 0.15 30)",

    background: "oklch(95% 0.02 30)",
    backgroundSecondary: "oklch(90% 0.04 30)",
    backgroundTertiary: "oklch(85% 0.04 30)",

    surface: "oklch(90% 0.04 30)",
    surfaceHover: "oklch(85% 0.04 30)",
    surfaceActive: "oklch(80% 0.04 30)",
    surfaceSelected: "oklch(85% 0.04 30)",

    accent: "oklch(45% 0.15 30)",
    accentHover: "oklch(40% 0.15 30)",
    accentActive: "oklch(35% 0.15 30)",

    border: "oklch(80% 0.04 30)",
    borderHover: "oklch(75% 0.04 30)",

    peanut: "oklch(45% 0.15 30)",
  },
  animations: {
    ...lightTheme.animations,
    icon: "peanut",
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  shadows: lightTheme.shadows,
  borders: lightTheme.borders,
};

// High contrast black theme
const highContrastBlackTheme: ThemeConfig = {
  name: "high-contrast-black",
  displayName: "High Contrast Black",
  description: "High contrast black theme for accessibility",
  colors: {
    ...darkTheme.colors,
    primary: "oklch(80% 0.3 240)",
    primaryHover: "oklch(85% 0.3 240)",
    primaryActive: "oklch(90% 0.3 240)",

    background: "oklch(5% 0.01 0)",
    backgroundSecondary: "oklch(10% 0.02 0)",
    backgroundTertiary: "oklch(15% 0.02 0)",

    surface: "oklch(10% 0.02 0)",
    surfaceHover: "oklch(15% 0.02 0)",
    surfaceActive: "oklch(20% 0.02 0)",
    surfaceSelected: "oklch(15% 0.08 240)",

    text: "oklch(95% 0.01 0)",
    textSecondary: "oklch(85% 0.01 0)",
    textTertiary: "oklch(70% 0.01 0)",

    border: "oklch(30% 0.02 0)",
    borderHover: "oklch(40% 0.02 0)",
    borderActive: "oklch(80% 0.3 240)",

    accent: "oklch(80% 0.3 240)",
    accentHover: "oklch(85% 0.3 240)",
    accentActive: "oklch(90% 0.3 240)",

    success: "oklch(70% 0.25 140)",
    warning: "oklch(80% 0.25 80)",
    error: "oklch(70% 0.3 20)",
    info: "oklch(75% 0.25 200)",
  },
  animations: {
    ...darkTheme.animations,
    icon: "moon",
  },
  typography: darkTheme.typography,
  spacing: darkTheme.spacing,
  shadows: darkTheme.shadows,
  borders: darkTheme.borders,
};

// High contrast inverse theme
const highContrastInverseTheme: ThemeConfig = {
  name: "high-contrast-inverse",
  displayName: "High Contrast Inverse",
  description: "High contrast inverse theme for accessibility",
  colors: {
    ...lightTheme.colors,
    primary: "oklch(20% 0.3 240)",
    primaryHover: "oklch(15% 0.3 240)",
    primaryActive: "oklch(10% 0.3 240)",

    background: "oklch(95% 0.01 0)",
    backgroundSecondary: "oklch(90% 0.02 0)",
    backgroundTertiary: "oklch(85% 0.02 0)",

    surface: "oklch(90% 0.02 0)",
    surfaceHover: "oklch(85% 0.02 0)",
    surfaceActive: "oklch(80% 0.02 0)",
    surfaceSelected: "oklch(85% 0.08 240)",

    text: "oklch(5% 0.01 0)",
    textSecondary: "oklch(15% 0.01 0)",
    textTertiary: "oklch(30% 0.01 0)",

    border: "oklch(70% 0.02 0)",
    borderHover: "oklch(60% 0.02 0)",
    borderActive: "oklch(20% 0.3 240)",

    accent: "oklch(20% 0.3 240)",
    accentHover: "oklch(15% 0.3 240)",
    accentActive: "oklch(10% 0.3 240)",

    success: "oklch(30% 0.25 140)",
    warning: "oklch(20% 0.25 80)",
    error: "oklch(30% 0.3 20)",
    info: "oklch(25% 0.25 200)",
  },
  animations: {
    ...lightTheme.animations,
    icon: "sun",
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  shadows: lightTheme.shadows,
  borders: lightTheme.borders,
};

// Theme registry
export const themes: Record<ThemeName, ThemeConfig> = {
  light: lightTheme,
  dark: darkTheme,
  gray: grayTheme,
  banana: bananaTheme,
  strawberry: strawberryTheme,
  peanut: peanutTheme,
  "high-contrast-black": highContrastBlackTheme,
  "high-contrast-inverse": highContrastInverseTheme,
};

// Theme utilities
export const getTheme = (name: ThemeName): ThemeConfig => {
  return themes[name] || themes.light;
};

export const getAvailableThemes = (): ThemeConfig[] => {
  return Object.values(themes);
};

export const isDarkTheme = (theme: ThemeName): boolean => {
  return theme === "dark" || theme === "high-contrast-black";
};

export const isHighContrastTheme = (theme: ThemeName): boolean => {
  return theme === "high-contrast-black" || theme === "high-contrast-inverse";
};
