/**
 * Amoutonbrady Migration
 *
 * Migration utilities for amoutonbrady i18n library.
 */

import type { MigrationOptions, MigrationResult, MigrationStatistics } from "./types";
import type { Translations } from "../../types";

/**
 * Process nested translation objects
 */
function processNestedTranslations(
  nestedValue: Record<string, unknown>,
  key: string,
  statistics: MigrationStatistics,
  warnings: string[]
): Record<string, string> {
  const nestedTranslations: Record<string, string> = {};

  for (const [nestedKey, nestedVal] of Object.entries(nestedValue)) {
    if (typeof nestedVal === "string") {
      nestedTranslations[nestedKey] = nestedVal;
      statistics.migratedKeys++;
    } else {
      warnings.push(`Skipping non-string value at: ${key}.${nestedKey}`);
      statistics.skippedKeys++;
    }
  }

  return nestedTranslations;
}

/**
 * Migrate from amoutonbrady
 */
export function migrateFromAmoutonbrady(sourceTranslations: unknown, _options: MigrationOptions): MigrationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const statistics: MigrationStatistics = {
    totalKeys: 0,
    migratedKeys: 0,
    skippedKeys: 0,
    errorKeys: 0,
  };

  try {
    const translations = sourceTranslations as Record<string, unknown>;
    const convertedTranslations: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(translations)) {
      statistics.totalKeys++;

      if (typeof value === "string") {
        convertedTranslations[key] = value;
        statistics.migratedKeys++;
      } else if (typeof value === "object" && value !== null) {
        convertedTranslations[key] = processNestedTranslations(
          value as Record<string, unknown>,
          key,
          statistics,
          warnings
        );
      } else {
        warnings.push(`Skipping non-string value for key: ${key}`);
        statistics.skippedKeys++;
      }
    }

    return {
      success: true,
      migratedTranslations: convertedTranslations as Translations,
      warnings,
      errors,
      statistics,
    };
  } catch (error) {
    errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      migratedTranslations: {} as Translations,
      warnings,
      errors,
      statistics,
    };
  }
}
