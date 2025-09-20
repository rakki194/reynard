/**
 * Options parser for Reynard i18n framework
 * Parses and validates i18n configuration options
 */

import type { LanguageCode, Translations } from "../../types";
import type { IntlConfig } from "../../intl/IntlConfig";

// Enhanced i18n options interface
export interface EnhancedI18nOptions {
  initialTranslations?: Partial<Translations>;
  enableDebug?: boolean;
  enablePerformanceMonitoring?: boolean;
  intlConfig?: Partial<IntlConfig>;
  usedNamespaces?: string[];
  preloadLocales?: LanguageCode[];
}

// Parsed options interface
export interface ParsedI18nOptions {
  initialTranslations?: Partial<Translations>;
  enableDebug: boolean;
  enablePerformanceMonitoring: boolean;
  intlConfig: Partial<IntlConfig>;
  usedNamespaces: string[];
  preloadLocales: LanguageCode[];
}

// Options parsing utility
export function parseI18nOptions(options: unknown): ParsedI18nOptions {
  let initialTranslations: Partial<Translations> | undefined;
  let enableDebug = false;
  let enablePerformanceMonitoring = false;
  let intlConfig: Partial<IntlConfig> = {};
  let usedNamespaces: string[] = [];
  let preloadLocales: LanguageCode[] = [];

  if (options && typeof options === "object" && !Array.isArray(options)) {
    // Check if this is the options object format
    if ("initialTranslations" in options) {
      // Options object format
      const opts = options as EnhancedI18nOptions;
      ({
        initialTranslations,
        enableDebug = false,
        enablePerformanceMonitoring = false,
        intlConfig = {},
        usedNamespaces = [],
        preloadLocales = [],
      } = opts);
    } else {
      // Direct translations object format (legacy)
      initialTranslations = options as Partial<Translations>;
    }
  } else if (options && typeof options === "object") {
    // Direct translations object format (legacy)
    initialTranslations = options as Partial<Translations>;
  }

  return {
    initialTranslations,
    enableDebug,
    enablePerformanceMonitoring,
    intlConfig,
    usedNamespaces,
    preloadLocales,
  };
}
