/**
 * Color system types for theming
 */


// Color system interface
export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryDisabled: string;

  // Secondary colors
  secondary: string;
  secondaryHover: string;
  secondaryActive: string;
  secondaryDisabled: string;

  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundOverlay: string;

  // Surface colors
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  surfaceSelected: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;

  // Border colors
  border: string;
  borderHover: string;
  borderActive: string;
  borderDisabled: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Accent colors
  accent: string;
  accentHover: string;
  accentActive: string;

  // Special theme colors
  banana?: string;
  strawberry?: string;
  peanut?: string;
}
