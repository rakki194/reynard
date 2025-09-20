/**
 * Core theme types and names
 */

// Theme names matching yipyap's theme system
export type ThemeName =
  | "light"
  | "dark"
  | "gray"
  | "banana"
  | "strawberry"
  | "peanut"
  | "high-contrast-black"
  | "high-contrast-inverse";

// Language codes for internationalization
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
  | "nb";

export type Locale = LanguageCode;

// Language interface
export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

// Icon mapping for theme-specific icons
export interface ThemeIconMapping {
  [key: string]: string; // theme name -> icon name
}
