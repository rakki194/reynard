/**
 * Translation Loader Utilities
 *
 * Utility functions for translation loading operations.
 */

import type { LanguageCode, Translations } from "../types";

export async function loadEnglishFallbackCore(
  importFn: (path: string) => Promise<any>,
): Promise<Translations> {
  try {
    const fallbackModule = await importFn("./lang/en/index.js");
    return fallbackModule.default;
  } catch (error) {
    throw error;
  }
}

export function createImportFunction(): (path: string) => Promise<any> {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    const globalImport = (globalThis as any).import;
    if (globalImport && typeof globalImport === "function") {
      return globalImport;
    }
  }
  return import;
}

