/**
 * Embedding Visualization Composable
 *
 * Provides reactive state management and API integration for embedding visualization.
 * Ported from Yipyap's useEmbeddingReduction with Reynard integration.
 */
export interface EmbeddingReductionRequest {
    method: "pca" | "tsne" | "umap";
    filters?: {
        min_score?: number;
        max_score?: number;
        start_date?: string;
        end_date?: string;
        model_id?: string;
        variant?: string;
        metadata_filters?: Record<string, unknown>;
    };
    parameters?: Record<string, unknown>;
    max_samples?: number;
    random_seed?: number;
    use_cache?: boolean;
    cache_ttl_seconds?: number;
}
export interface EmbeddingReductionResponse {
    success: boolean;
    method: string;
    transformed_data: number[][];
    original_indices: number[];
    parameters: Record<string, unknown>;
    metadata: Record<string, unknown>;
    error?: string;
    processing_time_ms: number;
    job_id?: string;
    cached: boolean;
    original_embeddings?: Array<{
        id: string;
        image_path?: string;
        text_content?: string;
        metadata?: Record<string, unknown>;
        [key: string]: unknown;
    }>;
}
export interface EmbeddingStats {
    total_embeddings: number;
    embedding_dimension: number;
    mean_values: number[];
    std_values: number[];
    min_values: number[];
    max_values: number[];
    quality_score: number;
    last_updated: string;
}
export interface EmbeddingQualityMetrics {
    overall_score: number;
    coherence_score: number;
    separation_score: number;
    density_score: number;
    distribution_score: number;
    recommendations: string[];
    issues: string[];
}
export interface CacheStats {
    total_entries: number;
    total_size_bytes: number;
    default_ttl_seconds: number;
    cache_hit_rate: number;
    oldest_entry?: string;
    newest_entry?: string;
}
export interface AvailableMethods {
    methods: Record<string, {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    }>;
}
export declare function useEmbeddingVisualization(): {
    stats: import("solid-js").Resource<EmbeddingStats>;
    availableMethods: import("solid-js").Resource<AvailableMethods>;
    cacheStats: import("solid-js").Resource<CacheStats>;
    reductionResult: import("solid-js").Resource<EmbeddingReductionResponse>;
    currentJobId: import("solid-js").Accessor<string | null>;
    performReduction: (request: EmbeddingReductionRequest) => Promise<EmbeddingReductionResponse | undefined>;
    analyzeQuality: (embeddings: number[][]) => Promise<EmbeddingQualityMetrics>;
    clearCache: () => Promise<any>;
    getHealthStatus: () => Promise<any>;
    connectProgressWebSocket: (onProgress: (data: any) => void) => WebSocket;
    refetchCacheStats: (info?: unknown) => CacheStats | Promise<CacheStats | undefined> | null | undefined;
    refetchReduction: (info?: unknown) => EmbeddingReductionResponse | Promise<EmbeddingReductionResponse | undefined> | null | undefined;
    generateSampleEmbeddings: (count: number, dimensions?: number) => number[][];
    processDistributionData: (embeddings: number[][]) => {
        values: number[];
        statistics: {
            min: number;
            q1: number;
            median: number;
            q3: number;
            max: number;
            mean: number;
            std: number;
        };
    };
    processPCAVarianceData: (embeddings: number[][]) => {
        explained_variance_ratio: number[];
        cumulative_variance: number[];
        recommendations: {
            optimal_components: number;
            variance_threshold: number;
            reasoning: string;
        };
    };
    processQualityMetricsData: (embeddings: number[][]) => {
        overall_score: number;
        metrics: {
            name: string;
            value: number;
            unit: string;
            higherIsBetter: boolean;
            goodThreshold: number;
            warningThreshold: number;
        }[];
        assessment: {
            status: string;
            issues: string[];
            recommendations: string[];
        };
    };
};
