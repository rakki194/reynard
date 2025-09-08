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
} from "./themeUtils";

// Export system theme utilities
export {
  getThemeIcon,
  supportsReducedMotion,
  getSystemThemePreference,
  onSystemThemeChange,
} from "./systemThemeUtils";

// Re-export OKLCH utilities from color-media for advanced color manipulation
export {
  createTagColorGenerator,
  formatOKLCH,
  generateColorPalette,
  adjustLightness,
  adjustSaturation,
  type OKLCHColor,
} from "reynard-color-media";

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

// Export OKLCH color system
export {
  getOKLCHColor,
  getOKLCHCSSColor,
  generateColorVariant,
  generateThemeColorPalette,
  generateTagColor,
  generateComplementaryColors,
  generateOKLCHGradient,
} from "./oklchColors";

// Export OKLCH palettes
export { themeOKLCHPalettes } from "./oklchPalettes";

// Export OKLCH hooks
export {
  useOKLCHColors,
  useTagColors,
  useColorPalette,
  useThemeColors,
} from "./useOKLCHColors";

// Export color conversion utilities
export {
  // Native OKLCH CSS functions (preferred for modern browsers)
  oklchStringToCSS,
  oklchStringToCSSWithAlpha,
  // Legacy RGB conversion functions (for non-CSS use cases)
  oklchStringToRgb,
  oklchStringToHex,
  oklchToRgb,
  type OKLCH,
  type RGB,
} from "./colorConversion";

// Export CSS
import "./themes.css";
import "./oklch-themes.css";
