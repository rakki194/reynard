/**
 * Search Metrics Composable
 *
 * Tracks and manages search performance metrics including timing,
 * cache statistics, and result counts for monitoring and optimization.
 */

import type { SearchMetrics } from "../types/SearchTypes";

export class SearchMetricsTracker {
  private metrics: SearchMetrics = {
    totalResults: 0,
    searchTime: 0,
    vectorSearchTime: 0,
    keywordSearchTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  private startTimes: Map<string, number> = new Map();

  /**
   * Start timing a search operation
   */
  startTimer(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }

  /**
   * End timing and record metrics
   */
  endTimer(operation: string, resultCount: number = 0): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      return 0;
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(operation);

    // Update specific metrics based on operation type
    switch (operation) {
      case "vector-search":
        this.metrics.vectorSearchTime = duration;
        break;
      case "keyword-search":
        this.metrics.keywordSearchTime = duration;
        break;
      case "hybrid-search":
        this.metrics.searchTime = duration;
        break;
    }

    this.metrics.totalResults = resultCount;
    return duration;
  }

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.metrics.cacheHits++;
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.metrics.cacheMisses++;
  }

  /**
   * Record rerank time
   */
  recordRerankTime(time: number): void {
    this.metrics.rerankTime = time;
  }

  /**
   * Get current metrics
   */
  getMetrics(): SearchMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      totalResults: 0,
      searchTime: 0,
      vectorSearchTime: 0,
      keywordSearchTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
    this.startTimes.clear();
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? this.metrics.cacheHits / total : 0;
  }
}
