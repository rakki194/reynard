/**
 * Search Service - Advanced search service for vector similarity, hybrid search, and multimodal content discovery.
 */

import { BaseAIService, ServiceStatus, ServiceHealth } from "reynard-ai-shared";
import type { ServiceHealthInfo } from "reynard-ai-shared";
import type { ModalityType, SearchOptions, SearchResult } from "../types";
import { RepositoryError } from "../types";
import { EmbeddingService } from "./EmbeddingService";
import { SearchCache } from "./composables/SearchCache";
import { SearchMetricsTracker } from "./composables/SearchMetrics";
import { VectorSearchComposable } from "./composables/VectorSearch";
import { HybridSearchComposable } from "./composables/HybridSearch";
import { SearchOperations } from "./SearchOperations";
import type { VectorSearchOptions, HybridSearchOptions, SearchMetrics, SearchConfig } from "./types/SearchTypes";

export class SearchService extends BaseAIService {
  private embeddingService!: EmbeddingService;
  private searchCache!: SearchCache;
  private metrics!: SearchMetricsTracker;
  private vectorSearchComposable!: VectorSearchComposable;
  private hybridSearchComposable!: HybridSearchComposable;
  private searchOperations!: SearchOperations;
  private searchConfig: SearchConfig;

  constructor() {
    const searchConfig: SearchConfig = {
      maxResults: 1000,
      defaultTopK: 20,
      defaultSimilarityThreshold: 0.7,
      enableCaching: true,
      cacheSize: 500,
      enableReranking: true,
      hybridSearchEnabled: true,
      vectorWeight: 0.7,
      keywordWeight: 0.3,
    };

    super({
      name: "search-service",
      dependencies: ["embedding-service"],
      startupPriority: 90,
      requiredPackages: ["reynard-rag"],
      autoStart: true,
      config: searchConfig,
    });
    this.searchConfig = searchConfig;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize embedding service
      this.embeddingService = new EmbeddingService();
      await this.embeddingService.initialize();

      // Initialize composables
      this.searchCache = new SearchCache(this.searchConfig.cacheSize);
      this.metrics = new SearchMetricsTracker();
      this.vectorSearchComposable = new VectorSearchComposable(this.embeddingService);
      this.hybridSearchComposable = new HybridSearchComposable(this.vectorSearchComposable);
      this.searchOperations = new SearchOperations(
        this.searchCache,
        this.metrics,
        this.vectorSearchComposable,
        this.hybridSearchComposable,
        this.embeddingService,
        this.searchConfig
      );

      // Service is now initialized (handled by BaseAIService)
      console.log("SearchService initialized successfully");
    } catch (error) {
      console.error("Failed to initialize SearchService:", error);
      throw new RepositoryError("Failed to initialize SearchService", "SEARCH_SERVICE_INIT_ERROR", error);
    }
  }

  async shutdown(): Promise<void> {
    if (this.embeddingService) {
      await this.embeddingService.shutdown();
    }
    if (this.searchCache) {
      this.searchCache.clear();
    }
    console.log("SearchService shutdown complete");
  }

  async healthCheck(): Promise<ServiceHealthInfo> {
    const embeddingHealth = this.embeddingService ? await this.embeddingService.healthCheck() : null;
    const cacheStats = this.searchCache ? this.searchCache.getStats() : null;
    const metrics = this.metrics ? this.metrics.getMetrics() : null;

    return {
      status: this.isInitialized ? ServiceStatus.RUNNING : ServiceStatus.STOPPED,
      health: this.isInitialized ? ServiceHealth.HEALTHY : ServiceHealth.UNHEALTHY,
      lastCheck: new Date(),
      uptime: this.startupTime ? Date.now() - this.startupTime.getTime() : 0,
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: 0, // Would need to implement CPU monitoring
      errorCount: this.lastError ? 1 : 0,
      lastError: this.lastError,
      metadata: {
        embeddingService: embeddingHealth,
        cacheStats,
        metrics,
      },
    };
  }

  async vectorSearch(query: string, options: Partial<VectorSearchOptions> = {}): Promise<SearchResult[]> {
    if (!this.isInitialized) throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
    return this.searchOperations.vectorSearch(query, options);
  }
  async hybridSearch(query: string, options: Partial<HybridSearchOptions> = {}): Promise<SearchResult[]> {
    if (!this.isInitialized) throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
    return this.searchOperations.hybridSearch(query, options);
  }
  async keywordSearch(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!this.isInitialized) throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
    return this.searchOperations.keywordSearch(query, options);
  }
  async multimodalSearch(query: string, modalities: ModalityType[], options: SearchOptions = {}): Promise<Record<ModalityType, SearchResult[]>> {
    if (!this.isInitialized) throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
    return this.searchOperations.multimodalSearch(query, modalities, options);
  }
  async findSimilarFiles(fileId: string, modality: ModalityType, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!this.isInitialized) throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
    return this.searchOperations.findSimilarFiles(fileId, modality, options);
  }
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (!this.isInitialized) throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
    return this.searchOperations.getSearchSuggestions(query, limit);
  }
  getSearchMetrics(): SearchMetrics {
    return this.searchOperations.getSearchMetrics();
  }
  clearSearchCache(): void {
    this.searchOperations.clearSearchCache();
  }
}
