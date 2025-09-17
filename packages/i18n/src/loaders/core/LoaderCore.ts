/**
 * Core Translation Loading Logic
 *
 * Handles the core logic for loading translation modules.
 */

import type { LanguageCode, Translations } from "../../types";

export async function loadTranslationModuleCore(
  locale: LanguageCode,
  importFn: (path: string) => Promise<{ default: Translations }>
): Promise<Translations> {
  const translationModule = await importFn(`./lang/${locale}/index.js`);
  return translationModule.default;
}

export function isTestEnvironment(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV === "test";
}

export function hasMockedImport(): boolean {
  const globalImport = (globalThis as { import?: unknown }).import;
  if (!globalImport || typeof globalImport !== "function") {
    return false;
  }

  const mockImport = globalImport as {
    mockImplementation?: unknown;
    mockResolvedValue?: unknown;
    mockRejectedValue?: unknown;
  };

  return Boolean(mockImport.mockImplementation || mockImport.mockResolvedValue || mockImport.mockRejectedValue);
}
