/**
 * Solid I18n Migration
 *
 * Migration utilities for solid-i18n library.
 */

import type { MigrationOptions, MigrationResult, MigrationStatistics } from "./types";
import type { Translations } from "../../types";

/**
 * Convert flat key to nested structure
 */
function convertFlatKeyToNested(key: string, value: string, nestedTranslations: Record<string, unknown>): void {
  const keyParts = key.split(".");
  let current = nestedTranslations;

  for (let i = 0; i < keyParts.length - 1; i++) {
    const part = keyParts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  const finalKey = keyParts[keyParts.length - 1];
  current[finalKey] = value;
}

/**
 * Migrate from solid-i18n
 */
export function migrateFromSolidI18n(sourceTranslations: unknown, _options: MigrationOptions): MigrationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const statistics: MigrationStatistics = {
    totalKeys: 0,
    migratedKeys: 0,
    skippedKeys: 0,
    errorKeys: 0,
  };

  try {
    const flatTranslations = sourceTranslations as Record<string, string>;
    const nestedTranslations: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(flatTranslations)) {
      statistics.totalKeys++;

      if (typeof value !== "string") {
        warnings.push(`Skipping non-string value for key: ${key}`);
        statistics.skippedKeys++;
        continue;
      }

      convertFlatKeyToNested(key, value, nestedTranslations);
      statistics.migratedKeys++;
    }

    return {
      success: true,
      migratedTranslations: nestedTranslations as Translations,
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
