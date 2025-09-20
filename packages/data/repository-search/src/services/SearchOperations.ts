/**
 * Search Operations
 *
 * Intelligent search operations with proper error handling, validation,
 * caching, and metrics. This class has been refactored from the original
 * "dumb" implementation to provide enterprise-grade search capabilities.
 */

import type { ModalityType, SearchOptions, SearchResult } from "../types";
import { SearchCache } from "./composables/SearchCache";
import { SearchMetricsTracker } from "./composables/SearchMetrics";
import { VectorSearchComposable } from "./composables/VectorSearch";
import { HybridSearchComposable } from "./composables/HybridSearch";
import { SearchOperationsManager } from "./SearchOperationsManager";
import { ConsoleLogger } from "./types/Logger";
import type { EmbeddingService } from "./EmbeddingService";
import type { VectorSearchOptions, HybridSearchOptions, SearchConfig, SearchMetrics } from "./types/SearchTypes";

/**
 * Intelligent Search Operations
 *
 * This class provides a clean, intelligent interface to search operations
 * with proper error handling, validation, caching, and metrics tracking.
 *
 * @deprecated Use SearchOperationsManager directly for new code
 */
export class SearchOperations {
  private manager: SearchOperationsManager;

  constructor(
    searchCache: SearchCache,
    metrics: SearchMetricsTracker,
    vectorSearchComposable: VectorSearchComposable,
    hybridSearchComposable: HybridSearchComposable,
    embeddingService: EmbeddingService,
    searchConfig: SearchConfig,
    logger = new ConsoleLogger()
  ) {
    this.manager = new SearchOperationsManager(
      searchCache,
      metrics,
      vectorSearchComposable,
      hybridSearchComposable,
      embeddingService,
      searchConfig,
      logger
    );
  }
  /**
   * Perform vector search with intelligent error handling and validation
   */
  async vectorSearch(query: string, options: Partial<VectorSearchOptions> = {}): Promise<SearchResult[]> {
    return this.manager.vectorSearch(query, options);
  }
  /**
   * Perform hybrid search with intelligent error handling and validation
   */
  async hybridSearch(query: string, options: Partial<HybridSearchOptions> = {}): Promise<SearchResult[]> {
    return this.manager.hybridSearch(query, options);
  }
  /**
   * Perform keyword search with intelligent error handling and validation
   */
  async keywordSearch(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    return this.manager.keywordSearch(query, options);
  }
  /**
   * Perform multimodal search across multiple modalities with intelligent error handling
   */
  async multimodalSearch(
    query: string,
    modalities: ModalityType[],
    options: SearchOptions = {}
  ): Promise<Record<ModalityType, SearchResult[]>> {
    return this.manager.multimodalSearch(query, modalities, options);
  }
  /**
   * Find similar files with intelligent error handling and validation
   */
  async findSimilarFiles(fileId: string, modality: ModalityType, options: SearchOptions = {}): Promise<SearchResult[]> {
    return this.manager.findSimilarFiles(fileId, modality, options);
  }
  /**
   * Get search suggestions with intelligent error handling and validation
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    return this.manager.getSearchSuggestions(query, limit);
  }
  /**
   * Get current search metrics
   */
  getSearchMetrics(): SearchMetrics {
    return this.manager.getSearchMetrics();
  }

  /**
   * Clear search cache
   */
  clearSearchCache(): void {
    this.manager.clearSearchCache();
  }

  /**
   * Get available search strategies
   */
  getAvailableStrategies(): string[] {
    return this.manager.getAvailableStrategies();
  }
}
