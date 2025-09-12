/**
 * Core Translation Loading Logic
 *
 * Handles the core logic for loading translation modules.
 */

import type { LanguageCode, Translations } from "../types";

export async function loadTranslationModuleCore(
  locale: LanguageCode,
  importFn: (path: string) => Promise<any>,
): Promise<Translations> {
  try {
    const translationModule = await importFn(`./lang/${locale}/index.js`);
    return translationModule.default;
  } catch (error) {
    throw error;
  }
}

export function isTestEnvironment(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV === "test";
}

export function hasMockedImport(): boolean {
  const globalImport = (globalThis as any).import;
  return globalImport &&
    typeof globalImport === "function" &&
    (globalImport.mockImplementation ||
      globalImport.mockResolvedValue ||
      globalImport.mockRejectedValue);
}

