/**
 * Core translation functionality for Reynard framework
 * Basic translation logic without advanced features
 */

import type {
  LanguageCode,
  Translations,
  TranslationParams,
  TranslationFunction,
  I18nModule,
} from "./types";
import { createEffect } from "solid-js";

// Enhanced loading system with caching and namespace support
import {
  loadTranslationsWithCache,
  createOptimizedLoader,
  preloadTranslations,
} from "./loader";

// Debugging and validation tools
import {
  I18nDebugger,
  I18nPerformanceMonitor,
} from "./debugger";

// Intl API integration
import { createIntlFormatter, type IntlConfig } from "./intl";
import { getTranslationValue } from "./utils";

// Enhanced translation loading function with caching
export async function loadTranslations(
  locale: LanguageCode,
  useCache: boolean = true,
): Promise<Translations> {
  return loadTranslationsWithCache(locale, useCache);
}

// Core translation function creation
export function createCoreTranslationFunction(
  locale: () => LanguageCode,
  translations: () => Translations,
  options: {
    enableDebug?: boolean;
    enablePerformanceMonitoring?: boolean;
  }
): TranslationFunction {
  const { enableDebug = false, enablePerformanceMonitoring = false } = options;

  // Initialize debugging features if enabled
  const i18nDebugger = enableDebug ? new I18nDebugger({} as I18nModule, true) : null;
  const performanceMonitor = enablePerformanceMonitoring ? new I18nPerformanceMonitor() : null;

  return (key: string, params?: TranslationParams) => {
    if (enableDebug && i18nDebugger) {
      i18nDebugger.getUsedKeys().push(key);
    }

    if (enablePerformanceMonitoring && performanceMonitor) {
      performanceMonitor.recordTranslationCall();
    }

    const currentTranslations = translations();

    const result = getTranslationValue(
      currentTranslations as unknown as Record<string, unknown>,
      key,
      params,
      locale(),
    );

    return result;
  };
}

// Translation loading effect
export function createTranslationLoadingEffect(
  locale: () => LanguageCode,
  setTranslations: (translations: Translations) => void,
  options: {
    enablePerformanceMonitoring?: boolean;
    intlConfig?: Partial<IntlConfig>;
    usedNamespaces?: string[];
    preloadLocales?: LanguageCode[];
    initialTranslations?: Partial<Translations>;
  }
) {
  const {
    enablePerformanceMonitoring = false,
    intlConfig = {},
    usedNamespaces = [],
    preloadLocales = [],
    initialTranslations,
  } = options;

  // Initialize Intl formatter
  const intlFormatter = createIntlFormatter({
    locale: locale(),
    ...intlConfig,
  });

  // Create optimized loader if namespaces are specified
  const optimizedLoader =
    usedNamespaces.length > 0 ? createOptimizedLoader(usedNamespaces) : null;

  // Initialize performance monitor if enabled
  const performanceMonitor = enablePerformanceMonitoring ? new I18nPerformanceMonitor() : null;

  // Preload specified locales
  if (preloadLocales.length > 0) {
    preloadTranslations(preloadLocales);
  }

  // Persist locale changes, apply RTL, and load translations
  createEffect(async () => {
    const currentLocale = locale();
    if (typeof window !== "undefined") {
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
          if (enablePerformanceMonitoring && performanceMonitor) {
            performanceMonitor.recordLoadTime(loadTime);
          }

          setTranslations(loadedTranslations);
        } catch (error) {
          console.error(
            "Failed to load translations for locale:",
            currentLocale,
            error,
          );
        }
      }
    }
  });

  return {
    intlFormatter,
    optimizedLoader,
    performanceMonitor,
  };
}
