/**
 * Analytics i18n features for Reynard framework
 * Translation management, analytics, and production-ready enterprise functionality
 */

import type { LanguageCode, TranslationFunction, TranslationParams, I18nModule } from "../../types";

// Module factory
import { createBaseI18nModule } from "../../core/providers/module-factory";

// Translation engine
import { loadTranslations } from "../../translations/translation-engine";

// Intl API integration
import { isRTL, languages } from "../../utils";

// Enterprise tools
import { TranslationManager, TranslationAnalytics } from "../enterprise";

// Debugging and validation tools
import { I18nDebugger } from "../debug/I18nDebugger";
import { createPerformanceMonitor } from "../performance/performance-monitor";

// Analytics i18n module interface
export interface AnalyticsI18nModule extends I18nModule {
  // Enhanced features
  debugger: I18nDebugger;
  performanceMonitor: ReturnType<typeof createPerformanceMonitor>;
  intlFormatter: unknown;
  templateTranslator: unknown;
  pluralTranslator: unknown;

  // Namespace loading
  loadNamespace: <T = unknown>(namespace: string) => Promise<T>;

  // Cache management
  clearCache: (locale?: LanguageCode) => void;
  getCacheStats: () => unknown;

  // Analytics features
  translationManager: TranslationManager;
  analytics: TranslationAnalytics;
}

// Analytics i18n module creation with all features
export function createAnalyticsI18nModule(options: unknown = {}): AnalyticsI18nModule {
  const { locale, setLocale, translations, translationEngine } = createBaseI18nModule(options);

  // Initialize analytics features
  const translationManager = new TranslationManager({
    locale: locale(),
  });
  const analytics = new TranslationAnalytics();
  const i18nDebugger = new I18nDebugger();
  const performanceMonitor = createPerformanceMonitor();

  // Enhanced translation function with analytics
  const t: TranslationFunction = (key: string, params?: TranslationParams) => {
    analytics.trackUsage(key, locale());
    return translationEngine.t(key, params);
  };

  const baseModule = {
    locale,
    get isRTL() {
      return isRTL(locale());
    },
    languages,
    setLocale,
    t,
    loadTranslations: (locale: LanguageCode) => loadTranslations(locale),
    getCurrentLocale: () => locale(),
    getCurrentTranslations: () => translations(),
    isCurrentLocaleRTL: () => isRTL(locale()),
    translations: () => translations(),
  };

  return {
    ...baseModule,

    // Enhanced features
    debugger: i18nDebugger,
    performanceMonitor,
    intlFormatter: translationEngine.intlFormatter,
    templateTranslator: translationEngine.templateTranslator,
    pluralTranslator: translationEngine.pluralTranslator,

    // Namespace loading
    loadNamespace: translationEngine.loadNamespace,

    // Cache management
    clearCache: translationEngine.clearCache,
    getCacheStats: translationEngine.getCacheStats,

    // Analytics features
    translationManager,
    analytics,
  };
}
