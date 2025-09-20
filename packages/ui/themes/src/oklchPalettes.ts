/**
 * OKLCH Color Palettes
 * Theme-specific OKLCH color definitions
 */

import type { ThemeName } from "./types";
import type { OKLCHColor } from "reynard-colors";

/**
 * OKLCH Color Palette for each theme
 * These are the base OKLCH colors that define each theme's identity
 */
export const themeOKLCHPalettes: Record<ThemeName, Record<string, OKLCHColor>> = {
  light: {
    primary: { l: 60, c: 0.25, h: 240 }, // Blue
    secondary: { l: 50, c: 0.05, h: 0 }, // Neutral gray
    accent: { l: 60, c: 0.25, h: 240 }, // Same as primary
    background: { l: 98, c: 0.01, h: 0 }, // Near white
    surface: { l: 95, c: 0.02, h: 0 }, // Light gray
    text: { l: 15, c: 0.01, h: 0 }, // Dark text
    success: { l: 55, c: 0.2, h: 140 }, // Green
    warning: { l: 75, c: 0.2, h: 80 }, // Yellow
    error: { l: 55, c: 0.25, h: 20 }, // Red
    info: { l: 60, c: 0.2, h: 200 }, // Cyan
  },
  dark: {
    primary: { l: 65, c: 0.25, h: 240 }, // Brighter blue for dark
    secondary: { l: 60, c: 0.05, h: 0 }, // Light gray
    accent: { l: 65, c: 0.25, h: 240 }, // Same as primary
    background: { l: 15, c: 0.01, h: 0 }, // Dark background
    surface: { l: 25, c: 0.02, h: 0 }, // Dark surface
    text: { l: 90, c: 0.01, h: 0 }, // Light text
    success: { l: 60, c: 0.2, h: 140 }, // Green
    warning: { l: 70, c: 0.2, h: 80 }, // Yellow
    error: { l: 60, c: 0.25, h: 20 }, // Red
    info: { l: 65, c: 0.2, h: 200 }, // Cyan
  },
  gray: {
    primary: { l: 50, c: 0.0, h: 0 }, // Pure gray
    secondary: { l: 45, c: 0.0, h: 0 }, // Darker gray
    accent: { l: 50, c: 0.0, h: 0 }, // Same as primary
    background: { l: 95, c: 0.01, h: 0 }, // Light gray
    surface: { l: 90, c: 0.02, h: 0 }, // Medium gray
    text: { l: 20, c: 0.01, h: 0 }, // Dark text
    success: { l: 55, c: 0.15, h: 140 }, // Muted green
    warning: { l: 70, c: 0.15, h: 80 }, // Muted yellow
    error: { l: 55, c: 0.2, h: 20 }, // Muted red
    info: { l: 60, c: 0.15, h: 200 }, // Muted cyan
  },
  banana: {
    primary: { l: 75, c: 0.2, h: 60 }, // Yellow
    secondary: { l: 50, c: 0.05, h: 0 }, // Neutral
    accent: { l: 75, c: 0.2, h: 60 }, // Same as primary
    background: { l: 95, c: 0.05, h: 60 }, // Light yellow tint
    surface: { l: 90, c: 0.08, h: 60 }, // Yellow surface
    text: { l: 20, c: 0.01, h: 0 }, // Dark text
    success: { l: 60, c: 0.2, h: 140 }, // Green
    warning: { l: 75, c: 0.2, h: 60 }, // Yellow (same as primary)
    error: { l: 55, c: 0.25, h: 20 }, // Red
    info: { l: 65, c: 0.2, h: 200 }, // Cyan
  },
  strawberry: {
    primary: { l: 60, c: 0.25, h: 340 }, // Pink
    secondary: { l: 50, c: 0.05, h: 0 }, // Neutral
    accent: { l: 60, c: 0.25, h: 340 }, // Same as primary
    background: { l: 95, c: 0.05, h: 340 }, // Light pink tint
    surface: { l: 90, c: 0.08, h: 340 }, // Pink surface
    text: { l: 20, c: 0.01, h: 0 }, // Dark text
    success: { l: 60, c: 0.2, h: 140 }, // Green
    warning: { l: 70, c: 0.2, h: 80 }, // Yellow
    error: { l: 60, c: 0.25, h: 340 }, // Pink (same as primary)
    info: { l: 65, c: 0.2, h: 200 }, // Cyan
  },
  peanut: {
    primary: { l: 45, c: 0.15, h: 30 }, // Brown
    secondary: { l: 50, c: 0.05, h: 0 }, // Neutral
    accent: { l: 45, c: 0.15, h: 30 }, // Same as primary
    background: { l: 90, c: 0.03, h: 30 }, // Light brown tint
    surface: { l: 85, c: 0.05, h: 30 }, // Brown surface
    text: { l: 20, c: 0.01, h: 0 }, // Dark text
    success: { l: 55, c: 0.2, h: 140 }, // Green
    warning: { l: 70, c: 0.2, h: 80 }, // Yellow
    error: { l: 55, c: 0.25, h: 20 }, // Red
    info: { l: 60, c: 0.2, h: 200 }, // Cyan
  },
  "high-contrast-black": {
    primary: { l: 70, c: 0.3, h: 240 }, // Bright blue
    secondary: { l: 60, c: 0.0, h: 0 }, // Pure gray
    accent: { l: 70, c: 0.3, h: 240 }, // Same as primary
    background: { l: 5, c: 0.0, h: 0 }, // Pure black
    surface: { l: 15, c: 0.01, h: 0 }, // Dark surface
    text: { l: 95, c: 0.01, h: 0 }, // Bright white
    success: { l: 70, c: 0.3, h: 140 }, // Bright green
    warning: { l: 80, c: 0.3, h: 80 }, // Bright yellow
    error: { l: 70, c: 0.3, h: 20 }, // Bright red
    info: { l: 75, c: 0.3, h: 200 }, // Bright cyan
  },
  "high-contrast-inverse": {
    primary: { l: 30, c: 0.3, h: 240 }, // Dark blue
    secondary: { l: 40, c: 0.0, h: 0 }, // Dark gray
    accent: { l: 30, c: 0.3, h: 240 }, // Same as primary
    background: { l: 95, c: 0.0, h: 0 }, // Pure white
    surface: { l: 85, c: 0.01, h: 0 }, // Light surface
    text: { l: 5, c: 0.01, h: 0 }, // Pure black
    success: { l: 30, c: 0.3, h: 140 }, // Dark green
    warning: { l: 20, c: 0.3, h: 80 }, // Dark yellow
    error: { l: 30, c: 0.3, h: 20 }, // Dark red
    info: { l: 25, c: 0.3, h: 200 }, // Dark cyan
  },
};
