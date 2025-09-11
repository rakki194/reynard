/**
 * Intl API Integration
 * Enhanced formatting capabilities inspired by solid-i18n
 */

import type { LanguageCode, TranslationParams } from "./types";

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
    currency: { style: 'currency', currency: 'USD' },
    percent: { style: 'percent' },
    compact: { notation: 'compact' }
  },
  date: {
    short: { dateStyle: 'short' },
    medium: { dateStyle: 'medium' },
    long: { dateStyle: 'long' },
    full: { dateStyle: 'full' },
    time: { timeStyle: 'short' },
    datetime: { dateStyle: 'short', timeStyle: 'short' }
  },
  relative: {
    short: { numeric: 'auto' },
    long: { numeric: 'auto', style: 'long' }
  }
};

// Enhanced number formatting
export class IntlNumberFormatter {
  private formatters = new Map<string, Intl.NumberFormat>();

  constructor(private config: IntlConfig) {}

  private getFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = JSON.stringify(options);
    if (!this.formatters.has(key)) {
      this.formatters.set(key, new Intl.NumberFormat(this.config.locale, options));
    }
    return this.formatters.get(key)!;
  }

  format(value: number, preset?: keyof FormattingPresets['number'], options?: Intl.NumberFormatOptions): string {
    const formatOptions = preset ? 
      { ...defaultFormattingPresets.number[preset], ...options } : 
      options;
    
    if (formatOptions) {
      return this.getFormatter(formatOptions).format(value);
    }
    
    return this.getFormatter({}).format(value);
  }

  formatInteger(value: number): string {
    return this.format(value, 'integer');
  }

  formatDecimal(value: number, decimals: number = 2): string {
    return this.format(value, 'decimal', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  }

  formatCurrency(value: number, currency?: string): string {
    return this.format(value, 'currency', { 
      currency: currency || this.config.currency || 'USD' 
    });
  }

  formatPercent(value: number): string {
    return this.format(value, 'percent');
  }

  formatCompact(value: number): string {
    return this.format(value, 'compact');
  }
}

// Enhanced date formatting
export class IntlDateFormatter {
  private formatters = new Map<string, Intl.DateTimeFormat>();

  constructor(private config: IntlConfig) {}

  private getFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = JSON.stringify(options);
    if (!this.formatters.has(key)) {
      this.formatters.set(key, new Intl.DateTimeFormat(this.config.locale, {
        timeZone: this.config.timeZone,
        ...options
      }));
    }
    return this.formatters.get(key)!;
  }

  format(date: Date, preset?: keyof FormattingPresets['date'], options?: Intl.DateTimeFormatOptions): string {
    const formatOptions = preset ? 
      { ...defaultFormattingPresets.date[preset], ...options } : 
      options;
    
    if (formatOptions) {
      return this.getFormatter(formatOptions).format(date);
    }
    
    return this.getFormatter({}).format(date);
  }

  formatShort(date: Date): string {
    return this.format(date, 'short');
  }

  formatMedium(date: Date): string {
    return this.format(date, 'medium');
  }

  formatLong(date: Date): string {
    return this.format(date, 'long');
  }

  formatFull(date: Date): string {
    return this.format(date, 'full');
  }

  formatTime(date: Date): string {
    return this.format(date, 'time');
  }

  formatDateTime(date: Date): string {
    return this.format(date, 'datetime');
  }
}

// Enhanced relative time formatting
export class IntlRelativeTimeFormatter {
  private formatters = new Map<string, Intl.RelativeTimeFormat>();

  constructor(private config: IntlConfig) {}

  private getFormatter(options: Intl.RelativeTimeFormatOptions): Intl.RelativeTimeFormat {
    const key = JSON.stringify(options);
    if (!this.formatters.has(key)) {
      this.formatters.set(key, new Intl.RelativeTimeFormat(this.config.locale, options));
    }
    return this.formatters.get(key)!;
  }

  format(value: number, unit: Intl.RelativeTimeFormatUnit, preset?: keyof FormattingPresets['relative']): string {
    const options = preset ? defaultFormattingPresets.relative[preset] : {};
    return this.getFormatter(options).format(value, unit);
  }

  formatShort(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    return this.format(value, unit, 'short');
  }

  formatLong(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    return this.format(value, unit, 'long');
  }

  // Smart relative time formatting
  formatSmart(date: Date, now: Date = new Date()): string {
    const diff = date.getTime() - now.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (Math.abs(years) >= 1) {
      return this.format(years, 'year');
    } else if (Math.abs(months) >= 1) {
      return this.format(months, 'month');
    } else if (Math.abs(weeks) >= 1) {
      return this.format(weeks, 'week');
    } else if (Math.abs(days) >= 1) {
      return this.format(days, 'day');
    } else if (Math.abs(hours) >= 1) {
      return this.format(hours, 'hour');
    } else if (Math.abs(minutes) >= 1) {
      return this.format(minutes, 'minute');
    } else {
      return this.format(seconds, 'second');
    }
  }
}

// Enhanced plural rules with Intl API
export class IntlPluralRules {
  private rules = new Map<string, Intl.PluralRules>();

  constructor(private config: IntlConfig) {}

  private getRule(): Intl.PluralRules {
    if (!this.rules.has(this.config.locale)) {
      this.rules.set(this.config.locale, new Intl.PluralRules(this.config.locale));
    }
    return this.rules.get(this.config.locale)!;
  }

  select(value: number): Intl.LDMLPluralRule {
    return this.getRule().select(value);
  }

  // Note: selectRange is not available in all environments
  // selectRange(start: number, end: number): Intl.LDMLPluralRule {
  //   return this.getRule().selectRange(start, end);
  // }

  resolvedOptions(): Intl.ResolvedPluralRulesOptions {
    return this.getRule().resolvedOptions();
  }
}

// Main Intl formatter class
export class IntlFormatter {
  public number: IntlNumberFormatter;
  public date: IntlDateFormatter;
  public relativeTime: IntlRelativeTimeFormatter;
  public pluralRules: IntlPluralRules;

  constructor(config: IntlConfig) {
    this.number = new IntlNumberFormatter(config);
    this.date = new IntlDateFormatter(config);
    this.relativeTime = new IntlRelativeTimeFormatter(config);
    this.pluralRules = new IntlPluralRules(config);
  }

  // Update configuration
  updateConfig(newConfig: Partial<IntlConfig>): void {
    const config = { ...this.number['config'], ...newConfig };
    this.number = new IntlNumberFormatter(config);
    this.date = new IntlDateFormatter(config);
    this.relativeTime = new IntlRelativeTimeFormatter(config);
    this.pluralRules = new IntlPluralRules(config);
  }

  // Enhanced translation with Intl formatting
  formatTranslation(
    translation: string, 
    params: TranslationParams = {}
  ): string {
    let result = translation;

    // Replace number placeholders
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'number') {
        const placeholder = `{${key}}`;
        if (result.includes(placeholder)) {
          result = result.replace(placeholder, this.number.format(value));
        }
      }
    }

    // Replace date placeholders
    for (const [key, value] of Object.entries(params)) {
      if (value && typeof value === 'object' && (value as any).constructor === Date) {
        const placeholder = `{${key}}`;
        if (result.includes(placeholder)) {
          result = result.replace(placeholder, this.date.format(value as Date));
        }
      }
    }

    // Replace relative time placeholders
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'object' && value !== null && 'date' in value && 'unit' in value) {
        const placeholder = `{${key}}`;
        if (result.includes(placeholder)) {
          const relativeValue = value as { date: Date; unit: Intl.RelativeTimeFormatUnit };
          const timeDiff = relativeValue.date.getTime() - new Date().getTime();
          result = result.replace(placeholder, this.relativeTime.format(
            timeDiff,
            relativeValue.unit
          ));
        }
      }
    }

    return result;
  }
}

// Create formatter instance
export const createIntlFormatter = (config: IntlConfig): IntlFormatter => {
  return new IntlFormatter(config);
};

// Utility functions for backward compatibility
export const formatNumber = (
  value: number, 
  locale: LanguageCode, 
  options?: Intl.NumberFormatOptions
): string => {
  const formatter = new IntlNumberFormatter({ locale });
  return formatter.format(value, undefined, options);
};

export const formatDate = (
  date: Date, 
  locale: LanguageCode, 
  options?: Intl.DateTimeFormatOptions
): string => {
  const formatter = new IntlDateFormatter({ locale });
  return formatter.format(date, undefined, options);
};

export const formatCurrency = (
  value: number, 
  locale: LanguageCode, 
  currency: string = 'USD'
): string => {
  const formatter = new IntlNumberFormatter({ locale });
  return formatter.formatCurrency(value, currency);
};

export const formatRelativeTime = (
  value: number, 
  unit: Intl.RelativeTimeFormatUnit, 
  locale: LanguageCode
): string => {
  const formatter = new IntlRelativeTimeFormatter({ locale });
  return formatter.format(value, unit);
};
