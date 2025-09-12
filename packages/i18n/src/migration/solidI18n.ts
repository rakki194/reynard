/**
 * Solid I18n Migration
 *
 * Migration utilities for solid-i18n library.
 */

import type { MigrationOptions, MigrationResult, MigrationStatistics } from "./types.js";
import type { Translations } from "../types.js";

/**
 * Migrate from solid-i18n
 */
export function migrateFromSolidI18n(
  sourceTranslations: unknown,
  _options: MigrationOptions,
): MigrationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const statistics: MigrationStatistics = {
    totalKeys: 0,
    migratedKeys: 0,
    skippedKeys: 0,
    errorKeys: 0,
  };

  try {
    // solid-i18n uses a flat structure, we need to convert to our nested structure
    const flatTranslations = sourceTranslations as Record<string, string>;
    const nestedTranslations: Translations = {};

    for (const [key, value] of Object.entries(flatTranslations)) {
      statistics.totalKeys++;
      
      if (typeof value !== "string") {
        warnings.push(`Skipping non-string value for key: ${key}`);
        statistics.skippedKeys++;
        continue;
      }

      // Convert flat key to nested structure
      const keyParts = key.split(".");
      let current = nestedTranslations;
      
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as Translations;
      }
      
      const finalKey = keyParts[keyParts.length - 1];
      current[finalKey] = value;
      statistics.migratedKeys++;
    }

    return {
      success: true,
      migratedTranslations: nestedTranslations,
      warnings,
      errors,
      statistics,
    };
  } catch (error) {
    errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      migratedTranslations: {},
      warnings,
      errors,
      statistics,
    };
  }
}

