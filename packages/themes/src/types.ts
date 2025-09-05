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

// Translation parameter types
export type TranslationParams = {
  count?: number;
  folders?: number;
  images?: number;
  name?: string;
  [key: string]: string | number | undefined;
};

// Translation value type
export type TranslationValue = string | ((params: TranslationParams) => string);

// Translation function type
export type TranslationFunction = {
  (key: string): string;
  (key: string, params: TranslationParams): string;
};

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

// Translation context interface
export interface TranslationContext {
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  t: TranslationFunction;
  languages: Language[];
  isRTL: boolean;
}

// Language interface
export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

// Common translations interface
export interface CommonTranslations {
  close: string;
  delete: string;
  cancel: string;
  save: string;
  edit: string;
  add: string;
  remove: string;
  loading: string;
  error: string;
  success: string;
  confirm: string;
  download: string;
  path: string;
  size: string;
  date: string;
  name: string;
  type: string;
  actions: string;
  search: string;
  filter: string;
  apply: string;
  reset: string;
  selected: string;
  all: string;
  none: string;
  notFound: string;
  toggleTheme: string;
  theme: string;
  language: string;
  description: string;
  upload: string;
  ok: string;
  open: string;
  copy: string;
  warning: string;
  info: string;
  update: string;
  clear: string;
}

// Theme translations interface
export interface ThemeTranslations {
  light: string;
  gray: string;
  dark: string;
  banana: string;
  strawberry: string;
  peanut: string;
  "high-contrast-black": string;
  "high-contrast-inverse": string;
}

// Main translations interface
export interface Translations {
  common: CommonTranslations;
  themes: ThemeTranslations;
  [key: string]: any; // Allow for additional translation sections
}

// Icon mapping for theme-specific icons
export interface ThemeIconMapping {
  [key: string]: string; // theme name -> icon name
}

// Theme provider props
export interface ThemeProviderProps {
  defaultTheme?: ThemeName;
  defaultLocale?: LanguageCode;
  children: any;
}

// Combined context interface
export interface ReynardContext {
  theme: ThemeContext;
  translation: TranslationContext;
}
