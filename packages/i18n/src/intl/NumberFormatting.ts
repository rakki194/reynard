/**
 * Number Formatting
 *
 * Number and currency formatting utilities using Intl API.
 */

import type { IntlConfig } from "./IntlConfig";
import { defaultFormattingPresets } from "./IntlConfig";

export function createNumberFormatter(config: IntlConfig) {
  return {
    format: (value: number, options?: Intl.NumberFormatOptions) => {
      const formatter = new Intl.NumberFormat(config.locale, options);
      return formatter.format(value);
    },
    formatInteger: (value: number) => {
      const formatter = new Intl.NumberFormat(config.locale, defaultFormattingPresets.number.integer);
      return formatter.format(value);
    },
    formatDecimal: (value: number) => {
      const formatter = new Intl.NumberFormat(config.locale, defaultFormattingPresets.number.decimal);
      return formatter.format(value);
    },
    formatCurrency: (value: number, currency?: string) => {
      const options = { ...defaultFormattingPresets.number.currency };
      if (currency) options.currency = currency;
      const formatter = new Intl.NumberFormat(config.locale, options);
      return formatter.format(value);
    },
    formatPercent: (value: number) => {
      const formatter = new Intl.NumberFormat(config.locale, defaultFormattingPresets.number.percent);
      return formatter.format(value);
    },
    formatCompact: (value: number) => {
      const formatter = new Intl.NumberFormat(config.locale, defaultFormattingPresets.number.compact);
      return formatter.format(value);
    },
  };
}
