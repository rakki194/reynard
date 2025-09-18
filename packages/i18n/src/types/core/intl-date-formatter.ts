/**
 * IntlDateFormatter class for date formatting
 */

import type { IntlConfig } from "../../intl/IntlConfig";

export class IntlDateFormatter {
  constructor(private config: IntlConfig) {}

  format(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const formatter = new Intl.DateTimeFormat(this.config.locale, {
      timeZone: this.config.timeZone,
      ...options,
    });
    return formatter.format(date);
  }

  formatShort(date: Date): string {
    const formatter = new Intl.DateTimeFormat(this.config.locale, {
      dateStyle: "short",
      timeZone: this.config.timeZone,
    });
    return formatter.format(date);
  }

  formatMedium(date: Date): string {
    const formatter = new Intl.DateTimeFormat(this.config.locale, {
      dateStyle: "medium",
      timeZone: this.config.timeZone,
    });
    return formatter.format(date);
  }

  formatLong(date: Date): string {
    const formatter = new Intl.DateTimeFormat(this.config.locale, {
      dateStyle: "long",
      timeZone: this.config.timeZone,
    });
    return formatter.format(date);
  }

  formatFull(date: Date): string {
    const formatter = new Intl.DateTimeFormat(this.config.locale, {
      dateStyle: "full",
      timeZone: this.config.timeZone,
    });
    return formatter.format(date);
  }

  formatTime(date: Date): string {
    const formatter = new Intl.DateTimeFormat(this.config.locale, {
      timeStyle: "short",
      timeZone: this.config.timeZone,
    });
    return formatter.format(date);
  }

  formatDateTime(date: Date): string {
    const formatter = new Intl.DateTimeFormat(this.config.locale, {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: this.config.timeZone,
    });
    return formatter.format(date);
  }
}
