/**
 * Common type definitions for the Reynard i18n system.
 *
 * This module contains shared types and interfaces used across
 * the internationalization system.
 */

// Supported language codes (37 languages)
export type LanguageCode =
  | "en"
  | "ja"
  | "fr"
  | "ru"
  | "zh"
  | "sv"
  | "pl"
  | "uk"
  | "fi"
  | "de"
  | "es"
  | "it"
  | "pt"
  | "pt-BR"
  | "ko"
  | "nl"
  | "tr"
  | "vi"
  | "th"
  | "ar"
  | "he"
  | "hi"
  | "id"
  | "cs"
  | "el"
  | "hu"
  | "ro"
  | "bg"
  | "da"
  | "nb"
  | "sk"
  | "sl"
  | "hr"
  | "et"
  | "lv"
  | "lt"
  | "mt";

export type Locale = LanguageCode;

// Language metadata
export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

// Translation parameter types
export type TranslationParams = {
  count?: number;
  name?: string;
  [key: string]: string | number | undefined;
};

// Translation value can be a string or a function
export type TranslationValue = string | ((params: TranslationParams) => string);

// Translation function type
export type TranslationFunction = {
  (key: string): string;
  (key: string, params?: TranslationParams): string;
};

// Common UI translations
export interface CommonTranslations {
  // Basic actions
  close: string;
  delete: string;
  cancel: string;
  save: string;
  edit: string;
  add: string;
  remove: string;
  loading: string;
  error: string;
  success: string;
  confirm: string;
  download: string;
  upload: string;
  ok: string;
  open: string;
  copy: string;
  warning: string;
  info: string;
  update: string;
  clear: string;

  // Navigation
  home: string;
  back: string;
  next: string;
  previous: string;

  // Data
  path: string;
  size: string;
  date: string;
  name: string;
  type: string;
  actions: string;
  search: string;
  filter: string;
  apply: string;
  reset: string;
  selected: string;
  all: string;
  none: string;
  notFound: string;

  // UI elements
  toggleTheme: string;
  theme: string;
  language: string;
  description: string;
  settings: string;
  help: string;
  about: string;
}

// Theme translations
export interface ThemeTranslations {
  theme: string;
  light: string;
  gray: string;
  dark: string;
  banana: string;
  strawberry: string;
  peanut: string;
  "high-contrast-black": string;
  "high-contrast-inverse": string;
}

// Translation context interface
export interface TranslationContext {
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  t: TranslationFunction;
  languages: Language[];
  isRTL: boolean;
}
