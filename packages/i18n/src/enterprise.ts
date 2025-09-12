/**
 * Enterprise i18n features for Reynard framework
 * Translation management, analytics, and advanced enterprise functionality
 */

import type {
  LanguageCode,
  TranslationFunction,
  I18nModule,
} from "./types";

// Module factory
import { createBaseI18nModule } from "./module-factory";

// Translation engine
import { loadTranslations } from "./translation-engine";

// Intl API integration
import { isRTL, languages } from "./utils";

// Migration and enterprise tools
import { TranslationManager, TranslationAnalytics } from "./migration";

// Enhanced i18n module interface
export interface EnhancedI18nModule extends I18nModule {
  // Enhanced features
  debugger: any;
  performanceMonitor: any;
  intlFormatter: any;
  templateTranslator: any;
  pluralTranslator: any;

  // Namespace loading
  loadNamespace: <T = any>(namespace: string) => Promise<T>;

  // Cache management
  clearCache: (locale?: LanguageCode) => void;
  getCacheStats: () => any;

  // Enterprise features
  translationManager: TranslationManager;
  analytics: TranslationAnalytics;
}

// Enterprise i18n module creation with all features
export function createEnterpriseI18nModule(options: unknown = {}): unknown {
  const { locale, setLocale, translationEngine } = createBaseI18nModule(options);

  // Initialize enterprise features
  const translationManager = new TranslationManager({
    locale: locale(),
  });
  const analytics = new TranslationAnalytics();

  // Enhanced translation function with analytics
  const t: TranslationFunction = (key: string, params?: any) => {
    analytics.trackUsage(key, locale());
    return translationEngine.t(key, params);
  };

  return {
    // Core i18n functionality
    locale,
    get isRTL() {
      return isRTL(locale());
    },
    languages,
    setLocale,
    t,
    loadTranslations: (locale: LanguageCode) => loadTranslations(locale),

    // Enhanced features
    debugger: translationEngine.debugger,
    performanceMonitor: translationEngine.performanceMonitor,
    intlFormatter: translationEngine.intlFormatter,
    templateTranslator: translationEngine.templateTranslator,
    pluralTranslator: translationEngine.pluralTranslator,

    // Namespace loading
    loadNamespace: translationEngine.loadNamespace,
    optimizedLoader: translationEngine.optimizedLoader,

    // Cache management
    clearCache: translationEngine.clearCache,
    getCacheStats: translationEngine.getCacheStats,

    // Enterprise features
    translationManager,
    analytics,
  };
}
