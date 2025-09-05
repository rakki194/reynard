/**
 * Internationalization module - handles language switching and translations
 * Based on yipyap's proven i18n system with 37 language support
 */

import { createSignal, createEffect } from "solid-js";

/** Supported language codes from yipyap */
export const languages = [
  { code: "en", name: "English" },
  { code: "ja", name: "日本語" },
  { code: "fr", name: "Français" },
  { code: "ru", name: "Русский" },
  { code: "zh", name: "简体中文" },
  { code: "sv", name: "Svenska" },
  { code: "pl", name: "Polski" },
  { code: "uk", name: "Українська" },
  { code: "fi", name: "Suomi" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "pt-BR", name: "Português (Brasil)" },
  { code: "ko", name: "한국어" },
  { code: "nl", name: "Nederlands" },
  { code: "tr", name: "Türkçe" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "th", name: "ไทย" },
  { code: "ar", name: "العربية" },
  { code: "he", name: "עברית" },
  { code: "hi", name: "हिन्दी" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "cs", name: "Čeština" },
  { code: "el", name: "Ελληνικά" },
  { code: "hu", name: "Magyar" },
  { code: "ro", name: "Română" },
  { code: "bg", name: "Български" },
  { code: "da", name: "Dansk" },
  { code: "nb", name: "Norsk" },
  { code: "sk", name: "Slovenčina" },
  { code: "sl", name: "Slovenščina" },
  { code: "hr", name: "Hrvatski" },
  { code: "et", name: "Eesti" },
  { code: "lv", name: "Latviešu" },
  { code: "lt", name: "Lietuvių" },
  { code: "mt", name: "Malti" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];
export type Locale = LanguageCode;

/** Translation dictionary structure */
export interface Translations {
  [key: string]: string | Translations;
}

/** Translation functions type */
export type TranslationFunction = (
  key: string,
  params?: Record<string, any>,
) => string;

/** Gets initial locale from localStorage, browser, or defaults to 'en' */
export const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") return "en";

  const saved = localStorage.getItem("locale") as Locale;
  if (saved && languages.some((lang) => lang.code === saved)) {
    return saved;
  }

  const browserLang = navigator.language.split("-")[0] as Locale;
  if (languages.some((lang) => lang.code === browserLang)) {
    return browserLang;
  }

  return "en";
};

/** RTL languages list */
export const rtlLanguages: Set<Locale> = new Set(["ar", "he"] as Locale[]);

/** Check if a language is RTL */
export const isRTL = (locale: Locale): boolean => rtlLanguages.has(locale);

/** Helper function to get nested translation values with interpolation */
export function getTranslationValue(
  translations: Translations,
  path: string,
  params?: Record<string, any>,
): string {
  const keys = path.split(".");
  let value: any = translations;

  for (const key of keys) {
    if (value && typeof value === "object") {
      value = value[key];
    } else {
      return path; // Return key if translation not found
    }
  }

  if (typeof value !== "string") {
    return path; // Return key if final value is not a string
  }

  // Interpolate parameters if provided
  if (params) {
    return Object.entries(params).reduce(
      (str, [key, val]) =>
        str.replace(new RegExp(`\\{${key}\\}`, "g"), String(val)),
      value,
    );
  }

  return value;
}

export interface I18nModule {
  locale: () => Locale;
  readonly isRTL: boolean;
  readonly languages: typeof languages;
  setLocale: (locale: Locale) => void;
  setTranslations: (translations: Translations) => void;
  t: TranslationFunction;
}

export const createI18nModule = (
  initialTranslations: Translations = {},
): I18nModule => {
  const [locale, setLocaleSignal] = createSignal<Locale>(getInitialLocale());
  const [translations, setTranslationsSignal] =
    createSignal<Translations>(initialTranslations);

  // Initialize with initial locale from localStorage/browser if available
  const initialLocale = getInitialLocale();
  if (initialLocale !== "en") {
    setLocaleSignal(initialLocale);
  }

  // Persist locale changes and apply RTL
  createEffect(() => {
    const currentLocale = locale();
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", currentLocale);
      document.documentElement.setAttribute("lang", currentLocale);
      document.documentElement.setAttribute(
        "dir",
        isRTL(currentLocale) ? "rtl" : "ltr",
      );
    }
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleSignal(newLocale);
  };

  const setTranslations = (newTranslations: Translations) => {
    setTranslationsSignal(newTranslations);
  };

  const t: TranslationFunction = (
    key: string,
    params?: Record<string, any>,
  ) => {
    return getTranslationValue(translations(), key, params);
  };

  return {
    locale,
    get isRTL() {
      return isRTL(locale());
    },
    languages,
    setLocale,
    setTranslations,
    t,
  };
};
