/**
 * Cache manager for the Dynamic Enum System
 */

import type { CacheEntry, CacheConfig, EnumData } from '../types/EnumTypes';

/**
 * Cache manager for storing and retrieving enum data
 */
export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: CacheConfig) {
    this.config = config;
    this.startCleanup();
  }

  /**
   * Get cached data for a key
   */
  get<T = EnumData>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Update access information
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    return entry.data as T;
  }

  /**
   * Set cached data for a key
   */
  set<T = EnumData>(key: string, data: T): void {
    const entry: CacheEntry = {
      data: data as any,
      created: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if a key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Delete cached data for a key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
    totalAccesses: number;
    averageAge: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    let totalAccesses = 0;
    let totalAge = 0;
    let oldestEntry = 0;
    let newestEntry = 0;

    for (const entry of entries) {
      totalAccesses += entry.accessCount;
      totalAge += now - entry.created;
      
      if (oldestEntry === 0 || entry.created < oldestEntry) {
        oldestEntry = entry.created;
      }
      
      if (entry.created > newestEntry) {
        newestEntry = entry.created;
      }
    }

    return {
      size: this.cache.size,
      hitRate: entries.length > 0 ? totalAccesses / entries.length : 0,
      totalAccesses,
      averageAge: entries.length > 0 ? totalAge / entries.length : 0,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Get cache entry information
   */
  getEntryInfo(key: string): {
    exists: boolean;
    age: number;
    accessCount: number;
    isExpired: boolean;
  } | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = this.isExpired(entry);

    return {
      exists: true,
      age: now - entry.created,
      accessCount: entry.accessCount,
      isExpired
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (this.isExpired(entry) || (now - entry.lastAccessed) > this.config.maxAge) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    if (expiredKeys.length > 0) {
      console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Start automatic cleanup
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Check if a cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.created) > this.config.ttl;
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * Check if cache is empty
   */
  isEmpty(): boolean {
    return this.cache.size === 0;
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart cleanup with new interval
    if (newConfig.cleanupInterval) {
      this.startCleanup();
    }
  }

  /**
   * Get current cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Destroy the cache manager
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}
