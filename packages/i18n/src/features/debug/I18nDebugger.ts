/**
 * I18n Debugger for Reynard framework
 * Comprehensive debugging and validation tools for internationalization
 */

import type { Translations } from "../../types";
import { validateTranslations, type ValidationResult } from "./Validation";
import { createDebugStats, type DebugStats } from "./DebugStats";

export interface I18nDebuggerOptions {
  enableLogging?: boolean;
  trackUsedKeys?: boolean;
  trackMissingKeys?: boolean;
  enableValidation?: boolean;
}

export class I18nDebugger {
  private usedKeys: Set<string> = new Set();
  private missingKeys: Set<string> = new Set();
  private translations: Translations = {} as Translations;
  private options: Required<I18nDebuggerOptions>;

  constructor(options: I18nDebuggerOptions = {}) {
    this.options = {
      enableLogging: true,
      trackUsedKeys: true,
      trackMissingKeys: true,
      enableValidation: true,
      ...options,
    };
  }

  /**
   * Track a used translation key
   */
  trackUsedKey(key: string): void {
    if (this.options.trackUsedKeys) {
      this.usedKeys.add(key);
    }
  }

  /**
   * Track a missing translation key
   */
  trackMissingKey(key: string): void {
    if (this.options.trackMissingKeys) {
      this.missingKeys.add(key);
    }
  }

  /**
   * Set translations for validation
   */
  setTranslations(translations: Translations): void {
    this.translations = translations;
  }

  /**
   * Get all used keys
   */
  getUsedKeys(): Set<string> {
    return new Set(this.usedKeys);
  }

  /**
   * Get all missing keys
   */
  getMissingKeys(): Set<string> {
    return new Set(this.missingKeys);
  }

  /**
   * Get unused keys
   */
  getUnusedKeys(availableKeys: Record<string, unknown>): string[] {
    const availableKeySet = new Set(Object.keys(availableKeys));
    return Array.from(this.usedKeys).filter(key => !availableKeySet.has(key));
  }

  /**
   * Validate translations
   */
  validate(translations: Record<string, unknown>, requiredKeys: string[] = []): ValidationResult {
    return validateTranslations(translations, requiredKeys);
  }

  /**
   * Get debug statistics
   */
  getStats(): DebugStats {
    return createDebugStats();
  }

  /**
   * Print debug report
   */
  printReport(): void {
    if (!this.options.enableLogging) {
      return;
    }

    console.group("[I18n Debug Report]");

    console.log("Used Keys:", this.usedKeys.size);
    if (this.usedKeys.size > 0) {
      console.table(Array.from(this.usedKeys).map(key => ({ key })));
    }

    console.log("Missing Keys:", this.missingKeys.size);
    if (this.missingKeys.size > 0) {
      console.table(Array.from(this.missingKeys).map(key => ({ key })));
    }

    console.log("Total Translations:", Object.keys(this.translations).length);

    console.groupEnd();
  }

  /**
   * Clear all tracked data
   */
  clear(): void {
    this.usedKeys.clear();
    this.missingKeys.clear();
    this.translations = {} as Translations;
  }

  /**
   * Update debugger options
   */
  updateOptions(newOptions: Partial<I18nDebuggerOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Check if logging is enabled
   */
  isLoggingEnabled(): boolean {
    return this.options.enableLogging;
  }

  /**
   * Enable or disable logging
   */
  setLoggingEnabled(enabled: boolean): void {
    this.options.enableLogging = enabled;
  }
}
