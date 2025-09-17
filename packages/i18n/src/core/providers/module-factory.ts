/**
 * Module factory for Reynard i18n framework
 * Factory functions for creating different types of i18n modules
 */

import type { LanguageCode, Translations } from "../../types";
import { createSignal } from "solid-js";

// Translation engine
import { createTranslationEngine } from "../../translations/translation-engine";

// Extracted modules
import { parseI18nOptions, type EnhancedI18nOptions } from "./options-parser";
import { createLocaleManager } from "./locale-manager";

// Re-export types for compatibility
export type { EnhancedI18nOptions };

// Base module creation
export function createBaseI18nModule(options: unknown) {
  const { initialTranslations, enableDebug, enablePerformanceMonitoring, intlConfig, usedNamespaces, preloadLocales } =
    parseI18nOptions(options);

  const [locale, setLocaleSignal] = createSignal<LanguageCode>("en");
  const [translations, setTranslationsSignal] = createSignal<Translations>(
    (initialTranslations as Translations) || ({} as Translations)
  );

  const translationEngine = createTranslationEngine(locale, translations, setTranslationsSignal, {
    enableDebug,
    enablePerformanceMonitoring,
    intlConfig,
    usedNamespaces,
    preloadLocales,
    initialTranslations,
  });

  const setLocale = createLocaleManager(setLocaleSignal, translationEngine);

  return {
    locale,
    setLocale,
    translations,
    translationEngine,
  };
}
