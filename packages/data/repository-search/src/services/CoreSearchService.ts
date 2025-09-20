/**
 * Core Search Service
 *
 * Handles the core search operations including vector search,
 * hybrid search, and keyword search with caching and metrics.
 */

import type { SearchOptions, SearchResult } from "../types";
import { RepositoryError } from "../types";
import type { SearchCache } from "./composables/SearchCache";
import type { SearchMetricsTracker } from "./composables/SearchMetrics";
import type { VectorSearchComposable } from "./composables/VectorSearch";
import type { HybridSearchComposable } from "./composables/HybridSearch";
import type { VectorSearchOptions, HybridSearchOptions } from "./types/SearchTypes";

export class CoreSearchService {
  constructor(
    private searchCache: SearchCache,
    private metrics: SearchMetricsTracker,
    private vectorSearchComposable: VectorSearchComposable,
    private hybridSearchComposable: HybridSearchComposable,
    private metadata: Record<string, unknown>
  ) {}

  /**
   * Perform vector similarity search
   */
  async vectorSearch(query: string, options: Partial<VectorSearchOptions> = {}): Promise<SearchResult[]> {
    try {
      this.metrics.startTimer("vector-search");
      const cacheKey = this.searchCache.generateKey("vector", query, options);

      // Check cache first
      if (this.metadata.enableCaching) {
        const cached = this.searchCache.get(cacheKey);
        if (cached) {
          this.metrics.recordCacheHit();
          return cached;
        }
        this.metrics.recordCacheMiss();
      }

      // Perform vector search using composable
      const results = await this.vectorSearchComposable.search(query, options as VectorSearchOptions, {
        info: (msg: string) => console.log(msg),
        error: (msg: string, error?: unknown) => console.error(msg, error),
        warn: (msg: string, error?: unknown) => console.warn(msg, error),
      });

      const searchTime = this.metrics.endTimer("vector-search", results.length);

      // Cache results
      if (this.metadata.enableCaching && results.length > 0) {
        this.searchCache.set(cacheKey, results);
      }

      console.log(`Vector search completed in ${searchTime}ms, found ${results.length} results`);
      return results;
    } catch (error) {
      console.error(`Failed to perform vector search: ${query}`, error);
      throw new RepositoryError(`Failed to perform vector search: ${query}`, "VECTOR_SEARCH_ERROR", error);
    }
  }

  /**
   * Perform hybrid search combining vector and keyword search
   */
  async hybridSearch(query: string, options: Partial<HybridSearchOptions> = {}): Promise<SearchResult[]> {
    try {
      this.metrics.startTimer("hybrid-search");
      const cacheKey = this.searchCache.generateKey("hybrid", query, options);

      // Check cache first
      if (this.metadata.enableCaching) {
        const cached = this.searchCache.get(cacheKey);
        if (cached) {
          this.metrics.recordCacheHit();
          return cached;
        }
        this.metrics.recordCacheMiss();
      }

      // Perform hybrid search using composable
      const results = await this.hybridSearchComposable.search(query, options as HybridSearchOptions, {
        info: (msg: string) => console.log(msg),
        error: (msg: string, error?: unknown) => console.error(msg, error),
        warn: (msg: string, error?: unknown) => console.warn(msg, error),
      });

      const searchTime = this.metrics.endTimer("hybrid-search", results.length);

      // Cache results
      if (this.metadata.enableCaching && results.length > 0) {
        this.searchCache.set(cacheKey, results);
      }

      console.log(`Hybrid search completed in ${searchTime}ms, found ${results.length} results`);
      return results;
    } catch (error) {
      console.error(`Failed to perform hybrid search: ${query}`, error);
      throw new RepositoryError(`Failed to perform hybrid search: ${query}`, "HYBRID_SEARCH_ERROR", error);
    }
  }

  /**
   * Perform keyword search
   */
  async keywordSearch(query: string, _options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      this.metrics.startTimer("keyword-search");

      // This would typically query a full-text search index
      // For now, return a mock implementation
      const results: SearchResult[] = [];

      const searchTime = this.metrics.endTimer("keyword-search", results.length);

      console.log(`Keyword search completed in ${searchTime}ms, found ${results.length} results`);
      return results;
    } catch (error) {
      console.error(`Failed to perform keyword search: ${query}`, error);
      throw new RepositoryError(`Failed to perform keyword search: ${query}`, "KEYWORD_SEARCH_ERROR", error);
    }
  }
}
