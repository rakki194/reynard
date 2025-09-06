/**
 * Core types for the Reynard theming system
 * Based on yipyap's comprehensive theming approach
 */

// Theme names matching yipyap's theme system
export type ThemeName =
  | "light"
  | "dark"
  | "gray"
  | "banana"
  | "strawberry"
  | "peanut"
  | "high-contrast-black"
  | "high-contrast-inverse";

// Language codes for internationalization
export type LanguageCode =
  | "en"
  | "ja"
  | "fr"
  | "ru"
  | "zh"
  | "sv"
  | "pl"
  | "uk"
  | "fi"
  | "de"
  | "es"
  | "it"
  | "pt"
  | "pt-BR"
  | "ko"
  | "nl"
  | "tr"
  | "vi"
  | "th"
  | "ar"
  | "he"
  | "hi"
  | "id"
  | "cs"
  | "el"
  | "hu"
  | "ro"
  | "bg"
  | "da"
  | "nb";

export type Locale = LanguageCode;

// Re-export i18n types from reynard-i18n
export type {
  TranslationParams,
  getTranslationValue,
  TranslationFunction,
  Translations,
} from "reynard-i18n";

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

// Theme context interface
export interface ThemeContext {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  getTagStyle: (tag: string) => {
    backgroundColor: string;
    color: string;
    hoverStyles: Record<string, string>;
    animation: string;
  };
  isDark: boolean;
  isHighContrast: boolean;
}

// Import i18n context from reynard-i18n for internal use
import type { TranslationContext } from "reynard-i18n";

// Language interface
export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  rtl?: boolean;
}


// Icon mapping for theme-specific icons
export interface ThemeIconMapping {
  [key: string]: string; // theme name -> icon name
}

// Theme provider props
export interface ThemeProviderProps {
  defaultTheme?: ThemeName;
  defaultLocale?: LanguageCode;
}

// Combined context interface
export interface ReynardContext {
  theme: ThemeContext;
  translation: TranslationContext;
}
