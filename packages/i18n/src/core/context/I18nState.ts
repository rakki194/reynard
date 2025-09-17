/**
 * I18n State Management
 *
 * Handles reactive state for locale and translations.
 */

import { createSignal } from "solid-js";
import type { LanguageCode, Translations } from "../../types";
import { getInitialLocale } from "../../utils";

export function createI18nState(initialTranslations?: Partial<Translations>) {
  const [locale, setLocaleSignal] = createSignal<LanguageCode>(getInitialLocale());
  const [translations] = createSignal<Translations>((initialTranslations as Translations) || ({} as Translations));

  return {
    locale,
    setLocaleSignal,
    translations,
  };
}
