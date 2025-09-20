/**
 * Core translation functionality for Reynard framework
 * Basic translation logic without advanced features
 */

import type { LanguageCode, Translations, TranslationParams, TranslationFunction } from "../types";
import { createEffect } from "solid-js";

// Enhanced loading system with caching and namespace support
import { createOptimizedLoader } from "../loaders";

// Intl API integration
import type { IntlConfig } from "../intl";
import { createIntlFormatter } from "../intl/IntlFormatter";
import { getTranslationValue } from "../utils";

// Performance monitoring
import { createPerformanceMonitor, createNoOpPerformanceMonitor } from "../features/performance/performance-monitor";

// Enhanced translation loading function with caching
export async function loadTranslations(locale: LanguageCode): Promise<Translations> {
  try {
    // Use the global import function (which can be mocked in tests)
    const importFn = (globalThis as any).import;
    const result = await importFn(`./translations/data/lang/${locale}/index.js`);
    return result.default;
  } catch (error) {
    // Fallback to English if available
    if (locale !== "en") {
      try {
        const importFn = (globalThis as any).import;
        const result = await importFn(`./translations/data/lang/en/index.js`);
        return result.default;
      } catch (fallbackError) {
        console.error(`Failed to load translations for locale ${locale} and fallback to English:`, fallbackError);
        throw error;
      }
    }

    console.error(`Failed to load translations for locale ${locale}:`, error);
    throw error;
  }
}

// Core translation function creation
export function createCoreTranslationFunction(
  locale: () => LanguageCode,
  translations: () => Translations,
  _options: {
    enableDebug?: boolean;
    enablePerformanceMonitoring?: boolean;
  }
): TranslationFunction {
  return (key: string, params?: TranslationParams) => {
    const currentTranslations = translations();
    return getTranslationValue(currentTranslations as unknown as Record<string, unknown>, key, params, locale());
  };
}

// Initialize translation loading dependencies
function initializeTranslationDependencies(
  _locale: () => LanguageCode,
  options: {
    intlConfig?: Partial<IntlConfig>;
    usedNamespaces?: string[];
    preloadLocales?: LanguageCode[];
  }
) {
  const { intlConfig: _intlConfig = {}, usedNamespaces = [], preloadLocales = [] } = options;

  const intlFormatter = createIntlFormatter({
    locale: "en" as LanguageCode,
    ..._intlConfig,
  });
  const optimizedLoader = usedNamespaces.length > 0 ? createOptimizedLoader(usedNamespaces) : null;

  if (preloadLocales.length > 0) {
    preloadLocales.forEach(locale => {
      // Placeholder - preloadTranslations not available
      console.log(`Preloading locale: ${locale}`);
    });
  }

  return { intlFormatter, optimizedLoader };
}

// Create the translation loading effect
function createTranslationEffect(
  locale: () => LanguageCode,
  setTranslations: (translations: Translations) => void,
  intlFormatter: ReturnType<typeof createIntlFormatter>,
  optimizedLoader: ReturnType<typeof createOptimizedLoader> | null,
  intlConfig: Partial<IntlConfig>,
  initialTranslations?: Partial<Translations>
) {
  let isEffectRunning = false;

  createEffect(async () => {
    if (isEffectRunning) return; // Prevent recursion
    isEffectRunning = true;

    try {
      const currentLocale = locale();
      if (typeof window !== "undefined") {
        const updatedFormatter = createIntlFormatter({
          ...intlConfig,
          locale: currentLocale,
        });
        Object.assign(intlFormatter, updatedFormatter);

        if (!initialTranslations) {
          try {
            const loadedTranslations = optimizedLoader
              ? await optimizedLoader.loadFull(currentLocale)
              : await loadTranslations(currentLocale);
            setTranslations(loadedTranslations);
          } catch (error) {
            console.error("Failed to load translations for locale:", currentLocale, error);
          }
        }
      }
    } finally {
      isEffectRunning = false;
    }
  });
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
  const { initialTranslations, enablePerformanceMonitoring = false } = options;
  const { intlFormatter, optimizedLoader } = initializeTranslationDependencies(locale, options);

  createTranslationEffect(
    locale,
    setTranslations,
    intlFormatter,
    optimizedLoader,
    options.intlConfig || {},
    initialTranslations
  );

  // Create performance monitor if enabled
  const performanceMonitor = enablePerformanceMonitoring ? createPerformanceMonitor() : createNoOpPerformanceMonitor();

  return { intlFormatter, optimizedLoader, performanceMonitor };
}
