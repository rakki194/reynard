/**
 * Search Service - Advanced search service for vector similarity, hybrid search, and multimodal content discovery.
 */
import { BaseAIService, ServiceStatus, ServiceHealth } from "reynard-ai-shared";
import { RepositoryError } from "../types";
import { EmbeddingService } from "./EmbeddingService";
import { SearchCache } from "./composables/SearchCache";
import { SearchMetricsTracker } from "./composables/SearchMetrics";
import { VectorSearchComposable } from "./composables/VectorSearch";
import { HybridSearchComposable } from "./composables/HybridSearch";
import { SearchOperations } from "./SearchOperations";
export class SearchService extends BaseAIService {
    constructor() {
        const searchConfig = {
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
        Object.defineProperty(this, "embeddingService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "searchCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "vectorSearchComposable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hybridSearchComposable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "searchOperations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "searchConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.searchConfig = searchConfig;
    }
    async initialize() {
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
            this.searchOperations = new SearchOperations(this.searchCache, this.metrics, this.vectorSearchComposable, this.hybridSearchComposable, this.embeddingService, this.searchConfig);
            // Service is now initialized (handled by BaseAIService)
            console.log("SearchService initialized successfully");
        }
        catch (error) {
            console.error("Failed to initialize SearchService:", error);
            throw new RepositoryError("Failed to initialize SearchService", "SEARCH_SERVICE_INIT_ERROR", error);
        }
    }
    async shutdown() {
        if (this.embeddingService) {
            await this.embeddingService.shutdown();
        }
        if (this.searchCache) {
            this.searchCache.clear();
        }
        console.log("SearchService shutdown complete");
    }
    async healthCheck() {
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
    async vectorSearch(query, options = {}) {
        if (!this.isInitialized)
            throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
        return this.searchOperations.vectorSearch(query, options);
    }
    async hybridSearch(query, options = {}) {
        if (!this.isInitialized)
            throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
        return this.searchOperations.hybridSearch(query, options);
    }
    async keywordSearch(query, options = {}) {
        if (!this.isInitialized)
            throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
        return this.searchOperations.keywordSearch(query, options);
    }
    async multimodalSearch(query, modalities, options = {}) {
        if (!this.isInitialized)
            throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
        return this.searchOperations.multimodalSearch(query, modalities, options);
    }
    async findSimilarFiles(fileId, modality, options = {}) {
        if (!this.isInitialized)
            throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
        return this.searchOperations.findSimilarFiles(fileId, modality, options);
    }
    async getSearchSuggestions(query, limit = 10) {
        if (!this.isInitialized)
            throw new RepositoryError("SearchService not initialized", "SEARCH_SERVICE_NOT_INITIALIZED");
        return this.searchOperations.getSearchSuggestions(query, limit);
    }
    getSearchMetrics() {
        return this.searchOperations.getSearchMetrics();
    }
    clearSearchCache() {
        this.searchOperations.clearSearchCache();
    }
}
