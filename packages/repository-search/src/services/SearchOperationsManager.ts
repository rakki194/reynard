/**
 * Search Operations Manager
 *
 * Intelligent search operations manager with proper error handling,
 * caching, metrics, and validation. Replaces the dumb SearchOperations class.
 */

import type { ModalityType, SearchOptions, SearchResult } from "../types";
import { RepositoryError } from "../types";
import { SearchCache } from "./composables/SearchCache";
import { SearchMetricsTracker } from "./composables/SearchMetrics";
import { SearchStrategyFactory } from "./strategies/SearchStrategy";
import { SearchValidator } from "./validation/SearchValidation";
import type { VectorSearchOptions, HybridSearchOptions, SearchConfig, SearchMetrics } from "./types/SearchTypes";
import type { Logger } from "./types/Logger";

export class SearchOperationsManager {
  private strategyFactory: SearchStrategyFactory;

  constructor(
    private searchCache: SearchCache,
    private metrics: SearchMetricsTracker,
    private vectorSearchComposable: any,
    private hybridSearchComposable: any,
    private embeddingService: any,
    private searchConfig: SearchConfig,
    private logger: Logger
  ) {
    this.strategyFactory = new SearchStrategyFactory(vectorSearchComposable, hybridSearchComposable, searchConfig);
  }

  /**
   * Perform vector search with proper validation and error handling
   */
  async vectorSearch(query: string, options: Partial<VectorSearchOptions> = {}): Promise<SearchResult[]> {
    return this.executeSearch("vector", query, options, validatedOptions => {
      return this.searchCache.generateKey("vector", query, validatedOptions);
    });
  }

  /**
   * Perform hybrid search with proper validation and error handling
   */
  async hybridSearch(query: string, options: Partial<HybridSearchOptions> = {}): Promise<SearchResult[]> {
    return this.executeSearch("hybrid", query, options, validatedOptions => {
      return this.searchCache.generateKey("hybrid", query, validatedOptions);
    });
  }

  /**
   * Perform keyword search with proper validation and error handling
   */
  async keywordSearch(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    return this.executeSearch("keyword", query, options, validatedOptions => {
      return this.searchCache.generateKey("keyword", query, validatedOptions);
    });
  }

  /**
   * Perform multimodal search across multiple modalities
   */
  async multimodalSearch(
    query: string,
    modalities: ModalityType[],
    options: SearchOptions = {}
  ): Promise<Record<ModalityType, SearchResult[]>> {
    const startTime = Date.now();

    try {
      // Validate inputs
      const validatedQuery = SearchValidator.validateQuery(query);
      const validatedModalities = SearchValidator.validateModalities(modalities);
      const validatedOptions = SearchValidator.validateSearchOptions(options);

      this.logger.info("Starting multimodal search", {
        query: validatedQuery.substring(0, 100),
        modalities: validatedModalities,
        options: validatedOptions,
      });

      // Execute searches in parallel for each modality
      const searchPromises = validatedModalities.map(async modality => {
        const modalityOptions = {
          ...validatedOptions,
          modality,
          topK: validatedOptions.topK || this.searchConfig.defaultTopK,
          similarityThreshold: validatedOptions.similarityThreshold || this.searchConfig.defaultSimilarityThreshold,
          includeMetadata: validatedOptions.includeMetadata ?? true,
          rerank: validatedOptions.rerank ?? false,
        };

        const results = await this.vectorSearch(validatedQuery, modalityOptions);
        return { modality, results };
      });

      const searchResults = await Promise.all(searchPromises);

      // Build result map
      const results: Record<ModalityType, SearchResult[]> = {} as Record<ModalityType, SearchResult[]>;
      searchResults.forEach(({ modality, results: modalityResults }) => {
        results[modality] = modalityResults;
      });

      const duration = Date.now() - startTime;
      this.logger.info("Multimodal search completed", {
        duration,
        modalities: validatedModalities,
        totalResults: Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error("Multimodal search failed", error as Error, {
        query: query.substring(0, 100),
        modalities,
        duration,
      });
      throw new RepositoryError(`Failed to perform multimodal search: ${query}`, "MULTIMODAL_SEARCH_ERROR", error);
    }
  }

  /**
   * Find similar files based on a reference file
   */
  async findSimilarFiles(fileId: string, modality: ModalityType, options: SearchOptions = {}): Promise<SearchResult[]> {
    const startTime = Date.now();

    try {
      // Validate inputs
      const validatedFileId = SearchValidator.validateFileId(fileId);
      const validatedModality = SearchValidator.validateModality(modality);
      const validatedOptions = SearchValidator.validateSearchOptions(options);

      this.logger.info("Starting similar files search", {
        fileId: validatedFileId,
        modality: validatedModality,
        options: validatedOptions,
      });

      // TODO: Implement actual similar files logic
      // This would typically involve:
      // 1. Retrieve the reference file's embeddings
      // 2. Perform vector similarity search using those embeddings
      // 3. Filter results to exclude the reference file
      // 4. Apply additional filters and ranking

      const results: SearchResult[] = [];

      const duration = Date.now() - startTime;
      this.logger.info("Similar files search completed", {
        duration,
        fileId: validatedFileId,
        modality: validatedModality,
        resultCount: results.length,
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error("Similar files search failed", error as Error, {
        fileId,
        modality,
        duration,
      });
      throw new RepositoryError(`Failed to find similar files: ${fileId}`, "SIMILAR_FILES_SEARCH_ERROR", error);
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    const startTime = Date.now();

    try {
      // Validate inputs
      const validatedQuery = SearchValidator.validateQuery(query);
      const validatedLimit = SearchValidator.validateLimit(limit);

      this.logger.info("Starting search suggestions", {
        query: validatedQuery.substring(0, 100),
        limit: validatedLimit,
      });

      // TODO: Implement actual search suggestions logic
      // This would typically involve:
      // 1. Query analysis and tokenization
      // 2. Autocomplete from indexed terms
      // 3. Popular query suggestions
      // 4. Typo correction and fuzzy matching
      // 5. Context-aware suggestions based on user history

      const suggestions: string[] = [];

      const duration = Date.now() - startTime;
      this.logger.info("Search suggestions completed", {
        duration,
        query: validatedQuery.substring(0, 100),
        suggestionCount: suggestions.length,
      });

      return suggestions;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error("Search suggestions failed", error as Error, {
        query: query.substring(0, 100),
        limit,
        duration,
      });
      throw new RepositoryError(`Failed to get search suggestions: ${query}`, "SEARCH_SUGGESTIONS_ERROR", error);
    }
  }

  /**
   * Get current search metrics
   */
  getSearchMetrics(): SearchMetrics {
    return this.metrics.getMetrics();
  }

  /**
   * Clear search cache
   */
  clearSearchCache(): void {
    this.searchCache.clear();
    this.logger.info("Search cache cleared");
  }

  /**
   * Get available search strategies
   */
  getAvailableStrategies(): string[] {
    return this.strategyFactory.getAvailableStrategies();
  }

  /**
   * Execute search with proper validation, caching, and metrics
   */
  private async executeSearch<T extends Record<string, unknown>>(
    strategyName: string,
    query: string,
    options: T,
    cacheKeyGenerator: (validatedOptions: T) => string
  ): Promise<SearchResult[]> {
    const startTime = Date.now();

    try {
      // Validate inputs
      const validatedQuery = SearchValidator.validateQuery(query);
      const validatedOptions = this.validateOptionsForStrategy(strategyName, options);

      this.metrics.startTimer(`${strategyName}-search`);

      // Check cache
      const cacheKey = cacheKeyGenerator(validatedOptions);
      if (this.searchConfig.enableCaching) {
        const cached = this.searchCache.get(cacheKey);
        if (cached) {
          this.metrics.recordCacheHit();
          this.logger.info("Cache hit for search", { strategy: strategyName, query: validatedQuery.substring(0, 100) });
          return cached;
        }
        this.metrics.recordCacheMiss();
      }

      // Execute search strategy
      const strategy = this.strategyFactory.getStrategy(strategyName);
      const results = await strategy.search(validatedQuery, validatedOptions, this.logger);

      // Cache results if enabled and results exist
      if (this.searchConfig.enableCaching && results.length > 0) {
        this.searchCache.set(cacheKey, results);
      }

      const searchTime = this.metrics.endTimer(`${strategyName}-search`, results.length);

      this.logger.info("Search completed", {
        strategy: strategyName,
        query: validatedQuery.substring(0, 100),
        duration: searchTime,
        resultCount: results.length,
        cached: false,
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error("Search failed", error as Error, {
        strategy: strategyName,
        query: query.substring(0, 100),
        duration,
      });
      throw new RepositoryError(
        `Failed to perform ${strategyName} search: ${query}`,
        `${strategyName.toUpperCase()}_SEARCH_ERROR`,
        error
      );
    }
  }

  /**
   * Validate options based on strategy type
   */
  private validateOptionsForStrategy<T extends Record<string, unknown>>(strategyName: string, options: T): T {
    switch (strategyName) {
      case "vector":
        return SearchValidator.validateVectorSearchOptions(options as Partial<VectorSearchOptions>) as T;
      case "hybrid":
        return SearchValidator.validateHybridSearchOptions(options as Partial<HybridSearchOptions>) as T;
      case "keyword":
        return SearchValidator.validateSearchOptions(options as Partial<SearchOptions>) as T;
      default:
        return options;
    }
  }
}
