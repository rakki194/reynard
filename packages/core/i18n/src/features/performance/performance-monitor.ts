/**
 * Performance monitoring utilities for Reynard i18n
 * Lightweight performance tracking for translation operations
 */

import type { I18nPerformanceMonitor } from "../../types";

// Create performance monitor
export function createPerformanceMonitor(): I18nPerformanceMonitor {
  let translationCalls = 0;
  let cacheHits = 0;
  let cacheMisses = 0;
  const loadTimes: number[] = [];

  return {
    recordTranslationCall: () => {
      translationCalls++;
    },
    recordCacheHit: () => {
      cacheHits++;
    },
    recordCacheMiss: () => {
      cacheMisses++;
    },
    recordLoadTime: (_namespace?: string, duration?: number) => {
      if (duration !== undefined) {
        loadTimes.push(duration);
      }
    },
    getMetrics: () => ({
      translationCalls,
      cacheHits,
      cacheMisses,
      loadTimes: [...loadTimes],
      averageLoadTime: loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0,
      cacheHitRate: cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0,
    }),
    reset: () => {
      translationCalls = 0;
      cacheHits = 0;
      cacheMisses = 0;
      loadTimes.length = 0;
    },
  };
}

// Create no-op performance monitor
export function createNoOpPerformanceMonitor() {
  return {
    recordTranslationCall: () => {},
    recordCacheHit: () => {},
    recordCacheMiss: () => {},
    recordLoadTime: () => {},
    getMetrics: () => ({}),
    reset: () => {},
  };
}
