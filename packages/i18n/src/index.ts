/**
 * Enhanced i18n module for Reynard framework
 * Comprehensive internationalization system with 37 language support
 * Now with bundle optimization, debugging, Intl API integration, and enterprise features
 */

import {
  createSignal,
  createEffect,
  createContext,
  useContext,
} from "solid-js";
import type {
  LanguageCode,
  Translations,
  TranslationParams,
  TranslationFunction,
  I18nModule,
  TranslationContext,
} from "./types";
import {
  languages,
  getInitialLocale,
  isRTL,
  getTranslationValue,
} from "./utils";

// Enhanced loading system with caching and namespace support
import {
  loadTranslationsWithCache,
  loadNamespace,
  createOptimizedLoader,
  clearTranslationCache,
  getCacheStats,
  preloadTranslations,
  fullTranslations,
} from "./loader";

// Debugging and validation tools
import {
  createTemplateTranslator,
  createDebugPluralTranslator,
  I18nDebugger,
  I18nPerformanceMonitor,
} from "./debugger";

// Intl API integration
import {
  createIntlFormatter,
  type IntlConfig,
} from "./intl";

// Migration and enterprise tools
import {
  TranslationManager,
  TranslationAnalytics,
} from "./migration";

// Legacy exports for backward compatibility
export const translations = fullTranslations;

// Enhanced translation loading function with caching
export async function loadTranslations(
  locale: LanguageCode,
  useCache: boolean = true
): Promise<Translations> {
  return loadTranslationsWithCache(locale, useCache);
}

// Create i18n context
const I18nContext = createContext<TranslationContext>();

export const I18nProvider = I18nContext.Provider;

// Main i18n composable
export function useI18n(): TranslationContext {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Enhanced i18n module creation with all new features
export interface EnhancedI18nOptions {
  initialTranslations?: Partial<Translations>;
  enableDebug?: boolean;
  enablePerformanceMonitoring?: boolean;
  intlConfig?: Partial<IntlConfig>;
  usedNamespaces?: string[];
  preloadLocales?: LanguageCode[];
}

export interface EnhancedI18nModule extends I18nModule {
  // Enhanced features
  debugger: I18nDebugger;
  performanceMonitor: I18nPerformanceMonitor;
  intlFormatter: ReturnType<typeof createIntlFormatter>;
  templateTranslator: ReturnType<typeof createTemplateTranslator>;
  pluralTranslator: ReturnType<typeof createDebugPluralTranslator>;
  
  // Namespace loading
  loadNamespace: <T = any>(namespace: string) => Promise<T>;
  
  // Cache management
  clearCache: (locale?: LanguageCode) => void;
  getCacheStats: () => ReturnType<typeof getCacheStats>;
  
  // Enterprise features
  translationManager: TranslationManager;
  analytics: TranslationAnalytics;
}

export function createI18nModule(
  options: any = {}
): any {
  // Handle both direct translations parameter and options object
  let initialTranslations: Partial<Translations> | undefined;
  let enableDebug = false;
  let enablePerformanceMonitoring = false;
  let intlConfig = {};
  let usedNamespaces: string[] = [];
  let preloadLocales: LanguageCode[] = [];

  if (options && typeof options === 'object' && !Array.isArray(options)) {
    // Check if this is the options object format
    if ('initialTranslations' in options) {
      // Options object format
      ({
        initialTranslations,
        enableDebug = false,
        enablePerformanceMonitoring = false,
        intlConfig = {},
        usedNamespaces = [],
        preloadLocales = []
      } = options);
    } else {
      // Direct translations object format (legacy)
      initialTranslations = options as Partial<Translations>;
    }
  } else if (options && typeof options === 'object') {
    // Direct translations object format (legacy)
    initialTranslations = options as Partial<Translations>;
  }

  const [locale, setLocaleSignal] = createSignal<LanguageCode>(getInitialLocale());
  const [translations, _setTranslationsSignal] = createSignal<Translations>(
    (initialTranslations as Translations) || ({} as Translations),
  );

  // Debug logging removed

  // Initialize enhanced features
  const i18nDebugger = new I18nDebugger({} as I18nModule, enableDebug);
  const performanceMonitor = new I18nPerformanceMonitor();
  const intlFormatter = createIntlFormatter({
    locale: locale(),
    ...intlConfig
  });
  const translationManager = new TranslationManager({
    locale: locale(),
    ...intlConfig
  });
  const analytics = new TranslationAnalytics();

  // Create optimized loader if namespaces are specified
  const optimizedLoader = usedNamespaces.length > 0 
    ? createOptimizedLoader(usedNamespaces)
    : null;

  // Initialize with initial locale from localStorage/browser if available
  const initialLocale = getInitialLocale();
  if (initialLocale !== "en") {
    setLocaleSignal(initialLocale);
  }

  // Preload specified locales
  if (preloadLocales.length > 0) {
    preloadTranslations(preloadLocales);
  }

  // Persist locale changes, apply RTL, and load translations
  createEffect(async () => {
    const currentLocale = locale();
    if (typeof window !== "undefined") {
      localStorage.setItem("reynard-locale", currentLocale);
      document.documentElement.setAttribute("lang", currentLocale);
      document.documentElement.setAttribute(
        "dir",
        isRTL(currentLocale) ? "rtl" : "ltr",
      );
      
      // Update Intl formatter with new locale
      intlFormatter.updateConfig({ locale: currentLocale });
      
      // Only load translations if no initial translations were provided
      if (!initialTranslations) {
        try {
          const startTime = performance.now();
          const loadedTranslations = optimizedLoader 
            ? await optimizedLoader.loadFull(currentLocale)
            : await loadTranslations(currentLocale);
          
          const loadTime = performance.now() - startTime;
          if (enablePerformanceMonitoring) {
            performanceMonitor.recordLoadTime(loadTime);
          }
          
          _setTranslationsSignal(loadedTranslations);
        } catch (error) {
          console.error("Failed to load translations for locale:", currentLocale, error);
        }
      }
    }
  });

  const setLocale = (newLocale: LanguageCode) => {
    setLocaleSignal(newLocale);
  };

  // Enhanced translation function with debugging and analytics
  const t: TranslationFunction = (key: string, params?: TranslationParams) => {
    if (enableDebug) {
      i18nDebugger.getUsedKeys().push(key);
    }
    
    if (enablePerformanceMonitoring) {
      performanceMonitor.recordTranslationCall();
    }
    
    analytics.trackUsage(key, locale());
    
    const currentTranslations = translations();
    
    // Debug: Check what's actually in the translations object
    if (key === "common.complex") {
      console.error('🦊 DEBUG common.complex:', JSON.stringify({
        currentTranslations,
        initialTranslations
      }, null, 2));
    }
    
    const result = getTranslationValue(
      currentTranslations as unknown as Record<string, unknown>,
      key,
      params,
    );
    
    return result;
  };

  // Enhanced features
  const templateTranslator = createTemplateTranslator(t);
  const pluralTranslator = createDebugPluralTranslator(t, locale);

  // Namespace loading function
  const loadNamespaceFunc = async <T = any>(namespace: string): Promise<T> => {
    const currentLocale = locale();
    if (optimizedLoader) {
      return optimizedLoader.loadNamespace<T>(currentLocale, namespace);
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
    debugger: i18nDebugger,
    performanceMonitor,
    intlFormatter,
    templateTranslator,
    pluralTranslator,
    
    // Namespace loading
    loadNamespace: loadNamespaceFunc,
    
    // Cache management
    clearCache,
    getCacheStats: getCacheStatsFunc,
    
    // Enterprise features
    translationManager,
    analytics,
  };
}

// Legacy function for backward compatibility
export function createBasicI18nModule(
  initialTranslations?: Partial<Translations>,
): I18nModule {
  return createI18nModule({ initialTranslations });
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
// export type { EnhancedI18nOptions } from "./types";

// Export enhanced features
export type {
  IntlConfig,
} from "./intl";

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
export {
  TranslationManager,
  TranslationAnalytics,
} from "./migration";
