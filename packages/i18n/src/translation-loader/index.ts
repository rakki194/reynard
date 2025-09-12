/**
 * Translation Loader
 *
 * Handles loading of translation modules with fallback support.
 */

export * from "./LoaderCore";
export * from "./LoaderUtils";

import type { LanguageCode, Translations } from "../types";
import { loadTranslationModuleCore, isTestEnvironment, hasMockedImport } from "./LoaderCore";
import { loadEnglishFallbackCore, createImportFunction } from "./LoaderUtils";

// Load translations from glob or dynamic import
export async function loadTranslationModule(
  locale: LanguageCode,
): Promise<Translations> {
  const importFn = createImportFunction();
  
  if (isTestEnvironment() && hasMockedImport()) {
    return loadTranslationModuleCore(locale, importFn);
  }
  
  return loadTranslationModuleCore(locale, importFn);
}

// Load English fallback translations
export async function loadEnglishFallback(): Promise<Translations> {
  const importFn = createImportFunction();
  return loadEnglishFallbackCore(importFn);
}

