/**
 * Translation engine for Reynard framework
 * Core translation logic and namespace management
 */

import type { LanguageCode, Translations } from "../types";

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

// Engine factory function
function createEngineComponents(
  locale: () => LanguageCode,
  translations: () => Translations,
  setTranslations: (translations: Translations) => void,
  options: ReturnType<typeof extractEngineOptions>
) {
  const t = createCoreTranslationFunction(locale, translations, {
    enableDebug: options.enableDebug,
    enablePerformanceMonitoring: options.enablePerformanceMonitoring,
  });

  const loadingEffect = createTranslationLoadingEffect(locale, setTranslations, {
    enablePerformanceMonitoring: options.enablePerformanceMonitoring,
    intlConfig: options.intlConfig,
    usedNamespaces: options.usedNamespaces,
    preloadLocales: options.preloadLocales,
    initialTranslations: options.initialTranslations,
  });

  const i18nDebugger = {} as Record<string, unknown>; // Placeholder - I18nDebugger not available
  const features = createTranslationFeatures(t, locale);
  const namespaceLoader = createNamespaceLoader(locale, loadingEffect.optimizedLoader);
  const cacheManager = createCacheManager();

  return {
    t,
    loadingEffect,
    i18nDebugger,
    features,
    namespaceLoader,
    cacheManager,
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
  const parsedOptions = extractEngineOptions(options);
  const components = createEngineComponents(locale, translations, setTranslations, parsedOptions);

  return {
    debugger: components.i18nDebugger,
    performanceMonitor: components.loadingEffect.performanceMonitor,
    intlFormatter: components.loadingEffect.intlFormatter,
    ...components.features,
    ...components.namespaceLoader,
    ...components.cacheManager,
    optimizedLoader: components.loadingEffect.optimizedLoader,
    t: components.t,
  };
}
