/**
 * Core i18n functionality for Reynard framework
 * Essential translation and locale management
 */

export { I18nProvider, useI18n } from "./I18nContext";
export { createI18nState } from "./I18nState";
export { createI18nActions } from "./I18nActions";

import type { I18nModule, Translations } from "../../types";
import { createI18nState } from "./I18nState";
import { createI18nActions } from "./I18nActions";

// Core i18n module creation
export function createCoreI18nModule(initialTranslations?: Partial<Translations>): I18nModule {
  const { locale, setLocaleSignal, translations } = createI18nState(initialTranslations);
  const actions = createI18nActions(locale, translations, setLocaleSignal);

  return {
    locale,
    translations,
    ...actions,
    // Add missing properties with default implementations
    languages: [],
    isRTL: false,
    loadTranslations: async () => ({}) as Translations,
  };
}

// Basic i18n module creation (alias for core)
export const createBasicI18nModule = createCoreI18nModule;
