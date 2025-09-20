/**
 * Intl API Configuration
 *
 * Configuration types and presets for Intl API formatting.
 */

import type { LanguageCode } from "../types";

// Intl API configuration types
export interface IntlConfig {
  locale: LanguageCode;
  timeZone?: string;
  currency?: string;
  numberingSystem?: string;
}

// Formatting preset types
export interface FormattingPresets {
  number: {
    integer: Intl.NumberFormatOptions;
    decimal: Intl.NumberFormatOptions;
    currency: Intl.NumberFormatOptions;
    percent: Intl.NumberFormatOptions;
    compact: Intl.NumberFormatOptions;
  };
  date: {
    short: Intl.DateTimeFormatOptions;
    medium: Intl.DateTimeFormatOptions;
    long: Intl.DateTimeFormatOptions;
    full: Intl.DateTimeFormatOptions;
    time: Intl.DateTimeFormatOptions;
    datetime: Intl.DateTimeFormatOptions;
  };
  relative: {
    short: Intl.RelativeTimeFormatOptions;
    long: Intl.RelativeTimeFormatOptions;
  };
}

// Default formatting presets
export const defaultFormattingPresets: FormattingPresets = {
  number: {
    integer: { maximumFractionDigits: 0 },
    decimal: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    currency: { style: "currency", currency: "USD", useGrouping: false },
    percent: { style: "percent" },
    compact: { notation: "compact" },
  },
  date: {
    short: { dateStyle: "short" },
    medium: { dateStyle: "medium" },
    long: { dateStyle: "long" },
    full: { dateStyle: "full" },
    time: { timeStyle: "short" },
    datetime: { dateStyle: "short", timeStyle: "short" },
  },
  relative: {
    short: { numeric: "auto" },
    long: { numeric: "auto", style: "long" },
  },
};
