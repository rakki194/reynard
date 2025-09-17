/**
 * Search Cache Composable
 *
 * Provides caching functionality for search results with LRU eviction
 * and TTL support for optimal performance.
 */

import type { SearchResult, SearchCacheEntry } from "../types/SearchTypes";

export class SearchCache {
  private cache: Map<string, SearchCacheEntry> = new Map();
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize: number = 500, defaultTtl: number = 300000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  /**
   * Get cached search results
   */
  get(key: string): SearchResult[] | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.results;
  }

  /**
   * Set cached search results
   */
  set(key: string, results: SearchResult[], ttl?: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      results,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
    });
  }

  /**
   * Clear all cached results
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Generate cache key for search parameters
   */
  generateKey(prefix: string, query: string, options: Record<string, unknown>): string {
    const optionsStr = JSON.stringify(options);
    return `${prefix}:${this.hashString(query)}:${this.hashString(optionsStr)}`;
  }

  /**
   * Hash string for cache key generation
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }
}
