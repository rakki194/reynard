/**
 * Translation Utilities
 * Core translation value extraction and parameter substitution
 */

import type { LanguageCode, TranslationParams, PluralForms } from "../../types";
import { getPlural } from "../pluralization/plurals";

// Get the plural form for a given count and locale
function getPluralForm(count: number, locale: string): string {
  // English pluralization rules
  if (locale.startsWith("en")) {
    if (count === 0) return "zero";
    if (count === 1) return "one";
    return "other";
  }

  // Russian pluralization rules
  if (locale.startsWith("ru")) {
    if (count === 0) return "zero";

    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "few";
    return "many";
  }

  // Polish pluralization rules
  if (locale.startsWith("pl")) {
    if (count === 0) return "zero";

    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "few";
    return "many";
  }

  // Default to English rules
  if (count === 0) return "zero";
  if (count === 1) return "one";
  return "other";
}

// Helper function to get nested translation values with type safety
export function getTranslationValue(
  obj: Record<string, unknown>,
  path: string,
  params?: TranslationParams,
  locale: LanguageCode = "en"
): string {
  const value = path.split(".").reduce((acc: unknown, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj as unknown);

  // Debug logging removed

  if (typeof value === "function") {
    return (value as (params: TranslationParams) => string)(params || {});
  }

  // Check if this is a pluralization object
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const pluralObj = value as Record<string, string>;

    // If we have a count parameter, try to get the appropriate plural form
    if (params && typeof params.count === "number") {
      // First, try to get the specific plural form
      const pluralForm = getPluralForm(params.count, locale);
      let pluralResult = pluralObj[pluralForm];

      // If the specific form doesn't exist, fallback to 'other'
      if (!pluralResult && pluralObj.other) {
        pluralResult = pluralObj.other;
      }

      // If we have a result, interpolate parameters
      if (pluralResult) {
        let result = pluralResult;
        Object.entries(params).forEach(([key, val]) => {
          result = result.replace(`{${key}}`, val?.toString() || "");
        });
        return result;
      }
    }

    // Check if it has the required pluralization keys for full pluralization support
    if (pluralObj.one && pluralObj.other && (pluralObj.zero || pluralObj.few || pluralObj.many)) {
      if (params && typeof params.count === "number") {
        const pluralResult = getPlural(params.count, pluralObj as PluralForms, locale);
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

  if (typeof value === "string") {
    // If no params provided, return the template string as-is
    if (params === undefined) {
      return value;
    }

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
export function formatDate(date: Date, locale: LanguageCode, options?: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

// Format currency according to locale
export function formatCurrency(value: number, locale: LanguageCode, currency = "USD"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}
