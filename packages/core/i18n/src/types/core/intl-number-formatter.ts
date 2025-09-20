/**
 * IntlNumberFormatter class for number formatting
 */

import type { IntlConfig } from "../../intl/IntlConfig";

export class IntlNumberFormatter {
  constructor(private config: IntlConfig) {}

  format(value: number, options?: Intl.NumberFormatOptions): string {
    const formatter = new Intl.NumberFormat(this.config.locale, options);
    return formatter.format(value);
  }

  formatInteger(value: number): string {
    const formatter = new Intl.NumberFormat(this.config.locale, {
      maximumFractionDigits: 0,
    });
    return formatter.format(value);
  }

  formatDecimal(value: number, precision?: number): string {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
    if (precision !== undefined) {
      options.minimumFractionDigits = precision;
      options.maximumFractionDigits = precision;
    }
    const formatter = new Intl.NumberFormat(this.config.locale, options);
    return formatter.format(value);
  }

  formatCurrency(value: number, currency?: string): string {
    const options: Intl.NumberFormatOptions = {
      style: "currency",
      currency: currency || this.config.currency || "USD",
    };
    const formatter = new Intl.NumberFormat(this.config.locale, options);
    return formatter.format(value);
  }

  formatPercent(value: number): string {
    const formatter = new Intl.NumberFormat(this.config.locale, {
      style: "percent",
    });
    return formatter.format(value);
  }

  formatCompact(value: number): string {
    const formatter = new Intl.NumberFormat(this.config.locale, {
      notation: "compact",
    });
    return formatter.format(value);
  }
}
