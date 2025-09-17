/**
 * Locale management for Reynard i18n framework
 * Handles locale changes and side effects
 */

import type { LanguageCode } from "../../types";
import { isRTL } from "../../utils";

// Translation engine type
interface TranslationEngine {
  intlFormatter: {
    number: {
      format: (value: number, options?: Intl.NumberFormatOptions) => string;
      formatInteger: (value: number) => string;
      formatDecimal: (value: number) => string;
      formatCurrency: (value: number, currency?: string) => string;
      formatPercent: (value: number) => string;
      formatCompact: (value: number) => string;
    };
    date: {
      format: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
      formatShort: (date: Date) => string;
      formatMedium: (date: Date) => string;
      formatLong: (date: Date) => string;
      formatFull: (date: Date) => string;
      formatTime: (date: Date) => string;
      formatDateTime: (date: Date) => string;
    };
    relative: {
      format: (value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions) => string;
      formatShort: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
      formatLong: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
      formatFromNow: (date: Date) => string;
    };
  };
}

// Locale side effects management
export function applyLocaleSideEffects(newLocale: LanguageCode, _translationEngine: TranslationEngine) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("reynard-locale", newLocale);
  } catch (error) {
    console.warn("Failed to save locale to localStorage:", error);
  }

  try {
    document.documentElement.setAttribute("lang", newLocale);
    document.documentElement.setAttribute("dir", isRTL(newLocale) ? "rtl" : "ltr");
  } catch (error) {
    console.warn("Failed to update document attributes:", error);
  }

  // Note: The intlFormatter is updated automatically by the translation loading effect
  // when the locale signal changes, so no manual update is needed here
}

// Create locale management functions
export function createLocaleManager(
  setLocaleSignal: (locale: LanguageCode) => void,
  translationEngine: TranslationEngine
) {
  return (newLocale: LanguageCode) => {
    setLocaleSignal(newLocale);
    applyLocaleSideEffects(newLocale, translationEngine);
  };
}
