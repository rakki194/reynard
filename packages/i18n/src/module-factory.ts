/**
 * Module factory for Reynard i18n framework
 * Factory functions for creating different types of i18n modules
 */

import type {
  LanguageCode,
  Translations,
} from "./types";
import { createSignal } from "solid-js";

// Translation engine
import { createTranslationEngine } from "./translation-engine";

// Intl API integration
import type { IntlConfig } from "./intl";
import { isRTL } from "./utils";

// Enhanced i18n options interface
export interface EnhancedI18nOptions {
  initialTranslations?: Partial<Translations>;
  enableDebug?: boolean;
  enablePerformanceMonitoring?: boolean;
  intlConfig?: Partial<IntlConfig>;
  usedNamespaces?: string[];
  preloadLocales?: LanguageCode[];
}

// Options parsing utility
export function parseI18nOptions(options: unknown): {
  initialTranslations?: Partial<Translations>;
  enableDebug: boolean;
  enablePerformanceMonitoring: boolean;
  intlConfig: Partial<IntlConfig>;
  usedNamespaces: string[];
  preloadLocales: LanguageCode[];
} {
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

// Base module creation
export function createBaseI18nModule(options: unknown) {
  const {
    initialTranslations,
    enableDebug,
    enablePerformanceMonitoring,
    intlConfig,
    usedNamespaces,
    preloadLocales,
  } = parseI18nOptions(options);

  const [locale, setLocaleSignal] = createSignal<LanguageCode>("en");
  const [translations, setTranslationsSignal] = createSignal<Translations>(
    (initialTranslations as Translations) || ({} as Translations),
  );

  // Create translation engine
  const translationEngine = createTranslationEngine(
    locale,
    translations,
    setTranslationsSignal,
    {
      enableDebug,
      enablePerformanceMonitoring,
      intlConfig,
      usedNamespaces,
      preloadLocales,
      initialTranslations,
    }
  );

  const setLocale = (newLocale: LanguageCode) => {
    setLocaleSignal(newLocale);

    // Apply side effects immediately for better testability
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("reynard-locale", newLocale);
      } catch (error) {
        // Gracefully handle localStorage errors (e.g., storage full, private browsing)
        console.warn("Failed to save locale to localStorage:", error);
      }

      try {
        document.documentElement.setAttribute("lang", newLocale);
        document.documentElement.setAttribute(
          "dir",
          isRTL(newLocale) ? "rtl" : "ltr",
        );
      } catch (error) {
        // Gracefully handle DOM manipulation errors
        console.warn("Failed to update document attributes:", error);
      }

      // Update Intl formatter with new locale
      translationEngine.intlFormatter.updateConfig({ locale: newLocale });
    }
  };

  return {
    locale,
    setLocale,
    translations,
    translationEngine,
  };
}
