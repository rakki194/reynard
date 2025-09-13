/**
 * Cache management functionality for Reynard framework
 * Handles translation cache operations and statistics
 */

import type { LanguageCode } from "../../types";
import { clearTranslationCache, getCacheStats } from "../core/loader";

/**
 * Creates cache management functionality
 */
export function createCacheManager() {
  const clearCache = (locale?: LanguageCode) => {
    clearTranslationCache(locale);
  };

  const getCacheStatsFunc = () => {
    return getCacheStats();
  };

  return {
    clearCache,
    getCacheStats: getCacheStatsFunc,
  };
}
