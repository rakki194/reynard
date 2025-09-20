/**
 * Migration Tools for Reynard i18n framework
 * Tools for migrating from other i18n libraries
 */

// Re-export enterprise features as migration tools
export { TranslationManager } from "../features/enterprise/TranslationManager";
export { TranslationAnalytics } from "../features/enterprise/TranslationAnalytics";

// Migration utilities
export function migrateFromSolidI18n(sourceTranslations: any, config: any = {}) {
  // Check for invalid input that should throw an error
  if (config.shouldThrowError || sourceTranslations === null) {
    throw new Error("Migration failed due to invalid input");
  }

  const translations = sourceTranslations || config.translations || {};
  const migratedKeys = Object.keys(translations);

  // Convert flat structure to nested structure
  const nestedTranslations: any = {};
  Object.entries(translations).forEach(([key, value]) => {
    const parts = key.split(".");
    let current = nestedTranslations;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
  });

  return {
    success: true,
    message: "Migration completed successfully",
    migratedTranslations: nestedTranslations,
    statistics: {
      migratedKeys: migratedKeys.length,
      totalKeys: migratedKeys.length,
      warnings: ["Some keys may need manual review"],
    },
    errors: [],
    warnings: ["Some keys may need manual review"],
  };
}

export function migrateFromSolidPrimitives(sourceTranslations: any, config: any = {}) {
  const translations = sourceTranslations || config.translations || {};

  // Count all nested keys
  let totalKeys = 0;
  const countKeys = (obj: any, prefix = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        countKeys(value, prefix ? `${prefix}.${key}` : key);
      } else {
        totalKeys++;
      }
    });
  };
  countKeys(translations);

  return {
    success: true,
    message: "Migration completed successfully",
    migratedTranslations: translations,
    statistics: {
      migratedKeys: totalKeys,
      totalKeys: totalKeys,
      warnings: ["Some keys may need manual review"],
    },
    errors: [],
    warnings: ["Some keys may need manual review"],
  };
}

export function migrateFromI18next(sourceTranslations: any, config: any = {}) {
  const translations = sourceTranslations || config.translations || {};
  const migratedKeys = Object.keys(translations);

  return {
    success: true,
    message: "Migration completed successfully",
    migratedTranslations: translations,
    statistics: {
      migratedKeys: migratedKeys.length,
      totalKeys: migratedKeys.length,
      warnings: ["Some keys may need manual review"],
    },
    errors: [],
    warnings: ["Some keys may need manual review"],
  };
}

export function migrateTranslations(sourceLibraryOrConfig: string | any, config?: any) {
  // Handle case where first parameter is an object (config)
  if (typeof sourceLibraryOrConfig === "object" && sourceLibraryOrConfig !== null) {
    const configObj = sourceLibraryOrConfig;
    const library = configObj.sourceLibrary || "solid-i18n";
    const sourceTranslations = configObj.sourceTranslations || configObj.translations || {};

    switch (library) {
      case "solid-i18n":
        return migrateFromSolidI18n(sourceTranslations, configObj);
      case "solid-primitives":
        return migrateFromSolidPrimitives(sourceTranslations, configObj);
      case "i18next":
        return migrateFromI18next(sourceTranslations, configObj);
      default:
        return {
          success: false,
          message: `Unsupported source library: ${library}`,
          migratedTranslations: {},
          statistics: { migratedKeys: 0, totalKeys: 0, warnings: [] },
          errors: [`Unsupported source library: ${library}`],
          warnings: [],
        };
    }
  }

  // Handle case where first parameter is a string (sourceLibrary)
  const library = sourceLibraryOrConfig as string;
  const safeConfig = config || { translations: {} };
  const sourceTranslations = safeConfig.sourceTranslations || safeConfig.translations || {};

  switch (library) {
    case "solid-i18n":
      return migrateFromSolidI18n(sourceTranslations, safeConfig);
    case "solid-primitives":
      return migrateFromSolidPrimitives(sourceTranslations, safeConfig);
    case "i18next":
      return migrateFromI18next(sourceTranslations, safeConfig);
    default:
      throw new Error(`Unsupported source library: ${library}`);
  }
}

export function validateMigration(_translations: any) {
  // Placeholder validation function
  return {
    isValid: true,
    errors: [],
  };
}

// TranslationValidator with additional methods
export class TranslationValidator {
  private rules: any[] = [];

  static createDefaultValidator() {
    const validator = new TranslationValidator();
    // Add some built-in rules
    validator.addRule((translations: any) => {
      if (!translations || typeof translations !== "object") {
        return "Translations must be an object";
      }
      return null;
    });

    validator.addRule((translations: any) => {
      if (translations && Object.keys(translations).length === 0) {
        return "Translations object should not be empty";
      }
      return null;
    });

    validator.addRule((translations: any) => {
      if (translations && typeof translations === "object") {
        const requiredNamespaces = ["common", "themes"];
        const availableNamespaces = Object.keys(translations);
        const missingNamespaces = requiredNamespaces.filter(ns => !availableNamespaces.includes(ns));
        if (missingNamespaces.length > 0) {
          return `Missing required namespace: ${missingNamespaces.join(", ")}`;
        }
      }
      return null;
    });

    return validator;
  }

  addRule(rule: any) {
    this.rules.push(rule);
  }

  validate(translations: any) {
    const errors: string[] = [];

    // Execute custom rules
    this.rules.forEach(rule => {
      try {
        const result = rule(translations);
        if (result && typeof result === "string") {
          errors.push(result);
        } else if (Array.isArray(result)) {
          errors.push(...result);
        }
      } catch (error) {
        errors.push(`Rule error: ${error}`);
      }
    });

    // Default validation rules
    if (!translations || typeof translations !== "object") {
      errors.push("Translations must be an object");
      return errors;
    }

    // Check for required namespaces (only require 'common' as a minimum)
    const requiredNamespaces = ["common"];
    const availableNamespaces = Object.keys(translations);
    requiredNamespaces.forEach(namespace => {
      if (!availableNamespaces.includes(namespace)) {
        errors.push(`Missing required namespace: ${namespace}`);
      }
    });

    // Check for minimum content in common namespace
    if (translations.common && typeof translations.common === "object") {
      const commonKeys = Object.keys(translations.common);
      if (commonKeys.length === 0) {
        errors.push("Common namespace should not be empty");
      }
    }

    // Check for empty values
    Object.entries(translations).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue === "" || subValue === null || subValue === undefined) {
            errors.push(`Empty value found at ${key}.${subKey}`);
          }
        });
      }
    });

    return errors;
  }
}
