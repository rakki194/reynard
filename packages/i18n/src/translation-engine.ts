/**
 * Translation engine for Reynard framework
 * Core translation logic and namespace management
 */

import type {
  LanguageCode,
  Translations,
  I18nModule,
} from "./types";

// Core translation functionality
import {
  loadTranslations as loadTranslationsCore,
  createCoreTranslationFunction,
  createTranslationLoadingEffect,
} from "./translation-core";

// Re-export loadTranslations for compatibility
export { loadTranslationsCore as loadTranslations };

// Debugging and validation tools
import {
  createTemplateTranslator,
  createDebugPluralTranslator,
  I18nDebugger,
} from "./debugger";

// Intl API integration
import type { IntlConfig } from "./intl";

// Enhanced loading system
import {
  loadNamespace,
  clearTranslationCache,
  getCacheStats,
} from "./loader";

// Translation engine creation
export function createTranslationEngine(
  locale: () => LanguageCode,
  translations: () => Translations,
  setTranslations: (translations: Translations) => void,
  options: {
    enableDebug?: boolean;
    enablePerformanceMonitoring?: boolean;
    intlConfig?: Partial<IntlConfig>;
    usedNamespaces?: string[];
    preloadLocales?: LanguageCode[];
    initialTranslations?: Partial<Translations>;
  }
) {
  const {
    enableDebug = false,
    enablePerformanceMonitoring = false,
    intlConfig = {},
    usedNamespaces = [],
    preloadLocales = [],
    initialTranslations,
  } = options;

  // Create core translation function
  const t = createCoreTranslationFunction(locale, translations, {
    enableDebug,
    enablePerformanceMonitoring,
  });

  // Create translation loading effect
  const loadingEffect = createTranslationLoadingEffect(
    locale,
    setTranslations,
    {
      enablePerformanceMonitoring,
      intlConfig,
      usedNamespaces,
      preloadLocales,
      initialTranslations,
    }
  );

  // Initialize debugging features
  const i18nDebugger = new I18nDebugger({} as I18nModule, enableDebug);

  // Enhanced features
  const templateTranslator = createTemplateTranslator(t);
  const pluralTranslator = createDebugPluralTranslator(t, locale);

  // Namespace loading function
  const loadNamespaceFunc = async <T = any>(namespace: string): Promise<T> => {
    const currentLocale = locale();
    if (loadingEffect.optimizedLoader) {
      return loadingEffect.optimizedLoader.loadNamespace<T>(currentLocale, namespace);
    }
    return loadNamespace<T>(currentLocale, namespace);
  };

  // Cache management
  const clearCache = (locale?: LanguageCode) => {
    clearTranslationCache(locale);
  };

  const getCacheStatsFunc = () => {
    return getCacheStats();
  };

  return {
    // Enhanced features
    debugger: i18nDebugger,
    performanceMonitor: loadingEffect.performanceMonitor,
    intlFormatter: loadingEffect.intlFormatter,
    templateTranslator,
    pluralTranslator,

    // Namespace loading
    loadNamespace: loadNamespaceFunc,
    optimizedLoader: loadingEffect.optimizedLoader,

    // Cache management
    clearCache,
    getCacheStats: getCacheStatsFunc,

    // Translation function
    t,
  };
}
