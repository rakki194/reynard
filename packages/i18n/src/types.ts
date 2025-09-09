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
