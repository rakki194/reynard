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
    primary: "#007bff",
    primaryHover: "#0056b3",
    primaryActive: "#004085",
    primaryDisabled: "#6c757d",

    secondary: "#6c757d",
    secondaryHover: "#545b62",
    secondaryActive: "#3d4449",
    secondaryDisabled: "#adb5bd",

    background: "#ffffff",
    backgroundSecondary: "#f8f9fa",
    backgroundTertiary: "#e9ecef",
    backgroundOverlay: "rgba(0, 0, 0, 0.5)",

    surface: "#ffffff",
    surfaceHover: "#f8f9fa",
    surfaceActive: "#e9ecef",
    surfaceSelected: "#e7f3ff",

    text: "#212529",
    textSecondary: "#6c757d",
    textTertiary: "#adb5bd",
    textDisabled: "#6c757d",
    textInverse: "#ffffff",

    border: "#dee2e6",
    borderHover: "#adb5bd",
    borderActive: "#007bff",
    borderDisabled: "#e9ecef",

    success: "#28a745",
    warning: "#ffc107",
    error: "#dc3545",
    info: "#17a2b8",

    accent: "#007bff",
    accentHover: "#0056b3",
    accentActive: "#004085",
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
      primary:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
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
    primary: "#0d6efd",
    primaryHover: "#0b5ed7",
    primaryActive: "#0a58ca",
    primaryDisabled: "#495057",

    secondary: "#6c757d",
    secondaryHover: "#5c636a",
    secondaryActive: "#495057",
    secondaryDisabled: "#6c757d",

    background: "#0d1117",
    backgroundSecondary: "#161b22",
    backgroundTertiary: "#21262d",
    backgroundOverlay: "rgba(0, 0, 0, 0.8)",

    surface: "#161b22",
    surfaceHover: "#21262d",
    surfaceActive: "#30363d",
    surfaceSelected: "#1f6feb",

    text: "#f0f6fc",
    textSecondary: "#8b949e",
    textTertiary: "#6e7681",
    textDisabled: "#484f58",
    textInverse: "#0d1117",

    border: "#30363d",
    borderHover: "#484f58",
    borderActive: "#1f6feb",
    borderDisabled: "#21262d",

    success: "#238636",
    warning: "#d29922",
    error: "#da3633",
    info: "#0969da",

    accent: "#1f6feb",
    accentHover: "#1f6feb",
    accentActive: "#1f6feb",
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
    sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
    base: "0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",
    md: "0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.4), 0 10px 10px rgba(0, 0, 0, 0.3)",
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
    primary: "#6c757d",
    primaryHover: "#5a6268",
    primaryActive: "#495057",

    background: "#f8f9fa",
    backgroundSecondary: "#e9ecef",
    backgroundTertiary: "#dee2e6",

    surface: "#ffffff",
    surfaceHover: "#f8f9fa",
    surfaceActive: "#e9ecef",
    surfaceSelected: "#e2e3e5",
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
    primary: "#ffc107",
    primaryHover: "#e0a800",
    primaryActive: "#d39e00",

    background: "#fff8e1",
    backgroundSecondary: "#fff3c4",
    backgroundTertiary: "#ffecb3",

    surface: "#ffffff",
    surfaceHover: "#fff8e1",
    surfaceActive: "#fff3c4",
    surfaceSelected: "#fff9c4",

    accent: "#ffc107",
    accentHover: "#e0a800",
    accentActive: "#d39e00",

    banana: "#ffc107",
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
    primary: "#e91e63",
    primaryHover: "#c2185b",
    primaryActive: "#ad1457",

    background: "#fce4ec",
    backgroundSecondary: "#f8bbd9",
    backgroundTertiary: "#f48fb1",

    surface: "#ffffff",
    surfaceHover: "#fce4ec",
    surfaceActive: "#f8bbd9",
    surfaceSelected: "#fce4ec",

    accent: "#e91e63",
    accentHover: "#c2185b",
    accentActive: "#ad1457",

    strawberry: "#e91e63",
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
    primary: "#8d6e63",
    primaryHover: "#795548",
    primaryActive: "#6d4c41",

    background: "#f5f3f0",
    backgroundSecondary: "#ede7e0",
    backgroundTertiary: "#d7ccc8",

    surface: "#ffffff",
    surfaceHover: "#f5f3f0",
    surfaceActive: "#ede7e0",
    surfaceSelected: "#f5f3f0",

    accent: "#8d6e63",
    accentHover: "#795548",
    accentActive: "#6d4c41",

    peanut: "#8d6e63",
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
    background: "#000000",
    backgroundSecondary: "#1a1a1a",
    backgroundTertiary: "#333333",

    surface: "#1a1a1a",
    surfaceHover: "#333333",
    surfaceActive: "#4d4d4d",
    surfaceSelected: "#0066cc",

    text: "#ffffff",
    textSecondary: "#cccccc",
    textTertiary: "#999999",

    border: "#666666",
    borderHover: "#999999",
    borderActive: "#0066cc",

    primary: "#0066cc",
    primaryHover: "#0052a3",
    primaryActive: "#003d7a",
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
    background: "#ffffff",
    backgroundSecondary: "#f0f0f0",
    backgroundTertiary: "#e0e0e0",

    surface: "#ffffff",
    surfaceHover: "#f0f0f0",
    surfaceActive: "#e0e0e0",
    surfaceSelected: "#0066cc",

    text: "#000000",
    textSecondary: "#333333",
    textTertiary: "#666666",

    border: "#000000",
    borderHover: "#333333",
    borderActive: "#0066cc",

    primary: "#0066cc",
    primaryHover: "#0052a3",
    primaryActive: "#003d7a",
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
