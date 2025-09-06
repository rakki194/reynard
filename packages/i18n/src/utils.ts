/**
 * Utility functions for Reynard i18n system
 * Based on yipyap's proven utility functions
 */

import type { LanguageCode, Language, TranslationParams } from './types';

// Supported languages with metadata
export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'nb', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
];

// Helper function to get the path separator based on locale and platform
export function getPathSeparator(locale: LanguageCode): string {
  if (locale === 'ja') return '￥';
  return navigator.userAgent.toLowerCase().includes('win') ? ' \\ ' : ' / ';
}

// Helper function to get nested translation values with type safety
export function getTranslationValue(
  obj: any,
  path: string,
  params?: TranslationParams
): string {
  const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
  
  if (typeof value === 'function') {
    return value(params || {});
  }
  
  if (typeof value === 'string' && params) {
    return Object.entries(params).reduce(
      (str, [key, val]) => str.replace(`{${key}}`, val?.toString() || ''),
      value
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
  if (typeof navigator === 'undefined') return 'en';
  
  const browserLang = navigator.language || (navigator as any).userLanguage;
  const langCode = browserLang.split('-')[0] as LanguageCode;

  // Check if we support this language
  if (languages.some((lang) => lang.code === langCode)) {
    return langCode;
  }

  // Check for full locale (e.g., pt-BR)
  if (languages.some((lang) => lang.code === browserLang)) {
    return browserLang as LanguageCode;
  }

  return 'en'; // Default fallback
}

// Get initial locale from localStorage or browser
export function getInitialLocale(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  
  const stored = localStorage.getItem('reynard-locale') as LanguageCode;
  if (stored && languages.some((lang) => lang.code === stored)) {
    return stored;
  }
  
  return getBrowserLocale();
}

// Format number according to locale
export function formatNumber(value: number, locale: LanguageCode): string {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return value.toString();
  }
}

// Format date according to locale
export function formatDate(date: Date, locale: LanguageCode, options?: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

// Format currency according to locale
export function formatCurrency(value: number, locale: LanguageCode, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

// Validate language code
export function isValidLanguageCode(code: string): code is LanguageCode {
  return languages.some((lang) => lang.code === code);
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

// Check if locale has complex pluralization
export function hasComplexPluralization(locale: LanguageCode): boolean {
  const complexPluralLanguages: LanguageCode[] = ['ar', 'ru', 'uk', 'pl', 'cs', 'bg', 'ro'];
  return complexPluralLanguages.includes(locale);
}

// Get pluralization categories for a locale
export function getPluralizationCategories(locale: LanguageCode): string[] {
  switch (locale) {
    case 'ar':
      return ['zero', 'one', 'two', 'few', 'many', 'other'];
    case 'ru':
    case 'uk':
    case 'pl':
    case 'cs':
    case 'bg':
      return ['one', 'few', 'many'];
    case 'ro':
      return ['one', 'few', 'many'];
    default:
      return ['one', 'other'];
  }
}
