/**
 * IntlRelativeTimeFormatter class for relative time formatting
 */

import type { IntlConfig } from "../../intl/IntlConfig";

export class IntlRelativeTimeFormatter {
  constructor(private config: IntlConfig) {}

  format(value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions): string {
    const formatter = new Intl.RelativeTimeFormat(this.config.locale, options);
    return formatter.format(value, unit);
  }

  formatShort(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    const formatter = new Intl.RelativeTimeFormat(this.config.locale, {
      numeric: "auto",
    });
    return formatter.format(value, unit);
  }

  formatLong(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    const formatter = new Intl.RelativeTimeFormat(this.config.locale, {
      numeric: "auto",
      style: "long",
    });
    return formatter.format(value, unit);
  }

  formatFromNow(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const formatter = new Intl.RelativeTimeFormat(this.config.locale, {
      numeric: "auto",
    });

    if (Math.abs(days) >= 1) return formatter.format(days, "day");
    if (Math.abs(hours) >= 1) return formatter.format(hours, "hour");
    if (Math.abs(minutes) >= 1) return formatter.format(minutes, "minute");
    return formatter.format(seconds, "second");
  }

  formatSmart(date: Date): string {
    return this.formatFromNow(date);
  }
}
