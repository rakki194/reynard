/**
 * i18n Package Translations
 * Core internationalization translations for the i18n package
 */

export const i18n = {
  // Core i18n functionality
  loading: "Loading...",
  error: "Error",
  success: "Success",
  warning: "Warning",
  info: "Information",

  // Language selection
  language: "Language",
  selectLanguage: "Select Language",
  currentLanguage: "Current Language",

  // Translation management
  translations: "Translations",
  missingTranslation: "Missing Translation",
  fallbackTranslation: "Fallback Translation",

  // Pluralization
  pluralization: "Pluralization",
  singular: "Singular",
  plural: "Plural",

  // Locale formatting
  dateFormat: "Date Format",
  timeFormat: "Time Format",
  numberFormat: "Number Format",
  currencyFormat: "Currency Format",

  // Debug and development
  debugMode: "Debug Mode",
  translationKey: "Translation Key",
  namespace: "Namespace",
  locale: "Locale",
} as const;

export default i18n;
