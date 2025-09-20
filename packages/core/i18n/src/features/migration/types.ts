/**
 * Migration Types
 *
 * Type definitions for i18n migration utilities.
 */

import type { LanguageCode, Translations } from "../../types";

export interface MigrationOptions {
  sourceLibrary: "solid-i18n" | "solid-primitives" | "amoutonbrady" | "i18next" | "react-i18next";
  sourceTranslations: unknown;
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

export interface MigrationStatistics {
  totalKeys: number;
  migratedKeys: number;
  skippedKeys: number;
  errorKeys: number;
}
