/**
 * Translation engine for Reynard framework
 * Core translation logic and namespace management
 */

import type {
  LanguageCode,
  Translations,
} from "../types";

// Core translation functionality
import {
  loadTranslations as loadTranslationsCore,
  createCoreTranslationFunction,
  createTranslationLoadingEffect,
} from "./translation-core";

// Re-export loadTranslations for compatibility
export { loadTranslationsCore as loadTranslations };

// Debugging and validation tools
// I18nDebugger is not available, using placeholder

// Intl API integration
import type { IntlConfig } from "../intl";

// Focused modules
import { createTranslationFeatures } from "./translation-features";
import { createNamespaceLoader } from "./translation-namespace";
import { createCacheManager } from "../loaders/cache/translation-cache";

// Helper function to extract options
function extractEngineOptions(options: {
  enableDebug?: boolean;
  enablePerformanceMonitoring?: boolean;
  intlConfig?: Partial<IntlConfig>;
  usedNamespaces?: string[];
  preloadLocales?: LanguageCode[];
  initialTranslations?: Partial<Translations>;
}) {
  return {
    enableDebug: options.enableDebug ?? false,
    enablePerformanceMonitoring: options.enablePerformanceMonitoring ?? false,
    intlConfig: options.intlConfig ?? {},
    usedNamespaces: options.usedNamespaces ?? [],
    preloadLocales: options.preloadLocales ?? [],
    initialTranslations: options.initialTranslations,
  };
}

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
    enableDebug,
    enablePerformanceMonitoring,
    intlConfig,
    usedNamespaces,
    preloadLocales,
    initialTranslations,
  } = extractEngineOptions(options);

  const t = createCoreTranslationFunction(locale, translations, {
    enableDebug,
    enablePerformanceMonitoring,
  });

  const loadingEffect = createTranslationLoadingEffect(locale, setTranslations, {
    enablePerformanceMonitoring,
    intlConfig,
    usedNamespaces,
    preloadLocales,
    initialTranslations,
  });

  const i18nDebugger = {} as any; // Placeholder - I18nDebugger not available
  const features = createTranslationFeatures(t, locale);
  const namespaceLoader = createNamespaceLoader(locale, loadingEffect.optimizedLoader);
  const cacheManager = createCacheManager();

  return {
    debugger: i18nDebugger,
    performanceMonitor: loadingEffect.performanceMonitor,
    intlFormatter: loadingEffect.intlFormatter,
    ...features,
    ...namespaceLoader,
    ...cacheManager,
    optimizedLoader: loadingEffect.optimizedLoader,
    t,
  };
}
