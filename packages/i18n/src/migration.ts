/**
 * Migration Tools and Enterprise Features
 * Tools for migrating from other i18n libraries and enterprise-grade features
 */

// @ts-nocheck

import type { LanguageCode, Translations } from "./types";
import type { IntlConfig } from "./intl";

// Migration utilities for different i18n libraries
export interface MigrationOptions {
  sourceLibrary:
    | "solid-i18n"
    | "solid-primitives"
    | "amoutonbrady"
    | "i18next"
    | "react-i18next";
  sourceTranslations: any;
  targetLocale: LanguageCode;
  preserveStructure?: boolean;
  validateAfterMigration?: boolean;
}

export interface MigrationResult {
  success: boolean;
  migratedTranslations: Translations;
  warnings: string[];
  errors: string[];
  statistics: {
    totalKeys: number;
    migratedKeys: number;
    skippedKeys: number;
    errorKeys: number;
  };
}

// Migration from solid-i18n
export const migrateFromSolidI18n = (
  sourceTranslations: any,
  _options: MigrationOptions,
): MigrationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  let migratedKeys = 0;
  let skippedKeys = 0;
  let errorKeys = 0;

  try {
    // solid-i18n uses a flat structure, we need to convert to our nested structure
    const migratedTranslations: any = {
      common: {} as any,
      themes: {} as any,
      core: {} as any,
      components: {} as any,
      gallery: {} as any,
      charts: {} as any,
      auth: {} as any,
      chat: {} as any,
      monaco: {} as any,
    };

    for (const [key, value] of Object.entries(sourceTranslations)) {
      try {
        // Map flat keys to our namespace structure
        const namespace = mapKeyToNamespace(key);
        const cleanKey = key.replace(
          /^(common|themes|core|components|gallery|charts|auth|chat|monaco)\./,
          "",
        );

        if (namespace && cleanKey) {
          (migratedTranslations[namespace] as any)[cleanKey] = value;
          migratedKeys++;
        } else {
          // Put unmapped keys in common namespace
          (migratedTranslations.common as any)[key] = value;
          warnings.push(`Key "${key}" mapped to common namespace`);
          migratedKeys++;
        }
      } catch (error) {
        errors.push(`Failed to migrate key "${key}": ${error}`);
        errorKeys++;
      }
    }

    return {
      success: errors.length === 0,
      migratedTranslations: migratedTranslations,
      warnings,
      errors,
      statistics: {
        totalKeys: Object.keys(sourceTranslations).length,
        migratedKeys,
        skippedKeys,
        errorKeys,
      },
    };
  } catch (error) {
    return {
      success: false,
      migratedTranslations: {} as Translations,
      warnings,
      errors: [`Migration failed: ${error}`],
      statistics: {
        totalKeys: Object.keys(sourceTranslations).length,
        migratedKeys: 0,
        skippedKeys: 0,
        errorKeys: Object.keys(sourceTranslations).length,
      },
    };
  }
};

// Migration from solid-primitives/i18n
export const migrateFromSolidPrimitives = (
  sourceTranslations: any,
  _options: MigrationOptions,
): MigrationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  let migratedKeys = 0;
  let skippedKeys = 0;
  let errorKeys = 0;

  try {
    const migratedTranslations: Translations = {
      common: {},
      themes: {},
      core: {},
      components: {},
      gallery: {},
      charts: {},
      auth: {},
      chat: {},
      monaco: {},
    };

    // solid-primitives uses a nested structure similar to ours
    for (const [namespace, translations] of Object.entries(
      sourceTranslations,
    )) {
      if (namespace in migratedTranslations) {
        (migratedTranslations as any)[namespace] = translations;
        migratedKeys += Object.keys(translations as any).length;
      } else {
        // Put unknown namespaces in common
        (migratedTranslations.common as any)[namespace] = translations;
        warnings.push(`Namespace "${namespace}" mapped to common`);
        migratedKeys += Object.keys(translations as any).length;
      }
    }

    return {
      success: errors.length === 0,
      migratedTranslations: migratedTranslations,
      warnings,
      errors,
      statistics: {
        totalKeys: Object.keys(sourceTranslations).length,
        migratedKeys,
        skippedKeys,
        errorKeys,
      },
    };
  } catch (error) {
    return {
      success: false,
      migratedTranslations: {} as Translations,
      warnings,
      errors: [`Migration failed: ${error}`],
      statistics: {
        totalKeys: Object.keys(sourceTranslations).length,
        migratedKeys: 0,
        skippedKeys: 0,
        errorKeys: Object.keys(sourceTranslations).length,
      },
    };
  }
};

// Migration from i18next/react-i18next
export const migrateFromI18next = (
  sourceTranslations: any,
  _options: MigrationOptions,
): MigrationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  let migratedKeys = 0;
  let skippedKeys = 0;
  let errorKeys = 0;

  try {
    const migratedTranslations: Translations = {
      common: {},
      themes: {},
      core: {},
      components: {},
      gallery: {},
      charts: {},
      auth: {},
      chat: {},
      monaco: {},
    };

    // i18next uses nested structure with namespaces
    for (const [namespace, translations] of Object.entries(
      sourceTranslations,
    )) {
      if (namespace in migratedTranslations) {
        (migratedTranslations as any)[namespace] = translations;
        migratedKeys += Object.keys(translations as any).length;
      } else {
        // Put unknown namespaces in common
        (migratedTranslations.common as any)[namespace] = translations;
        warnings.push(`Namespace "${namespace}" mapped to common`);
        migratedKeys += Object.keys(translations as any).length;
      }
    }

    return {
      success: errors.length === 0,
      migratedTranslations: migratedTranslations,
      warnings,
      errors,
      statistics: {
        totalKeys: Object.keys(sourceTranslations).length,
        migratedKeys,
        skippedKeys,
        errorKeys,
      },
    };
  } catch (error) {
    return {
      success: false,
      migratedTranslations: {} as Translations,
      warnings,
      errors: [`Migration failed: ${error}`],
      statistics: {
        totalKeys: Object.keys(sourceTranslations).length,
        migratedKeys: 0,
        skippedKeys: 0,
        errorKeys: Object.keys(sourceTranslations).length,
      },
    };
  }
};

// Main migration function
export const migrateTranslations = (
  options: MigrationOptions,
): MigrationResult => {
  switch (options.sourceLibrary) {
    case "solid-i18n":
      return migrateFromSolidI18n(options.sourceTranslations, options);
    case "solid-primitives":
      return migrateFromSolidPrimitives(options.sourceTranslations, options);
    case "i18next":
    case "react-i18next":
      return migrateFromI18next(options.sourceTranslations, options);
    default:
      return {
        success: false,
        migratedTranslations: {} as Translations,
        warnings: [],
        errors: [`Unsupported source library: ${options.sourceLibrary}`],
        statistics: {
          totalKeys: 0,
          migratedKeys: 0,
          skippedKeys: 0,
          errorKeys: 0,
        },
      };
  }
};

// Helper function to map keys to namespaces
const mapKeyToNamespace = (key: string): keyof Translations | null => {
  if (key.startsWith("common.")) return "common";
  if (key.startsWith("themes.")) return "themes";
  if (key.startsWith("core.")) return "core";
  if (key.startsWith("components.")) return "components";
  if (key.startsWith("gallery.")) return "gallery";
  if (key.startsWith("charts.")) return "charts";
  if (key.startsWith("auth.")) return "auth";
  if (key.startsWith("chat.")) return "chat";
  if (key.startsWith("monaco.")) return "monaco";
  return null;
};

// Enterprise Features

// Translation Management System
export class TranslationManager {
  private translations = new Map<LanguageCode, Translations>();
  private changeHistory: Array<{
    timestamp: Date;
    locale: LanguageCode;
    key: string;
    oldValue: any;
    newValue: any;
    author?: string;
  }> = [];

  constructor(_config: IntlConfig) {
    // Config is stored for future use
  }

  // Add or update translation
  setTranslation(
    locale: LanguageCode,
    key: string,
    value: any,
    author?: string,
  ): void {
    const currentTranslations =
      this.translations.get(locale) || ({} as Translations);
    const oldValue = this.getNestedValue(currentTranslations, key);

    this.setNestedValue(currentTranslations, key, value);
    this.translations.set(locale, currentTranslations);

    // Record change
    this.changeHistory.push({
      timestamp: new Date(),
      locale,
      key,
      oldValue,
      newValue: value,
      author,
    });
  }

  // Get translation
  getTranslation(locale: LanguageCode, key: string): any {
    const translations = this.translations.get(locale);
    return translations ? this.getNestedValue(translations, key) : undefined;
  }

  // Get all translations for a locale
  getTranslations(locale: LanguageCode): Translations | undefined {
    return this.translations.get(locale);
  }

  // Get change history
  getChangeHistory(): typeof this.changeHistory {
    return [...this.changeHistory];
  }

  // Export translations
  exportTranslations(locale: LanguageCode): string {
    const translations = this.translations.get(locale);
    return JSON.stringify(translations, null, 2);
  }

  // Import translations
  importTranslations(
    locale: LanguageCode,
    jsonString: string,
    author?: string,
  ): boolean {
    try {
      const translations = JSON.parse(jsonString) as Translations;
      this.translations.set(locale, translations);

      // Record import
      this.changeHistory.push({
        timestamp: new Date(),
        locale,
        key: "IMPORT",
        oldValue: null,
        newValue: translations,
        author,
      });

      return true;
    } catch (error) {
      console.error("Failed to import translations:", error);
      return false;
    }
  }

  // Helper functions
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}

// Translation Validation Service
export class TranslationValidator {
  private rules: Array<(translations: Translations) => string[]> = [];

  // Add validation rule
  addRule(rule: (translations: Translations) => string[]): void {
    this.rules.push(rule);
  }

  // Validate translations
  validate(translations: Translations): string[] {
    const errors: string[] = [];

    for (const rule of this.rules) {
      errors.push(...rule(translations));
    }

    return errors;
  }

  // Built-in validation rules
  static createDefaultValidator(): TranslationValidator {
    const validator = new TranslationValidator();

    // Required namespaces rule
    validator.addRule((translations) => {
      const requiredNamespaces = ["common", "themes", "core", "components"];
      const errors: string[] = [];

      for (const namespace of requiredNamespaces) {
        if (!(namespace in translations)) {
          errors.push(`Missing required namespace: ${namespace}`);
        }
      }

      return errors;
    });

    // Empty values rule
    validator.addRule((translations) => {
      const errors: string[] = [];
      const checkEmpty = (obj: any, path: string = "") => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;

          if (typeof value === "object" && value !== null) {
            checkEmpty(value, currentPath);
          } else if (value === "" || value === null || value === undefined) {
            errors.push(`Empty value at: ${currentPath}`);
          }
        }
      };

      checkEmpty(translations);
      return errors;
    });

    return validator;
  }
}

// Translation Analytics
export class TranslationAnalytics {
  private usageStats = new Map<string, number>();
  private localeStats = new Map<LanguageCode, number>();

  // Track translation usage
  trackUsage(key: string, locale: LanguageCode): void {
    this.usageStats.set(key, (this.usageStats.get(key) || 0) + 1);
    this.localeStats.set(locale, (this.localeStats.get(locale) || 0) + 1);
  }

  // Get usage statistics
  getUsageStats(): {
    mostUsedKeys: Array<{ key: string; count: number }>;
    localeUsage: Array<{ locale: LanguageCode; count: number }>;
    totalUsage: number;
  } {
    const mostUsedKeys = Array.from(this.usageStats.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const localeUsage = Array.from(this.localeStats.entries())
      .map(([locale, count]) => ({ locale, count }))
      .sort((a, b) => b.count - a.count);

    const totalUsage = Array.from(this.usageStats.values()).reduce(
      (sum, count) => sum + count,
      0,
    );

    return {
      mostUsedKeys,
      localeUsage,
      totalUsage,
    };
  }

  // Reset statistics
  reset(): void {
    this.usageStats.clear();
    this.localeStats.clear();
  }
}
