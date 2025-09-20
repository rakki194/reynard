/**
 * Theme configuration types
 */

import type { ThemeColors } from "./colors";

// Animation configuration
export interface ThemeAnimations {
  duration: {
    fast: string;
    base: string;
    slow: string;
  };
  easing: {
    standard: string;
    decelerate: string;
    accelerate: string;
  };
  icon: string; // Icon animation type (sun, moon, cloud, etc.)
}

// Typography configuration
export interface ThemeTypography {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

// Spacing configuration
export interface ThemeSpacing {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
}

// Shadow configuration
export interface ThemeShadows {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
}

// Border configuration
export interface ThemeBorders {
  radius: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  width: {
    thin: string;
    base: string;
    thick: string;
  };
}

// Theme configuration interface
export interface ThemeConfig {
  name: string;
  displayName: string;
  description: string;
  colors: ThemeColors;
  animations: ThemeAnimations;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  borders: ThemeBorders;
}
