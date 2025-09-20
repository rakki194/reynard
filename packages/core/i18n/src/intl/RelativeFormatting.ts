/**
 * Relative Time Formatting
 *
 * Relative time formatting utilities using Intl API.
 */

import type { IntlConfig } from "./IntlConfig";
import { defaultFormattingPresets } from "./IntlConfig";

export function createRelativeFormatter(config: IntlConfig) {
  return {
    format: (value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions) => {
      const formatter = new Intl.RelativeTimeFormat(config.locale, options);
      return formatter.format(value, unit);
    },
    formatShort: (value: number, unit: Intl.RelativeTimeFormatUnit) => {
      const formatter = new Intl.RelativeTimeFormat(config.locale, defaultFormattingPresets.relative.short);
      return formatter.format(value, unit);
    },
    formatLong: (value: number, unit: Intl.RelativeTimeFormatUnit) => {
      const formatter = new Intl.RelativeTimeFormat(config.locale, defaultFormattingPresets.relative.long);
      return formatter.format(value, unit);
    },
    formatFromNow: (date: Date) => {
      const now = new Date();
      const diff = date.getTime() - now.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      const formatter = new Intl.RelativeTimeFormat(config.locale, defaultFormattingPresets.relative.short);

      if (Math.abs(days) >= 1) return formatter.format(days, "day");
      if (Math.abs(hours) >= 1) return formatter.format(hours, "hour");
      if (Math.abs(minutes) >= 1) return formatter.format(minutes, "minute");
      return formatter.format(seconds, "second");
    },
  };
}
