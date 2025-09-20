/**
 * i18next Migration
 *
 * Migration utilities for i18next library.
 */

import type { MigrationOptions, MigrationResult, MigrationStatistics } from "./types";
import type { Translations } from "../../types";

/**
 * Migrate from i18next
 */
export function migrateFromI18next(sourceTranslations: unknown, _options: MigrationOptions): MigrationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const statistics: MigrationStatistics = {
    totalKeys: 0,
    migratedKeys: 0,
    skippedKeys: 0,
    errorKeys: 0,
  };

  try {
    // i18next already uses nested structure, but we need to validate it
    const translations = sourceTranslations as Record<string, unknown>;

    const processTranslations = (obj: unknown, path = ""): void => {
      if (typeof obj === "object" && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          statistics.totalKeys++;

          if (typeof value === "string") {
            statistics.migratedKeys++;
          } else if (typeof value === "object" && value !== null) {
            processTranslations(value, currentPath);
          } else {
            warnings.push(`Skipping non-string value at: ${currentPath}`);
            statistics.skippedKeys++;
          }
        }
      }
    };

    processTranslations(translations);

    return {
      success: true,
      migratedTranslations: translations as Translations,
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
