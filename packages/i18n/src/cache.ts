/**
 * Translation cache management utilities
 * Handles caching for both full translations and namespaces
 */

import type { LanguageCode, Translations } from "./types";

// Translation cache for performance optimization
export const translationCache = new Map<string, Translations>();
export const namespaceCache = new Map<string, Map<string, unknown>>();

// Cache management utilities
export const clearTranslationCache = (locale?: LanguageCode) => {
  if (locale) {
    translationCache.delete(locale);
    namespaceCache.forEach((namespaceMap) => {
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
