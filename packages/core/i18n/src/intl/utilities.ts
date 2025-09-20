/**
 * Intl Utility Functions
 *
 * Standalone utility functions for common Intl formatting operations
 */

import type { LanguageCode } from "../types";

/**
 * Format a number with the specified locale
 */
export function formatNumber(value: number, locale: LanguageCode): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format a date with the specified locale
 */
export function formatDate(date: Date, locale: LanguageCode): string {
  return new Intl.DateTimeFormat(locale).format(date);
}

/**
 * Format currency with the specified locale and currency code
 */
export function formatCurrency(value: number, locale: LanguageCode, currency: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

/**
 * Format relative time with the specified locale
 */
export function formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit, locale: LanguageCode): string {
  return new Intl.RelativeTimeFormat(locale).format(value, unit);
}
