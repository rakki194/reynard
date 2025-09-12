/**
 * Translation Utilities
 * Core translation value extraction and parameter substitution
 */

import type { LanguageCode, TranslationParams } from "../../types";
import { getPlural } from "../../plurals";

// Helper function to get nested translation values with type safety
export function getTranslationValue(
  obj: Record<string, unknown>,
  path: string,
  params?: TranslationParams,
  locale: LanguageCode = "en",
): string {
  const value = path.split(".").reduce((acc: any, part) => acc?.[part], obj);

  // Debug logging removed

  if (typeof value === "function") {
    return (value as (params: TranslationParams) => string)(params || {});
  }

  // Check if this is a pluralization object
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const pluralObj = value as Record<string, string>;
    // Check if it has pluralization keys
    if (pluralObj.zero || pluralObj.one || pluralObj.few || pluralObj.many || pluralObj.other) {
      if (params && typeof params.count === "number") {
        const pluralResult = getPlural(params.count, pluralObj as any, locale);
        // Debug logging removed
        // Interpolate parameters in the plural result
        if (pluralResult && params !== undefined) {
          let result = pluralResult;
          Object.entries(params).forEach(([key, val]) => {
            result = result.replace(`{${key}}`, val?.toString() || "");
          });
          return result;
        }
        return pluralResult || "";
      }
      // If no count parameter or invalid count, return the key (fallback behavior)
      return path;
    }
  }

  if (typeof value === "string" && params !== undefined) {
    let result = value;
    
    // Replace placeholders with provided parameters
    Object.entries(params).forEach(([key, val]) => {
      result = result.replace(`{${key}}`, val?.toString() || "");
    });
    
    // If params is an empty object, replace all remaining placeholders with empty strings
    if (Object.keys(params).length === 0) {
      result = result.replace(/\{[^}]+\}/g, "");
    }
    
    return result;
  }

  return (typeof value === "string" ? value : "") || path;
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
export function formatDate(
  date: Date,
  locale: LanguageCode,
  options?: Intl.DateTimeFormatOptions,
): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

// Format currency according to locale
export function formatCurrency(
  value: number,
  locale: LanguageCode,
  currency = "USD",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}
