/**
 * Translation Loader Utilities
 *
 * Utility functions for translation loading operations.
 */

import type { Translations } from "../../types";

export async function loadEnglishFallbackCore(
  importFn: (path: string) => Promise<{ default: Translations }>
): Promise<Translations> {
  const fallbackModule = await importFn("./lang/en/index.js");
  return fallbackModule.default;
}

export function createImportFunction(): (path: string) => Promise<{ default: Translations }> {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    const globalImport = (
      globalThis as {
        import?: (path: string) => Promise<{ default: Translations }>;
      }
    ).import;
    if (globalImport && typeof globalImport === "function") {
      return globalImport;
    }
  }
  return (path: string) => import(path);
}
