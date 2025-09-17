/**
 * Search Operations
 *
 * Handles all search-related operations for the SearchService.
 * This class is separated to comply with the 140-line axiom.
 */

import type { ModalityType, SearchOptions, SearchResult } from "../types";
import { RepositoryError } from "../types";
import { SearchCache } from "./composables/SearchCache";
import { SearchMetricsTracker } from "./composables/SearchMetrics";
import { VectorSearchComposable } from "./composables/VectorSearch";
import { HybridSearchComposable } from "./composables/HybridSearch";
import type { EmbeddingService } from "./EmbeddingService";
import type { VectorSearchOptions, HybridSearchOptions, SearchConfig } from "./types/SearchTypes";

export class SearchOperations {
  constructor(
    private searchCache: SearchCache,
    private metrics: SearchMetricsTracker,
    private vectorSearchComposable: VectorSearchComposable,
    private hybridSearchComposable: HybridSearchComposable,
    private embeddingService: EmbeddingService,
    private searchConfig: SearchConfig
  ) {}

  /**
   * Perform vector similarity search
   */
  async vectorSearch(query: string, options: Partial<VectorSearchOptions> = {}): Promise<SearchResult[]> {
    try {
      this.metrics.startTimer("vector-search");
      const cacheKey = this.searchCache.generateKey("vector", query, options);

      // Check cache first
      if (this.searchConfig.enableCaching) {
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
      });

      const searchTime = this.metrics.endTimer("vector-search", results.length);

      // Cache results
      if (this.searchConfig.enableCaching && results.length > 0) {
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
      if (this.searchConfig.enableCaching) {
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
      });

      const searchTime = this.metrics.endTimer("hybrid-search", results.length);

      // Cache results
      if (this.searchConfig.enableCaching && results.length > 0) {
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

  /**
   * Search across multiple modalities
   */
  async multimodalSearch(
    query: string,
    modalities: ModalityType[],
    options: SearchOptions = {}
  ): Promise<Record<ModalityType, SearchResult[]>> {
    try {
      const startTime = Date.now();
      const results: Record<ModalityType, SearchResult[]> = {} as Record<ModalityType, SearchResult[]>;

      // Search each modality in parallel
      const searchPromises = modalities.map(async modality => {
        const modalityResults = await this.vectorSearch(query, {
          ...options,
          modality,
          topK: options.topK || this.searchConfig.defaultTopK,
          similarityThreshold: options.similarityThreshold || this.searchConfig.defaultSimilarityThreshold,
          includeMetadata: options.includeMetadata ?? true,
          rerank: options.rerank ?? false,
        });
        return { modality, results: modalityResults };
      });

      const searchResults = await Promise.all(searchPromises);

      // Organize results by modality
      searchResults.forEach(({ modality, results: modalityResults }) => {
        results[modality] = modalityResults;
      });

      const searchTime = Date.now() - startTime;
      console.log(`Multimodal search completed in ${searchTime}ms across ${modalities.length} modalities`);

      return results;
    } catch (error) {
      console.error(`Failed to perform multimodal search: ${query}`, error);
      throw new RepositoryError(`Failed to perform multimodal search: ${query}`, "MULTIMODAL_SEARCH_ERROR", error);
    }
  }

  /**
   * Find similar files based on a reference file
   */
  async findSimilarFiles(fileId: string, modality: ModalityType, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      const startTime = Date.now();

      // Get the embedding for the reference file
      // This would typically use the embedding service
      // For now, return a mock implementation
      const results: SearchResult[] = [];

      const searchTime = Date.now() - startTime;
      console.log(`Similar files search completed in ${searchTime}ms, found ${results.length} results`);

      return results;
    } catch (error) {
      console.error(`Failed to find similar files for ${fileId}:`, error);
      throw new RepositoryError(`Failed to find similar files: ${fileId}`, "SIMILAR_FILES_SEARCH_ERROR", error);
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string, _limit: number = 10): Promise<string[]> {
    try {
      // This would typically query a suggestion index
      // For now, return a mock implementation
      const suggestions: string[] = [];

      console.log(`Generated ${suggestions.length} search suggestions for query: ${query}`);
      return suggestions;
    } catch (error) {
      console.error(`Failed to get search suggestions for: ${query}`, error);
      throw new RepositoryError(`Failed to get search suggestions: ${query}`, "SEARCH_SUGGESTIONS_ERROR", error);
    }
  }

  /**
   * Get search analytics and metrics
   */
  getSearchMetrics(): SearchMetrics {
    return this.metrics.getMetrics();
  }

  /**
   * Clear search cache
   */
  clearSearchCache(): void {
    this.searchCache.clear();
    console.log("Search cache cleared");
  }
}