/**
 * Date Formatting
 *
 * Date and time formatting utilities using Intl API.
 */

import type { IntlConfig } from "./IntlConfig";
import { defaultFormattingPresets } from "./IntlConfig";

export function createDateFormatter(config: IntlConfig) {
  return {
    format: (date: Date, options?: Intl.DateTimeFormatOptions) => {
      const formatter = new Intl.DateTimeFormat(config.locale, options);
      return formatter.format(date);
    },
    formatShort: (date: Date) => {
      const formatter = new Intl.DateTimeFormat(config.locale, defaultFormattingPresets.date.short);
      return formatter.format(date);
    },
    formatMedium: (date: Date) => {
      const formatter = new Intl.DateTimeFormat(config.locale, defaultFormattingPresets.date.medium);
      return formatter.format(date);
    },
    formatLong: (date: Date) => {
      const formatter = new Intl.DateTimeFormat(config.locale, defaultFormattingPresets.date.long);
      return formatter.format(date);
    },
    formatFull: (date: Date) => {
      const formatter = new Intl.DateTimeFormat(config.locale, defaultFormattingPresets.date.full);
      return formatter.format(date);
    },
    formatTime: (date: Date) => {
      const formatter = new Intl.DateTimeFormat(config.locale, defaultFormattingPresets.date.time);
      return formatter.format(date);
    },
    formatDateTime: (date: Date) => {
      const formatter = new Intl.DateTimeFormat(config.locale, defaultFormattingPresets.date.datetime);
      return formatter.format(date);
    },
  };
}
