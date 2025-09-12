/**
 * Migration Tools and Enterprise Features
 * Tools for migrating from other i18n libraries and enterprise-grade features
 */

import type { MigrationOptions, MigrationResult } from "./migration/types.js";
import { migrateFromSolidI18n } from "./migration/solidI18n.js";
import { migrateFromI18next } from "./migration/i18next.js";
import { migrateFromAmoutonbrady } from "./migration/amoutonbrady.js";

/**
 * Main migration function
 */
export function migrateTranslations(
  sourceTranslations: unknown,
  options: MigrationOptions,
): MigrationResult {
  switch (options.sourceLibrary) {
    case "solid-i18n":
      return migrateFromSolidI18n(sourceTranslations, options);
    case "i18next":
    case "react-i18next":
      return migrateFromI18next(sourceTranslations, options);
    case "amoutonbrady":
      return migrateFromAmoutonbrady(sourceTranslations, options);
    default:
      return {
        success: false,
        migratedTranslations: {},
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
}

// Re-export types and functions
export type { MigrationOptions, MigrationResult } from "./migration/types.js";
export { migrateFromSolidI18n } from "./migration/solidI18n.js";
export { migrateFromI18next } from "./migration/i18next.js";
export { migrateFromAmoutonbrady } from "./migration/amoutonbrady.js";