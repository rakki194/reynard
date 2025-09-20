/**
 * Barrel export for all theme types
 */

// Core theme types
export type { ThemeName, LanguageCode, Locale, Language, ThemeIconMapping } from "./theme";

// Color system types
export type { ThemeColors } from "./colors";

// Configuration types
export type { ThemeAnimations, ThemeTypography, ThemeSpacing, ThemeShadows, ThemeBorders, ThemeConfig } from "./config";

// Context types
export type { ThemeContext, ThemeProviderProps, ReynardContext } from "./context";

// i18n types
export type { TranslationParams, getTranslationValue, TranslationFunction, Translations } from "./i18n";
