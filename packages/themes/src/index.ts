/**
 * Reynard Themes Package
 * Comprehensive theming system with translation support
 */

// Export types
export type {
  Language,
  LanguageCode,
  Locale,
  ReynardContext,
  ThemeAnimations,
  ThemeBorders,
  ThemeColors,
  ThemeConfig,
  ThemeContext,
  ThemeName,
  ThemeProviderProps,
  ThemeShadows,
  ThemeSpacing,
  ThemeTypography,
} from "./types";

// Export theme configurations
export { getAvailableThemes, getTheme, isDarkTheme, isHighContrastTheme, themes } from "./themes";

// Export theme utilities
export {
  applyTheme,
  computeAnimation,
  computeHoverStyles,
  computeTagBackground,
  computeTagColor,
  generateThemeCSS,
} from "./themeUtils";

// Export system theme utilities
export { getSystemThemePreference, getThemeIcon, onSystemThemeChange, supportsReducedMotion } from "./systemThemeUtils";

// Re-export OKLCH utilities from colors for advanced color manipulation
export {
  adjustLightness,
  adjustSaturation,
  createTagColorGenerator,
  formatOKLCH,
  generateColorPalette,
  type OKLCHColor,
} from "reynard-colors";

// Re-export i18n system from reynard-i18n
export { I18nProvider, createI18nModule, isRTL, languages, useI18n as useI18nCore } from "reynard-i18n";

// Export providers and hooks
export { ReynardProvider, useI18n, useReynard, useTheme, useTranslation } from "./ThemeProvider";

// Export OKLCH color system
export {
  generateColorVariant,
  generateComplementaryColors,
  generateOKLCHGradient,
  generateTagColor,
  generateThemeColorPalette,
  getOKLCHCSSColor,
  getOKLCHColor,
} from "./oklchColors";

// Export OKLCH palettes
export { themeOKLCHPalettes } from "./oklchPalettes";

// Export OKLCH hooks
export { useColorPalette, useOKLCHColors, useTagColors, useThemeColors } from "./useOKLCHColors";

// Export color conversion utilities
export {
  // Native OKLCH CSS functions (preferred for modern browsers)
  oklchStringToCSS,
  oklchStringToCSSWithAlpha,
  oklchStringToHex,
  // Legacy RGB conversion functions (for non-CSS use cases)
  oklchStringToRgb,
  oklchToRgb,
  type OKLCH,
  type RGB,
} from "./colorConversion";
