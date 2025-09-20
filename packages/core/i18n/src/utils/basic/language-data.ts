/**
 * Language Data and Basic Utilities
 * Core language definitions and basic helper functions
 */

import type { LanguageCode, Language } from "../../types";

// Supported languages with metadata
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
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski" },
  { code: "et", name: "Estonian", nativeName: "Eesti" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "mt", name: "Maltese", nativeName: "Malti" },
];

// Get language by code
export function getLanguage(code: LanguageCode): Language | undefined {
  return languages.find(lang => lang.code === code);
}

// Check if language is RTL
export function isRTL(locale: LanguageCode): boolean {
  const language = getLanguage(locale);
  return language?.rtl || false;
}

// Validate language code
export function isValidLanguageCode(code: string): code is LanguageCode {
  return languages.some(lang => lang.code === code);
}

// Get language name in native script
export function getNativeLanguageName(code: LanguageCode): string {
  const language = getLanguage(code);
  return language?.nativeName || language?.name || code;
}

// Get language name in English
export function getEnglishLanguageName(code: LanguageCode): string {
  const language = getLanguage(code);
  return language?.name || code;
}

// Check if language has complex pluralization rules
export function hasComplexPluralization(code: LanguageCode): boolean {
  const complexLanguages = ["ar", "ru", "pl", "cs", "ro"];
  return complexLanguages.includes(code);
}

// Get pluralization categories for a language
export function getPluralizationCategories(code: LanguageCode): string[] {
  const categories: Record<string, string[]> = {
    ar: ["zero", "one", "two", "few", "many", "other"],
    ru: ["one", "few", "many", "other"],
    pl: ["one", "few", "many", "other"],
    cs: ["one", "few", "many", "other"],
    ro: ["one", "few", "many", "other"],
  };

  return categories[code] || ["one", "other"];
}
