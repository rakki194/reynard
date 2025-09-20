/**
 * Enhanced i18n module for Reynard framework
 * Comprehensive internationalization system with 37 language support
 * Now with bundle optimization, debugging, Intl API integration, and enterprise features
 */

// Core i18n functionality
export { I18nProvider, useI18n, createCoreI18nModule, createBasicI18nModule } from "./core";

// Module factory
export { createBaseI18nModule, type EnhancedI18nOptions } from "./core/providers/module-factory";

// Options parser
export { parseI18nOptions, type ParsedI18nOptions } from "./core/providers/options-parser";

// Locale manager
export { applyLocaleSideEffects, createLocaleManager } from "./core/providers/locale-manager";

// Debug i18n features
export { loadTranslations, createDebugI18nModule, type DebugI18nModule } from "./features/debug/debug-i18n";

// Analytics i18n features
export { createAnalyticsI18nModule } from "./features/analytics/analytics-i18n";

// Legacy exports for backward compatibility
import { createAnalyticsI18nModule } from "./features/analytics/analytics-i18n";
export const translations = {}; // Placeholder for backward compatibility

// Main i18n module creation function (analytics by default)
export function createI18nModule(options: unknown = {}): unknown {
  return createAnalyticsI18nModule(options);
}

// Export all types and utilities
export type {
  LanguageCode,
  Language,
  Translations,
  TranslationParams,
  TranslationFunction,
  I18nModule,
  TranslationContext,
  PluralForms,
} from "./types";

// Export enhanced types
export type { IntlConfig } from "./intl/IntlConfig";

// Core utilities
export {
  languages,
  getInitialLocale,
  isRTL,
  getTranslationValue,
  formatNumber,
  formatDate,
  formatCurrency,
  isValidLanguageCode,
  getNativeLanguageName,
  getEnglishLanguageName,
  hasComplexPluralization,
  getPluralizationCategories,
  // Advanced pluralization functions
  getRussianPlural,
  getArabicPlural,
  getPolishPlural,
  getSpanishPlural,
  getTurkishPlural,
  getCzechPlural,
  getRomanianPlural,
  getPortuguesePlural,
  // Grammar helpers
  getHungarianArticle,
  getHungarianSuffix,
} from "./utils";

export { getPlural, createPluralTranslation, pluralRules } from "./utils/pluralization/plurals";

// Enhanced loading system
export { loadNamespace, createOptimizedLoader, clearTranslationCache, getCacheStats } from "./loaders";

// Debugging and validation
export { createDebugStats } from "./features/debug";
export type { DebugStats } from "./features/debug";

// Intl API integration
export { createDateFormatter, createNumberFormatter, createRelativeFormatter } from "./intl/formatters";

// Migration and enterprise tools
// export { TranslationManager, TranslationAnalytics } from "./migration";
