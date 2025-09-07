/**
 * Translation Utilities
 * Core translation value extraction and parameter substitution
 */

import type { LanguageCode, TranslationParams } from '../../types';

// Helper function to get nested translation values with type safety
export function getTranslationValue(
  obj: Record<string, unknown>,
  path: string,
  params?: TranslationParams
): string {
  const value = path.split('.').reduce((acc: any, part) => acc?.[part], obj);
  
  if (typeof value === 'function') {
    return (value as (params: TranslationParams) => string)(params || {});
  }
  
  if (typeof value === 'string' && params) {
    return Object.entries(params).reduce(
      (str, [key, val]) => str.replace(`{${key}}`, val?.toString() || ''),
      value
    );
  }
  
  return (typeof value === 'string' ? value : '') || path;
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
