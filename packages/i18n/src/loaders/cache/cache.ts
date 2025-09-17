/**
 * Translation cache management utilities
 * Handles caching for both full translations and namespaces
 */

import type { LanguageCode, Translations } from "../../types";

// Translation cache for performance optimization
export const translationCache = new Map<string, Translations>();
export const namespaceCache = new Map<string, Map<string, unknown>>();

// Load translations with caching
export async function loadTranslationsWithCache(
  locale: LanguageCode,
  useCache: boolean = true,
  importFn?: (path: string) => Promise<{ default: Translations }>
): Promise<Translations> {
  if (useCache && translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }

  try {
    // Use provided import function or default
    const defaultImportFn = importFn || ((path: string) => import(path));
    const translations = await defaultImportFn(`./lang/${locale}/index.js`);

    if (useCache) {
      translationCache.set(locale, translations.default);
    }

    return translations.default;
  } catch (error) {
    // Fallback to English if available
    if (locale !== "en") {
      try {
        const defaultImportFn = importFn || ((path: string) => import(path));
        const englishTranslations = await defaultImportFn(`./lang/en/index.js`);

        if (useCache) {
          translationCache.set(locale, englishTranslations.default);
        }

        return englishTranslations.default;
      } catch (fallbackError) {
        console.error(`Failed to load translations for locale ${locale} and fallback to English:`, fallbackError);
        throw error;
      }
    }

    console.error(`Failed to load translations for locale ${locale}:`, error);
    throw error;
  }
}

// Cache management utilities
export const clearTranslationCache = (locale?: LanguageCode) => {
  if (locale) {
    translationCache.delete(locale);
    namespaceCache.forEach(namespaceMap => {
      namespaceMap.delete(locale);
    });
  } else {
    translationCache.clear();
    namespaceCache.clear();
  }
};

export const getCacheStats = () => ({
  fullTranslations: translationCache.size,
  namespaces: Array.from(namespaceCache.entries()).map(([name, map]) => ({
    name,
    locales: map.size,
  })),
});
