/**
 * Search Service
 *
 * Advanced search service providing vector similarity search, hybrid search,
 * and multimodal content discovery across the unified repository.
 */

import type { BaseAIService } from "reynard-ai-shared";
import type { ModalityType, SearchOptions, SearchResult, VectorEmbedding } from "../types";
import { RepositoryError } from "../types";
import { EmbeddingService } from "./EmbeddingService";

export interface VectorSearchOptions {
  topK: number;
  similarityThreshold: number;
  modality?: ModalityType;
  includeMetadata: boolean;
  rerank: boolean;
}

export interface HybridSearchOptions extends VectorSearchOptions {
  keywordWeight: number;
  vectorWeight: number;
  enableReranking: boolean;
}

export interface SearchFilters {
  fileTypes?: string[];
  dateRange?: { from: Date; to: Date };
  sizeRange?: { min: number; max: number };
  tags?: string[];
  datasetIds?: string[];
  modalities?: ModalityType[];
}

export interface SearchMetrics {
  totalResults: number;
  searchTime: number;
  vectorSearchTime: number;
  keywordSearchTime: number;
  rerankTime?: number;
  cacheHits: number;
  cacheMisses: number;
}

export class SearchService extends BaseAIService {
  private embeddingService: EmbeddingService;
  private initialized = false;
  private searchCache: Map<string, SearchResult[]> = new Map();
  private metrics: SearchMetrics = {
    totalResults: 0,
    searchTime: 0,
    vectorSearchTime: 0,
    keywordSearchTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  constructor() {
    super({
      name: "search-service",
      dependencies: ["embedding-service"],
      startupPriority: 90,
      requiredPackages: ["reynard-rag"],
      autoStart: true,
      config: {
        maxResults: 1000,
        defaultTopK: 20,
        defaultSimilarityThreshold: 0.7,
        enableCaching: true,
        cacheSize: 500,
        enableReranking: true,
        hybridSearchEnabled: true,
        vectorWeight: 0.7,
        keywordWeight: 0.3,
      },
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize embedding service
      this.embeddingService = new EmbeddingService();
      await this.embeddingService.initialize();

      this.initialized = true;
      this.logger.info("SearchService initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize SearchService:", error);
      throw new RepositoryError("Failed to initialize SearchService", "SEARCH_SERVICE_INIT_ERROR", error);
    }
  }

  async shutdown(): Promise<void> {
    if (this.embeddingService) {
      await this.embeddingService.shutdown();
    }
    this.searchCache.clear();
    this.initialized = false;
    this.logger.info("SearchService shutdown complete");
  }

  async healthCheck(): Promise<any> {
    return {
      status: this.initialized ? "healthy" : "unhealthy",
      embeddingService: this.embeddingService ? await this.embeddingService.healthCheck() : null,
      cacheSize: this.searchCache.size,
      metrics: this.metrics,
      lastCheck: new Date(),
    };
  }

  /**
   * Perform vector similarity search
   */
  async vectorSearch(query: string, options: VectorSearchOptions = {}): Promise<SearchResult[]> {
    this.ensureInitialized();

    try {
      const startTime = Date.now();
      const cacheKey = this.generateSearchCacheKey(query, options);

      // Check cache first
      if (this.config.enableCaching) {
        const cached = this.searchCache.get(cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
          return cached;
        }
        this.metrics.cacheMisses++;
      }

      // Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(query, options.modality);

      // Perform vector search
      const results = await this.performVectorSearch(queryEmbedding, options);

      // Apply filters if specified
      const filteredResults = this.applySearchFilters(results, options);

      // Rerank results if enabled
      const finalResults = options.rerank ? await this.rerankResults(filteredResults, query, options) : filteredResults;

      const searchTime = Date.now() - startTime;
      this.metrics.vectorSearchTime = searchTime;
      this.metrics.totalResults = finalResults.length;

      // Cache results
      if (this.config.enableCaching && finalResults.length > 0) {
        this.cacheSearchResults(cacheKey, finalResults);
      }

      this.logger.info(`Vector search completed in ${searchTime}ms, found ${finalResults.length} results`);
      return finalResults;
    } catch (error) {
      this.logger.error(`Failed to perform vector search: ${query}`, error);
      throw new RepositoryError(`Failed to perform vector search: ${query}`, "VECTOR_SEARCH_ERROR", error);
    }
  }

  /**
   * Perform hybrid search combining vector and keyword search
   */
  async hybridSearch(query: string, options: HybridSearchOptions = {}): Promise<SearchResult[]> {
    this.ensureInitialized();

    try {
      const startTime = Date.now();
      const cacheKey = this.generateHybridSearchCacheKey(query, options);

      // Check cache first
      if (this.config.enableCaching) {
        const cached = this.searchCache.get(cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
          return cached;
        }
        this.metrics.cacheMisses++;
      }

      // Perform both vector and keyword search in parallel
      const [vectorResults, keywordResults] = await Promise.all([
        this.vectorSearch(query, options),
        this.keywordSearch(query, options),
      ]);

      // Combine and score results
      const combinedResults = this.combineSearchResults(vectorResults, keywordResults, options);

      // Rerank if enabled
      const finalResults = options.enableReranking
        ? await this.rerankResults(combinedResults, query, options)
        : combinedResults;

      const searchTime = Date.now() - startTime;
      this.metrics.searchTime = searchTime;
      this.metrics.totalResults = finalResults.length;

      // Cache results
      if (this.config.enableCaching && finalResults.length > 0) {
        this.cacheSearchResults(cacheKey, finalResults);
      }

      this.logger.info(`Hybrid search completed in ${searchTime}ms, found ${finalResults.length} results`);
      return finalResults;
    } catch (error) {
      this.logger.error(`Failed to perform hybrid search: ${query}`, error);
      throw new RepositoryError(`Failed to perform hybrid search: ${query}`, "HYBRID_SEARCH_ERROR", error);
    }
  }

  /**
   * Perform keyword search
   */
  async keywordSearch(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    this.ensureInitialized();

    try {
      const startTime = Date.now();

      // This would typically query a full-text search index
      // For now, return a mock implementation
      const results: SearchResult[] = [];

      const searchTime = Date.now() - startTime;
      this.metrics.keywordSearchTime = searchTime;

      this.logger.info(`Keyword search completed in ${searchTime}ms, found ${results.length} results`);
      return results;
    } catch (error) {
      this.logger.error(`Failed to perform keyword search: ${query}`, error);
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
    this.ensureInitialized();

    try {
      const startTime = Date.now();
      const results: Record<ModalityType, SearchResult[]> = {} as Record<ModalityType, SearchResult[]>;

      // Search each modality in parallel
      const searchPromises = modalities.map(async modality => {
        const modalityResults = await this.vectorSearch(query, {
          ...options,
          modality,
          topK: options.topK || this.config.defaultTopK,
          similarityThreshold: options.similarityThreshold || this.config.defaultSimilarityThreshold,
        });
        return { modality, results: modalityResults };
      });

      const searchResults = await Promise.all(searchPromises);

      // Organize results by modality
      searchResults.forEach(({ modality, results: modalityResults }) => {
        results[modality] = modalityResults;
      });

      const searchTime = Date.now() - startTime;
      this.logger.info(`Multimodal search completed in ${searchTime}ms across ${modalities.length} modalities`);

      return results;
    } catch (error) {
      this.logger.error(`Failed to perform multimodal search: ${query}`, error);
      throw new RepositoryError(`Failed to perform multimodal search: ${query}`, "MULTIMODAL_SEARCH_ERROR", error);
    }
  }

  /**
   * Find similar files based on a reference file
   */
  async findSimilarFiles(fileId: string, modality: ModalityType, options: SearchOptions = {}): Promise<SearchResult[]> {
    this.ensureInitialized();

    try {
      const startTime = Date.now();

      // Get the embedding for the reference file
      const referenceEmbedding = await this.embeddingService.getEmbedding(fileId, modality);
      if (!referenceEmbedding) {
        throw new Error(`No embedding found for file ${fileId}`);
      }

      // Perform vector search using the reference embedding
      const results = await this.performVectorSearch(referenceEmbedding, {
        topK: options.topK || this.config.defaultTopK,
        similarityThreshold: options.similarityThreshold || this.config.defaultSimilarityThreshold,
        modality,
        includeMetadata: options.includeMetadata ?? true,
        rerank: options.rerank ?? false,
      });

      const searchTime = Date.now() - startTime;
      this.logger.info(`Similar files search completed in ${searchTime}ms, found ${results.length} results`);

      return results;
    } catch (error) {
      this.logger.error(`Failed to find similar files for ${fileId}:`, error);
      throw new RepositoryError(`Failed to find similar files: ${fileId}`, "SIMILAR_FILES_SEARCH_ERROR", error);
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    this.ensureInitialized();

    try {
      // This would typically query a suggestion index
      // For now, return a mock implementation
      const suggestions: string[] = [];

      this.logger.info(`Generated ${suggestions.length} search suggestions for query: ${query}`);
      return suggestions;
    } catch (error) {
      this.logger.error(`Failed to get search suggestions for: ${query}`, error);
      throw new RepositoryError(`Failed to get search suggestions: ${query}`, "SEARCH_SUGGESTIONS_ERROR", error);
    }
  }

  /**
   * Get search analytics and metrics
   */
  getSearchMetrics(): SearchMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear search cache
   */
  clearSearchCache(): void {
    this.searchCache.clear();
    this.logger.info("Search cache cleared");
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Generate query embedding
   */
  private async generateQueryEmbedding(query: string, modality?: ModalityType): Promise<VectorEmbedding> {
    try {
      const embeddingResult = await this.embeddingService.generateEmbedding({
        fileId: `query:${Date.now()}`,
        modality: modality || "text",
        content: query,
      });

      return embeddingResult.embedding;
    } catch (error) {
      this.logger.error("Failed to generate query embedding:", error);
      throw error;
    }
  }

  /**
   * Perform vector search using embedding
   */
  private async performVectorSearch(embedding: VectorEmbedding, options: VectorSearchOptions): Promise<SearchResult[]> {
    try {
      // This would typically query a vector database (e.g., pgvector, Pinecone, Weaviate)
      // For now, return a mock implementation
      const results: SearchResult[] = [];

      // Mock vector similarity search
      // In a real implementation, this would:
      // 1. Query the vector database with the embedding
      // 2. Apply similarity threshold filtering
      // 3. Return top K results with metadata

      this.logger.info(`Performed vector search with ${embedding.dimensions}D embedding`);
      return results;
    } catch (error) {
      this.logger.error("Failed to perform vector search:", error);
      throw error;
    }
  }

  /**
   * Apply search filters to results
   */
  private applySearchFilters(results: SearchResult[], options: VectorSearchOptions): SearchResult[] {
    // Apply any additional filters here
    // For now, just return the results as-is
    return results;
  }

  /**
   * Rerank search results
   */
  private async rerankResults(
    results: SearchResult[],
    query: string,
    options: VectorSearchOptions | HybridSearchOptions
  ): Promise<SearchResult[]> {
    try {
      // This would typically use a reranking model (e.g., Cross-Encoder)
      // For now, return results as-is
      this.logger.info(`Reranked ${results.length} results for query: ${query}`);
      return results;
    } catch (error) {
      this.logger.warn("Failed to rerank results, returning original order:", error);
      return results;
    }
  }

  /**
   * Combine vector and keyword search results
   */
  private combineSearchResults(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[],
    options: HybridSearchOptions
  ): SearchResult[] {
    const combinedMap = new Map<string, SearchResult>();

    // Add vector results with vector weight
    vectorResults.forEach(result => {
      const weightedScore = result.score * options.vectorWeight;
      combinedMap.set(result.fileId, {
        ...result,
        score: weightedScore,
        searchType: "hybrid",
      });
    });

    // Add keyword results with keyword weight
    keywordResults.forEach(result => {
      const existing = combinedMap.get(result.fileId);
      if (existing) {
        // Combine scores
        existing.score += result.score * options.keywordWeight;
        existing.searchType = "hybrid";
      } else {
        // Add new result
        combinedMap.set(result.fileId, {
          ...result,
          score: result.score * options.keywordWeight,
          searchType: "hybrid",
        });
      }
    });

    // Convert back to array and sort by combined score
    const combinedResults = Array.from(combinedMap.values()).sort((a, b) => b.score - a.score);

    return combinedResults.slice(0, options.topK);
  }

  /**
   * Generate cache key for search
   */
  private generateSearchCacheKey(query: string, options: VectorSearchOptions): string {
    const optionsStr = JSON.stringify({
      topK: options.topK,
      similarityThreshold: options.similarityThreshold,
      modality: options.modality,
      includeMetadata: options.includeMetadata,
      rerank: options.rerank,
    });
    return `vector:${this.hashString(query)}:${this.hashString(optionsStr)}`;
  }

  /**
   * Generate cache key for hybrid search
   */
  private generateHybridSearchCacheKey(query: string, options: HybridSearchOptions): string {
    const optionsStr = JSON.stringify({
      topK: options.topK,
      similarityThreshold: options.similarityThreshold,
      modality: options.modality,
      includeMetadata: options.includeMetadata,
      rerank: options.rerank,
      keywordWeight: options.keywordWeight,
      vectorWeight: options.vectorWeight,
      enableReranking: options.enableReranking,
    });
    return `hybrid:${this.hashString(query)}:${this.hashString(optionsStr)}`;
  }

  /**
   * Hash string for cache key
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
   * Cache search results
   */
  private cacheSearchResults(key: string, results: SearchResult[]): void {
    // Implement LRU cache if needed
    if (this.searchCache.size >= this.config.cacheSize) {
      // Remove oldest entry (simple implementation)
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }

    this.searchCache.set(key, results);
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new RepositoryError(
        "SearchService not initialized. Call initialize() first.",
        "SEARCH_SERVICE_NOT_INITIALIZED"
      );
    }
  }
}
