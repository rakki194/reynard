/**
 * Debug i18n features for Reynard framework
 * Debugging, performance monitoring, and development tools for internationalization
 */

import type { LanguageCode, I18nModule } from "../../types";

// Module factory
import { createBaseI18nModule } from "../../core/providers/module-factory";

// Translation engine
import { loadTranslations } from "../../translations/translation-engine";

// Intl API integration
import { isRTL, languages } from "../../utils";

// Debugging and validation tools
import { I18nDebugger } from "./I18nDebugger";
import { createPerformanceMonitor } from "../performance/performance-monitor";

// Debug i18n module interface
export interface DebugI18nModule extends I18nModule {
  // Debug features
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
}

// Re-export loadTranslations for compatibility
export { loadTranslations };

// Re-export types for compatibility
export type { EnhancedI18nOptions } from "../../core/providers/module-factory";

// Debug i18n module creation with all development features
export function createDebugI18nModule(options: unknown = {}): DebugI18nModule {
  const { locale, setLocale, translations, translationEngine } = createBaseI18nModule(options);

  // Initialize debug features
  const i18nDebugger = new I18nDebugger();
  const performanceMonitor = createPerformanceMonitor();

  const baseModule = {
    locale,
    get isRTL() {
      return isRTL(locale());
    },
    languages,
    setLocale,
    t: translationEngine.t,
    loadTranslations: (locale: LanguageCode) => loadTranslations(locale),
    getCurrentLocale: () => locale(),
    getCurrentTranslations: () => translations(),
    isCurrentLocaleRTL: () => isRTL(locale()),
    translations: () => translations(),
  };

  return {
    ...baseModule,

    // Debug features
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
  };
}
