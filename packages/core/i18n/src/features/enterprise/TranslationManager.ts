/**
 * Translation Manager for Reynard framework
 * Enterprise-grade translation management with history tracking and import/export
 */

import type { LanguageCode, Translations } from "../../types";

export interface TranslationChange {
  id: string;
  timestamp: Date;
  locale: LanguageCode;
  key: string;
  oldValue?: string;
  newValue: string;
  action: "set" | "update" | "delete";
}

export interface TranslationManagerOptions {
  locale: LanguageCode;
  enableHistory?: boolean;
  maxHistorySize?: number;
}

export class TranslationManager {
  private translations: Map<LanguageCode, Translations> = new Map();
  private changeHistory: TranslationChange[] = [];
  private options: Required<TranslationManagerOptions>;

  constructor(options: TranslationManagerOptions) {
    this.options = {
      enableHistory: true,
      maxHistorySize: 1000,
      ...options,
    };
  }

  /**
   * Set a translation for a specific locale and key
   */
  setTranslation(localeOrKey: LanguageCode | string, keyOrValue: string, valueOrLocale?: string | LanguageCode): void {
    // Handle both signatures: setTranslation(key, value, locale) and setTranslation(locale, key, value)
    let locale: LanguageCode;
    let key: string;
    let value: string;

    if (valueOrLocale === undefined) {
      // Called as setTranslation(key, value) - use default locale
      key = localeOrKey as string;
      value = keyOrValue;
      locale = this.options.locale;
    } else if (typeof localeOrKey === "string" && typeof keyOrValue === "string" && typeof valueOrLocale === "string") {
      // Called as setTranslation(locale, key, value)
      locale = localeOrKey as LanguageCode;
      key = keyOrValue;
      value = valueOrLocale;
    } else {
      // Called as setTranslation(key, value, locale)
      key = localeOrKey as string;
      value = keyOrValue;
      locale = valueOrLocale as LanguageCode;
    }

    const oldValue = this.getTranslation(locale, key);

    if (!this.translations.has(locale)) {
      this.translations.set(locale, {} as Translations);
    }

    const localeTranslations = this.translations.get(locale)!;
    this.setNestedValue(localeTranslations, key, value);

    if (this.options.enableHistory) {
      this.recordChange({
        id: this.generateChangeId(),
        timestamp: new Date(),
        locale,
        key,
        oldValue,
        newValue: value,
        action: oldValue ? "update" : "set",
      });
    }
  }

  /**
   * Get a translation for a specific locale and key
   */
  getTranslation(localeOrKey: LanguageCode | string, keyOrLocale?: string | LanguageCode): string | undefined {
    // Handle both signatures: getTranslation(key, locale) and getTranslation(locale, key)
    let locale: LanguageCode;
    let key: string;

    if (keyOrLocale === undefined) {
      // Called as getTranslation(key) - use default locale
      key = localeOrKey as string;
      locale = this.options.locale;
    } else if (typeof localeOrKey === "string" && typeof keyOrLocale === "string") {
      // Called as getTranslation(locale, key)
      locale = localeOrKey as LanguageCode;
      key = keyOrLocale;
    } else {
      // Called as getTranslation(key, locale)
      key = localeOrKey as string;
      locale = keyOrLocale as LanguageCode;
    }

    const localeTranslations = this.translations.get(locale);
    if (!localeTranslations) {
      return undefined;
    }

    return this.getNestedValue(localeTranslations, key);
  }

  /**
   * Get all translations for a specific locale
   */
  getTranslations(locale: LanguageCode = this.options.locale): Translations {
    return this.translations.get(locale) || ({} as Translations);
  }

  /**
   * Get change history
   */
  getChangeHistory(): TranslationChange[] {
    return [...this.changeHistory];
  }

  /**
   * Export translations for a specific locale
   */
  exportTranslations(locale: LanguageCode = this.options.locale): string {
    const translations = this.getTranslations(locale);
    return JSON.stringify(translations, null, 2);
  }

  /**
   * Import translations from JSON string or object
   */
  importTranslations(
    localeOrJsonString: LanguageCode | string | Record<string, any>,
    jsonStringOrAuthor?: string,
    authorOrMerge?: string | boolean,
    merge: boolean = true
  ): boolean {
    try {
      // Handle different calling patterns
      let locale: LanguageCode;
      let jsonString: string;
      let shouldMerge: boolean;

      if (typeof localeOrJsonString === "string" && jsonStringOrAuthor && authorOrMerge) {
        // Called as importTranslations(locale, jsonString, author)
        locale = localeOrJsonString as LanguageCode;
        jsonString = jsonStringOrAuthor;
        shouldMerge = merge;
      } else if (typeof localeOrJsonString === "string" && jsonStringOrAuthor) {
        // Called as importTranslations(jsonString, locale) or importTranslations(locale, jsonString)
        if (typeof jsonStringOrAuthor === "string" && jsonStringOrAuthor.length > 2) {
          // Likely a JSON string
          locale = this.options.locale;
          jsonString = localeOrJsonString;
          shouldMerge = (authorOrMerge as boolean) ?? true;
        } else {
          // Likely a locale
          locale = localeOrJsonString as LanguageCode;
          jsonString = jsonStringOrAuthor;
          shouldMerge = (authorOrMerge as boolean) ?? true;
        }
      } else {
        // Called as importTranslations(jsonStringOrObject, locale, merge)
        locale = this.options.locale;
        jsonString = localeOrJsonString as string;
        shouldMerge = Boolean(jsonStringOrAuthor) ?? true;
      }

      const importedTranslations =
        typeof jsonString === "string" ? (JSON.parse(jsonString) as Translations) : (jsonString as Translations);

      if (shouldMerge) {
        const existingTranslations = this.getTranslations(locale);
        const mergedTranslations = this.deepMerge(existingTranslations, importedTranslations);
        this.translations.set(locale, mergedTranslations);
      } else {
        this.translations.set(locale, importedTranslations);
      }

      if (this.options.enableHistory) {
        this.recordChange({
          id: this.generateChangeId(),
          timestamp: new Date(),
          locale,
          key: "IMPORT",
          newValue: `Imported ${Object.keys(importedTranslations).length} translations`,
          action: "set",
        });
      }

      return true;
    } catch (error) {
      console.error("Failed to import translations:", error);
      return false;
    }
  }

  /**
   * Clear all translations for a locale
   */
  clearTranslations(locale?: LanguageCode): void {
    if (locale) {
      this.translations.delete(locale);
    } else {
      this.translations.clear();
    }
  }

  /**
   * Get all available locales
   */
  getAvailableLocales(): LanguageCode[] {
    return Array.from(this.translations.keys());
  }

  /**
   * Check if a translation exists
   */
  hasTranslation(key: string, locale: LanguageCode = this.options.locale): boolean {
    return this.getTranslation(key, locale) !== undefined;
  }

  private setNestedValue(obj: any, path: string, value: string): void {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  private getNestedValue(obj: any, path: string): string | undefined {
    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return typeof current === "string" ? current : undefined;
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  private recordChange(change: TranslationChange): void {
    this.changeHistory.push(change);

    // Keep history size within limits
    if (this.changeHistory.length > this.options.maxHistorySize) {
      this.changeHistory = this.changeHistory.slice(-this.options.maxHistorySize);
    }
  }

  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
