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
  ReynardContext,
  ThemeProviderProps,
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

// Re-export i18n system from reynard-i18n
export {
  languages,
  isRTL,
  useI18n as useI18nCore,
  I18nProvider,
  createI18nModule,
} from "reynard-i18n";

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
