/**
 * Search Service
 *
 * Advanced search service providing vector similarity search, hybrid search,
 * and multimodal content discovery across the unified repository.
 */
import type { ModalityType, SearchOptions, SearchResult } from "../types";
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
    dateRange?: {
        from: Date;
        to: Date;
    };
    sizeRange?: {
        min: number;
        max: number;
    };
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
export declare class SearchService extends BaseAIService {
    private embeddingService;
    private initialized;
    private searchCache;
    private metrics;
    constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<any>;
    /**
     * Perform vector similarity search
     */
    vectorSearch(query: string, options?: VectorSearchOptions): Promise<SearchResult[]>;
    /**
     * Perform hybrid search combining vector and keyword search
     */
    hybridSearch(query: string, options?: HybridSearchOptions): Promise<SearchResult[]>;
    /**
     * Perform keyword search
     */
    keywordSearch(query: string, options?: SearchOptions): Promise<SearchResult[]>;
    /**
     * Search across multiple modalities
     */
    multimodalSearch(query: string, modalities: ModalityType[], options?: SearchOptions): Promise<Record<ModalityType, SearchResult[]>>;
    /**
     * Find similar files based on a reference file
     */
    findSimilarFiles(fileId: string, modality: ModalityType, options?: SearchOptions): Promise<SearchResult[]>;
    /**
     * Get search suggestions based on query
     */
    getSearchSuggestions(query: string, limit?: number): Promise<string[]>;
    /**
     * Get search analytics and metrics
     */
    getSearchMetrics(): SearchMetrics;
    /**
     * Clear search cache
     */
    clearSearchCache(): void;
    /**
     * Generate query embedding
     */
    private generateQueryEmbedding;
    /**
     * Perform vector search using embedding
     */
    private performVectorSearch;
    /**
     * Apply search filters to results
     */
    private applySearchFilters;
    /**
     * Rerank search results
     */
    private rerankResults;
    /**
     * Combine vector and keyword search results
     */
    private combineSearchResults;
    /**
     * Generate cache key for search
     */
    private generateSearchCacheKey;
    /**
     * Generate cache key for hybrid search
     */
    private generateHybridSearchCacheKey;
    /**
     * Hash string for cache key
     */
    private hashString;
    /**
     * Cache search results
     */
    private cacheSearchResults;
    /**
     * Ensure service is initialized
     */
    private ensureInitialized;
}
