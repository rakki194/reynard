/**
 * Reynard Themes Package
 * Comprehensive theming system with translation support
 */

// Export types
export type {
  ThemeName,
  LanguageCode,
  Locale,
  ThemeConfig,
  ThemeColors,
  ThemeAnimations,
  ThemeTypography,
  ThemeSpacing,
  ThemeShadows,
  ThemeBorders,
  ThemeContext,
  TranslationContext,
  ReynardContext,
  ThemeProviderProps,
  Translations,
  CommonTranslations,
  ThemeTranslations,
  TranslationParams,
  TranslationValue,
  TranslationFunction,
  Language,
} from "./types";

// Export theme configurations
export {
  themes,
  getTheme,
  getAvailableThemes,
  isDarkTheme,
  isHighContrastTheme,
} from "./themes";

// Export theme utilities
export {
  computeTagBackground,
  computeTagColor,
  computeHoverStyles,
  computeAnimation,
  generateThemeCSS,
  applyTheme,
  getThemeIcon,
  supportsReducedMotion,
  getSystemThemePreference,
  onSystemThemeChange,
} from "./themeUtils";

// Export translation system
export {
  languages,
  loadTranslations,
  getTranslationValue,
  getLanguage,
  isRTL,
  getBrowserLocale,
  getPluralForm,
} from "./translations";

// Export providers and hooks
export {
  ReynardProvider,
  useReynard,
  useTheme,
  useTranslation,
  useI18n,
} from "./ThemeProvider";

// Export CSS
import "./themes.css";
