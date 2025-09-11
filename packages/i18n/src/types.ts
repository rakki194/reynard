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
} from "./common-types";

export type {
  CoreTranslations,
  ComponentTranslations,
  GalleryTranslations,
  ChartTranslations,
  AuthTranslations,
  ChatTranslations,
  MonacoTranslations,
} from "./translation-types";

export type {
  PluralForms,
  PluralizationRule,
  PluralizationRules,
  PluralizationContext,
  PluralizationResult,
  PluralizationConfig,
  EnhancedPluralization,
} from "./pluralization-types";

export type {
  LanguageDetectionResult,
  LanguageConfig,
  ExtendedLanguage,
  LanguagePack,
  LanguageLoadingStatus,
  LanguageSwitchContext,
  LanguageValidationResult,
  LanguageStatistics,
} from "./language-types";

export type { SettingsTranslations } from "./settings-translation-types";

// Import types needed for the main Translations interface
import type { CommonTranslations, ThemeTranslations } from "./common-types";
import type {
  CoreTranslations,
  ComponentTranslations,
  GalleryTranslations,
  ChartTranslations,
  AuthTranslations,
  ChatTranslations,
  MonacoTranslations,
} from "./translation-types";
import type { SettingsTranslations } from "./settings-translation-types";

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
}

// Import additional types for I18nModule
import type {
  LanguageCode,
  Language,
  TranslationFunction,
} from "./common-types";

// Enhanced I18n module interface with proper Translations type
export interface I18nModule {
  locale: () => LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  languages: Language[];
  t: TranslationFunction;
  isRTL: boolean;
  loadTranslations: (locale: LanguageCode) => Promise<Translations>;
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

// Enhanced i18n module interface
export interface EnhancedI18nModule extends I18nModule {
  // Enhanced features
  debugger: any; // I18nDebugger
  performanceMonitor: any; // I18nPerformanceMonitor
  intlFormatter: any; // ReturnType<typeof createIntlFormatter>
  templateTranslator: any; // ReturnType<typeof createTemplateTranslator>
  pluralTranslator: any; // ReturnType<typeof createDebugPluralTranslator>
  
  // Namespace loading
  loadNamespace: <T = any>(namespace: string) => Promise<T>;
  
  // Cache management
  clearCache: (locale?: LanguageCode) => void;
  getCacheStats: () => any;
  
  // Enterprise features
  translationManager: any; // TranslationManager
  analytics: any; // TranslationAnalytics
}

// Intl configuration interface
export interface IntlConfig {
  locale: LanguageCode;
  timeZone?: string;
  currency?: string;
  numberingSystem?: string;
}
