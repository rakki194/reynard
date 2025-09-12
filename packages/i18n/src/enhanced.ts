/**
 * Enhanced i18n features for Reynard framework
 * Debugging, performance monitoring, and advanced translation features
 */

import type {
  LanguageCode,
  I18nModule,
} from "./types";

// Module factory
import { createBaseI18nModule } from "./module-factory";

// Translation engine
import { loadTranslations } from "./translation-engine";

// Intl API integration
import { isRTL, languages } from "./utils";

// Debugging and validation tools
import {
  I18nDebugger,
  I18nPerformanceMonitor,
} from "./debugger";

// Enhanced i18n module interface
export interface EnhancedI18nModule extends I18nModule {
  // Enhanced features
  debugger: I18nDebugger;
  performanceMonitor: I18nPerformanceMonitor;
  intlFormatter: any;
  templateTranslator: any;
  pluralTranslator: any;

  // Namespace loading
  loadNamespace: <T = any>(namespace: string) => Promise<T>;

  // Cache management
  clearCache: (locale?: LanguageCode) => void;
  getCacheStats: () => any;
}

// Re-export loadTranslations for compatibility
export { loadTranslations };

// Re-export types for compatibility
export type { EnhancedI18nOptions } from "./module-factory";

// Enhanced i18n module creation with all new features
export function createEnhancedI18nModule(options: unknown = {}): unknown {
  const { locale, setLocale, translationEngine } = createBaseI18nModule(options);

  return {
    // Core i18n functionality
    locale,
    get isRTL() {
      return isRTL(locale());
    },
    languages,
    setLocale,
    t: translationEngine.t,
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
  };
}
