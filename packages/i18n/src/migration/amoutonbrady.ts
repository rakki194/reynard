/**
 * Amoutonbrady Migration
 *
 * Migration utilities for amoutonbrady i18n library.
 */

import type { MigrationOptions, MigrationResult, MigrationStatistics } from "./types.js";
import type { Translations } from "../types.js";

/**
 * Migrate from amoutonbrady
 */
export function migrateFromAmoutonbrady(
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
    // amoutonbrady uses a specific structure, we need to convert it
    const translations = sourceTranslations as Record<string, unknown>;
    const convertedTranslations: Translations = {};

    for (const [key, value] of Object.entries(translations)) {
      statistics.totalKeys++;
      
      if (typeof value === "string") {
        convertedTranslations[key] = value;
        statistics.migratedKeys++;
      } else if (typeof value === "object" && value !== null) {
        // Handle nested objects
        const nestedValue = value as Record<string, unknown>;
        const nestedTranslations: Translations = {};
        
        for (const [nestedKey, nestedVal] of Object.entries(nestedValue)) {
          if (typeof nestedVal === "string") {
            nestedTranslations[nestedKey] = nestedVal;
            statistics.migratedKeys++;
          } else {
            warnings.push(`Skipping non-string value at: ${key}.${nestedKey}`);
            statistics.skippedKeys++;
          }
        }
        
        convertedTranslations[key] = nestedTranslations;
      } else {
        warnings.push(`Skipping non-string value for key: ${key}`);
        statistics.skippedKeys++;
      }
    }

    return {
      success: true,
      migratedTranslations: convertedTranslations,
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

