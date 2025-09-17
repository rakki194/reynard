/**
 * Type definitions for Reynard i18n system
 * Based on yipyap's comprehensive translation architecture
 *
 * This module aggregates all type definitions from specialized modules.
 */

// Import and re-export all type definitions from specialized modules
export type {
  LanguageCode,
  Locale,
  Language,
  TranslationParams,
  TranslationValue,
  TranslationFunction,
  CommonTranslations,
  ThemeTranslations,
  TranslationContext,
} from "./core/common-types";

export type {
  CoreTranslations,
  ComponentTranslations,
  GalleryTranslations,
  ChartTranslations,
  AuthTranslations,
  ChatTranslations,
  MonacoTranslations,
} from "./translations/types/translation-types";

export type {
  PluralForms,
  PluralizationRule,
  PluralizationRules,
  PluralizationContext,
  PluralizationResult,
  PluralizationConfig,
  EnhancedPluralization,
} from "./pluralization/pluralization-types";

export type {
  LanguageDetectionResult,
  LanguageConfig,
  ExtendedLanguage,
  LanguagePack,
  LanguageLoadingStatus,
  LanguageSwitchContext,
  LanguageValidationResult,
  LanguageStatistics,
} from "./core/language-types";

export type { SettingsTranslations } from "../translations/types/settings-translations";

// Import types needed for the main Translations interface
import type { CommonTranslations, ThemeTranslations } from "./core/common-types";
import type {
  CoreTranslations,
  ComponentTranslations,
  GalleryTranslations,
  ChartTranslations,
  AuthTranslations,
  ChatTranslations,
  MonacoTranslations,
} from "./translations/types/translation-types";
import type { SettingsTranslations } from "../translations/types/settings-translations";

// Main translations interface - Enhanced with Yipyap's comprehensive structure
export interface Translations {
  common: CommonTranslations;
  themes: ThemeTranslations;
  core: CoreTranslations;
  components: ComponentTranslations;
  gallery: GalleryTranslations;
  charts: ChartTranslations;
  auth: AuthTranslations;
  chat: ChatTranslations;
  monaco: MonacoTranslations;
  // Enhanced translations from Yipyap
  settings?: SettingsTranslations;
  // Index signature for compatibility
  [key: string]: unknown;
}

// Import additional types for I18nModule
import type { LanguageCode, Language, TranslationFunction } from "./core/common-types";

// Enhanced I18n module interface with proper Translations type
export interface I18nModule {
  locale: () => LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  languages: Language[];
  t: TranslationFunction;
  isRTL: boolean;
  loadTranslations: (locale: LanguageCode) => Promise<Translations>;
  // Additional properties used by the core implementation
  translations: () => Translations;
  getCurrentLocale: () => LanguageCode;
  getCurrentTranslations: () => Translations;
  isCurrentLocaleRTL: () => boolean;
}

// Enhanced i18n options interface
export interface EnhancedI18nOptions {
  initialTranslations?: Partial<Translations>;
  enableDebug?: boolean;
  enablePerformanceMonitoring?: boolean;
  intlConfig?: Partial<IntlConfig>;
  usedNamespaces?: string[];
  preloadLocales?: LanguageCode[];
}

// Import enhanced types
import type {
  CacheStats,
  IntlFormatter,
  TemplateTranslator,
  PluralTranslator,
  I18nDebugger,
  I18nPerformanceMonitor,
  TranslationManager,
  TranslationAnalytics,
} from "./core/i18n-utilities-types";

// Re-export enhanced types
export type {
  CacheStats,
  DebugStats,
  IntlFormatter,
  TemplateTranslator,
  PluralTranslator,
  I18nDebugger,
  I18nPerformanceMonitor,
  TranslationManager,
  TranslationAnalytics,
} from "./core/i18n-utilities-types";

// Re-export Intl classes
export {
  IntlNumberFormatter,
  IntlDateFormatter,
  IntlRelativeTimeFormatter,
  IntlPluralRules,
} from "./core/intl-classes";

// Enhanced i18n module interface
export interface EnhancedI18nModule extends I18nModule {
  // Enhanced features
  debugger: I18nDebugger;
  performanceMonitor: I18nPerformanceMonitor;
  intlFormatter: IntlFormatter;
  templateTranslator: TemplateTranslator;
  pluralTranslator: PluralTranslator;

  // Namespace loading
  loadNamespace: <T = unknown>(namespace: string) => Promise<T>;

  // Cache management
  clearCache: (locale?: LanguageCode) => void;
  getCacheStats: () => CacheStats;

  // Enterprise features
  translationManager: TranslationManager;
  analytics: TranslationAnalytics;
}

// Intl configuration interface
export interface IntlConfig {
  locale: LanguageCode;
  timeZone?: string;
  currency?: string;
  numberingSystem?: string;
}
