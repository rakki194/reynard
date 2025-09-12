/**
 * Enhanced i18n module for Reynard framework
 * Comprehensive internationalization system with 37 language support
 * Now with bundle optimization, debugging, Intl API integration, and enterprise features
 */

// Core i18n functionality
export {
  I18nProvider,
  useI18n,
  createCoreI18nModule,
  createBasicI18nModule,
} from "./core";

// Enhanced i18n features
export {
  loadTranslations,
  createEnhancedI18nModule,
  type EnhancedI18nOptions,
  type EnhancedI18nModule,
} from "./enhanced";

// Enterprise i18n features
export {
  createEnterpriseI18nModule,
} from "./enterprise";

// Legacy exports for backward compatibility
import { fullTranslations } from "./loader";
import { createEnterpriseI18nModule } from "./enterprise";
export const translations = fullTranslations;

// Main i18n module creation function (enterprise by default)
export function createI18nModule(options: unknown = {}): unknown {
  return createEnterpriseI18nModule(options);
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
export type { IntlConfig } from "./intl";

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
  getHungarianArticleForWord,
  getHungarianSuffix,
} from "./utils";

export { getPlural, createPluralTranslation, pluralRules } from "./plurals";

// Enhanced loading system
export {
  loadNamespace,
  createOptimizedLoader,
  clearTranslationCache,
  getCacheStats,
  preloadTranslations,
} from "./loader";

// Debugging and validation
export {
  I18nDebugger,
  I18nPerformanceMonitor,
  createTemplateTranslator,
  createDebugPluralTranslator,
} from "./debugger";

// Intl API integration
export {
  createIntlFormatter,
  IntlNumberFormatter,
  IntlDateFormatter,
  IntlRelativeTimeFormatter,
  IntlPluralRules,
  IntlFormatter,
} from "./intl";

// Migration and enterprise tools
export { TranslationManager, TranslationAnalytics } from "./migration";
