/**
 * Translation system for the Reynard theming package
 * Based on yipyap's comprehensive i18n implementation
 */

import type {
  LanguageCode,
  Language,
  Translations,
  TranslationParams,
} from "./types";

// Supported languages
export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "zh", name: "Chinese", nativeName: "简体中文" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  {
    code: "pt-BR",
    name: "Portuguese (Brazil)",
    nativeName: "Português (Brasil)",
  },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
  { code: "he", name: "Hebrew", nativeName: "עברית", rtl: true },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "nb", name: "Norwegian", nativeName: "Norsk" },
];

// English translations (fallback)
const englishTranslations: Translations = {
  common: {
    close: "Close",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    confirm: "Confirm",
    download: "Download",
    path: "Path",
    size: "Size",
    date: "Date",
    name: "Name",
    type: "Type",
    actions: "Actions",
    search: "Search",
    filter: "Filter",
    apply: "Apply",
    reset: "Reset",
    selected: "Selected",
    all: "All",
    none: "None",
    notFound: "Not found",
    toggleTheme: "Toggle theme",
    theme: "Theme",
    language: "Language",
    description: "Description",
    upload: "Upload",
    ok: "OK",
    open: "Open",
    copy: "Copy",
    warning: "Warning",
    info: "Information",
    update: "Update",
    clear: "Clear",
  },
  themes: {
    light: "Light",
    gray: "Gray",
    dark: "Dark",
    banana: "Banana",
    strawberry: "Strawberry",
    peanut: "Peanut",
    "high-contrast-black": "High Contrast Black",
    "high-contrast-inverse": "High Contrast Inverse",
  },
};

// Translation loading function
export async function loadTranslations(
  locale: LanguageCode,
): Promise<Translations> {
  try {
    // In a real implementation, this would load from separate files
    // For now, we'll return English translations for all locales
    // and add some basic translations for common languages

    if (locale === "en") {
      return englishTranslations;
    }

    // Basic translations for other languages
    const translations: Translations = {
      ...englishTranslations,
      themes: {
        light: getThemeTranslation(locale, "light"),
        gray: getThemeTranslation(locale, "gray"),
        dark: getThemeTranslation(locale, "dark"),
        banana: getThemeTranslation(locale, "banana"),
        strawberry: getThemeTranslation(locale, "strawberry"),
        peanut: getThemeTranslation(locale, "peanut"),
        "high-contrast-black": getThemeTranslation(
          locale,
          "high-contrast-black",
        ),
        "high-contrast-inverse": getThemeTranslation(
          locale,
          "high-contrast-inverse",
        ),
      },
    };

    return translations;
  } catch (error) {
    console.error("Translation loading error:", error);
    return englishTranslations;
  }
}

// Get theme translation for a specific locale
function getThemeTranslation(locale: LanguageCode, theme: string): string {
  const themeTranslations: Partial<
    Record<LanguageCode, Record<string, string>>
  > = {
    en: {
      light: "Light",
      gray: "Gray",
      dark: "Dark",
      banana: "Banana",
      strawberry: "Strawberry",
      peanut: "Peanut",
      "high-contrast-black": "High Contrast Black",
      "high-contrast-inverse": "High Contrast Inverse",
    },
    ja: {
      light: "ライト",
      gray: "グレー",
      dark: "ダーク",
      banana: "バナナ",
      strawberry: "ストロベリー",
      peanut: "ピーナッツ",
      "high-contrast-black": "ハイコントラスト ブラック",
      "high-contrast-inverse": "ハイコントラスト インバース",
    },
    fr: {
      light: "Clair",
      gray: "Gris",
      dark: "Sombre",
      banana: "Banane",
      strawberry: "Fraise",
      peanut: "Cacahuète",
      "high-contrast-black": "Noir à contraste élevé",
      "high-contrast-inverse": "Inverse à contraste élevé",
    },
    es: {
      light: "Claro",
      gray: "Gris",
      dark: "Oscuro",
      banana: "Plátano",
      strawberry: "Fresa",
      peanut: "Cacahuete",
      "high-contrast-black": "Negro de alto contraste",
      "high-contrast-inverse": "Inverso de alto contraste",
    },
    de: {
      light: "Hell",
      gray: "Grau",
      dark: "Dunkel",
      banana: "Banane",
      strawberry: "Erdbeere",
      peanut: "Erdnuss",
      "high-contrast-black": "Schwarz mit hohem Kontrast",
      "high-contrast-inverse": "Invers mit hohem Kontrast",
    },
  };

  return (
    themeTranslations[locale]?.[theme] || themeTranslations.en?.[theme] || theme
  );
}

// Helper function to get nested translation values
export function getTranslationValue(
  obj: any,
  path: string,
  params?: TranslationParams,
): string {
  const value = path.split(".").reduce((acc, part) => acc?.[part], obj);

  if (typeof value === "function") {
    return value(params || {});
  }

  if (typeof value === "string" && params) {
    return Object.entries(params).reduce(
      (str, [key, val]) => str.replace(`{${key}}`, val?.toString() || ""),
      value,
    );
  }

  return value || path;
}

// Get language by code
export function getLanguage(code: LanguageCode): Language | undefined {
  return languages.find((lang) => lang.code === code);
}

// Check if language is RTL
export function isRTL(locale: LanguageCode): boolean {
  const language = getLanguage(locale);
  return language?.rtl || false;
}

// Get browser locale
export function getBrowserLocale(): LanguageCode {
  const browserLang = navigator.language || (navigator as any).userLanguage;
  const langCode = browserLang.split("-")[0] as LanguageCode;

  // Check if we support this language
  if (languages.some((lang) => lang.code === langCode)) {
    return langCode;
  }

  // Check for full locale (e.g., pt-BR)
  if (languages.some((lang) => lang.code === browserLang)) {
    return browserLang as LanguageCode;
  }

  return "en"; // Default fallback
}

// Pluralization helpers for different languages
export function getPluralForm(locale: LanguageCode, count: number): number {
  // Basic pluralization rules
  switch (locale) {
    case "ru":
    case "uk":
    case "pl":
    case "cs":
    case "bg":
      return getSlavicPlural(count);
    case "ar":
    case "he":
      return getArabicPlural(count);
    case "pt":
    case "pt-BR":
      return getPortuguesePlural(count);
    case "es":
      return getSpanishPlural(count);
    case "tr":
      return getTurkishPlural(count);
    default:
      return count === 1 ? 0 : 1; // English rule
  }
}

function getSlavicPlural(count: number): number {
  if (count % 10 === 1 && count % 100 !== 11) return 0; // singular
  if (
    count % 10 >= 2 &&
    count % 10 <= 4 &&
    (count % 100 < 10 || count % 100 >= 20)
  )
    return 1; // few
  return 2; // many
}

function getArabicPlural(count: number): number {
  if (count === 0) return 0; // zero
  if (count === 1) return 1; // one
  if (count === 2) return 2; // two
  if (count % 100 >= 3 && count % 100 <= 10) return 3; // few
  if (count % 100 >= 11 && count % 100 <= 99) return 4; // many
  return 5; // other
}

function getPortuguesePlural(count: number): number {
  return count === 1 ? 0 : 1;
}

function getSpanishPlural(count: number): number {
  return count === 1 ? 0 : 1;
}

function getTurkishPlural(count: number): number {
  return count === 1 ? 0 : 1;
}
