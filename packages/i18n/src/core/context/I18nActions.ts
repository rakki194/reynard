/**
 * I18n Actions
 *
 * Handles translation actions and locale management.
 */

import type { LanguageCode, TranslationParams, TranslationFunction, Translations } from "../../types";
import { getTranslationValue, isRTL } from "../../utils";

export function createI18nActions(
  locale: () => LanguageCode,
  translations: () => Translations,
  setLocaleSignal: (locale: LanguageCode) => void
) {
  const setLocale = (newLocale: LanguageCode) => {
    setLocaleSignal(newLocale);
    localStorage.setItem("reynard-locale", newLocale);
  };

  const t: TranslationFunction = (key: string, params?: TranslationParams) => {
    return getTranslationValue(translations(), key, params, locale());
  };

  const getCurrentLocale = () => locale();
  const getCurrentTranslations = () => translations();
  const isCurrentLocaleRTL = () => isRTL(locale());

  return {
    setLocale,
    t,
    getCurrentLocale,
    getCurrentTranslations,
    isCurrentLocaleRTL,
  };
}
