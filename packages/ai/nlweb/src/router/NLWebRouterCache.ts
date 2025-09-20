/**
 * NLWeb Router Cache
 *
 * Cache management for the NLWeb router.
 */

import { NLWebSuggestionRequest, NLWebSuggestionResponse } from "../types/index.js";

export interface CacheEntry {
  response: NLWebSuggestionResponse;
  timestamp: number;
}

export interface NLWebRouterCache {
  get: (key: string) => CacheEntry | undefined;
  set: (key: string, entry: CacheEntry) => void;
  generateCacheKey: (request: NLWebSuggestionRequest) => string;
  isCacheValid: (timestamp: number) => boolean;
  cleanup: () => void;
}

/**
 * Create NLWeb router cache
 */
export function createNLWebRouterCache(cacheTtl: number, maxCacheSize: number): NLWebRouterCache {
  const cache = new Map<string, CacheEntry>();

  const get = (key: string): CacheEntry | undefined => {
    return cache.get(key);
  };

  const set = (key: string, entry: CacheEntry): void => {
    // Remove oldest entries if cache is full
    if (cache.size >= maxCacheSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, entry);
  };

  const generateCacheKey = (request: NLWebSuggestionRequest): string => {
    const key = `${request.query}:${JSON.stringify(request.context)}:${request.maxSuggestions}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, "");
  };

  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < cacheTtl;
  };

  const cleanup = (): void => {
    for (const [key, entry] of cache.entries()) {
      if (!isCacheValid(entry.timestamp)) {
        cache.delete(key);
      }
    }
  };

  return {
    get,
    set,
    generateCacheKey,
    isCacheValid,
    cleanup,
  };
}
