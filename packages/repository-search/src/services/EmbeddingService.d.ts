/**
 * Embedding Service
 *
 * Comprehensive embedding generation service for multimodal content.
 * Supports text, image, audio, and data embeddings with vector storage and indexing.
 */
import type { ModalityType, SearchOptions, VectorEmbedding } from "../types";
export interface EmbeddingConfig {
    textModel: string;
    imageModel: string;
    audioModel?: string;
    dataModel?: string;
    dimensions: number;
    batchSize: number;
    qualityThreshold: number;
    enableCaching: boolean;
    cacheSize: number;
}
export interface EmbeddingRequest {
    fileId: string;
    modality: ModalityType;
    content: any;
    options?: EmbeddingOptions;
}
export interface EmbeddingOptions {
    model?: string;
    dimensions?: number;
    qualityThreshold?: number;
    forceRegenerate?: boolean;
    metadata?: Record<string, any>;
}
export interface EmbeddingResult {
    embedding: VectorEmbedding;
    processingTime: number;
    quality: number;
    cached: boolean;
}
export interface BatchEmbeddingRequest {
    requests: EmbeddingRequest[];
    options?: {
        batchSize?: number;
        parallel?: boolean;
        progressCallback?: (completed: number, total: number) => void;
    };
}
export interface BatchEmbeddingResult {
    results: EmbeddingResult[];
    errors: Array<{
        request: EmbeddingRequest;
        error: string;
    }>;
    totalTime: number;
    successRate: number;
}
export declare class EmbeddingService extends BaseAIService {
    private initialized;
    private embeddingModels;
    private embeddingCache;
    private config;
    constructor(config?: Partial<EmbeddingConfig>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<any>;
    /**
     * Generate embedding for a single file
     */
    generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResult>;
    /**
     * Generate embeddings for multiple files in batch
     */
    generateBatchEmbeddings(request: BatchEmbeddingRequest): Promise<BatchEmbeddingResult>;
    /**
     * Find similar files using vector similarity
     */
    findSimilarFiles(fileId: string, modality: ModalityType, options?: SearchOptions): Promise<Array<{
        fileId: string;
        similarity: number;
        embedding: VectorEmbedding;
    }>>;
    /**
     * Get embedding for a file (from cache or database)
     */
    getEmbedding(fileId: string, modality: ModalityType): Promise<VectorEmbedding | null>;
    /**
     * Delete embedding for a file
     */
    deleteEmbedding(fileId: string, modality: ModalityType): Promise<void>;
    /**
     * Initialize embedding models
     */
    private initializeModels;
    /**
     * Initialize text embedding model
     */
    private initializeTextModel;
    /**
     * Initialize image embedding model
     */
    private initializeImageModel;
    /**
     * Initialize audio embedding model
     */
    private initializeAudioModel;
    /**
     * Initialize data embedding model
     */
    private initializeDataModel;
    /**
     * Generate embedding based on modality
     */
    private generateModalityEmbedding;
    /**
     * Generate text embedding
     */
    private generateTextEmbedding;
    /**
     * Generate image embedding
     */
    private generateImageEmbedding;
    /**
     * Generate audio embedding
     */
    private generateAudioEmbedding;
    /**
     * Generate data embedding
     */
    private generateDataEmbedding;
    /**
     * Calculate embedding quality score
     */
    private calculateEmbeddingQuality;
    /**
     * Generate cache key for embedding request
     */
    private generateCacheKey;
    /**
     * Hash content for cache key
     */
    private hashContent;
    /**
     * Cache embedding
     */
    private cacheEmbedding;
    /**
     * Generate unique embedding ID
     */
    private generateEmbeddingId;
    /**
     * Get model for modality
     */
    private getModelForModality;
    /**
     * Get dimensions for modality
     */
    private getDimensionsForModality;
    /**
     * Get model version
     */
    private getModelVersion;
    /**
     * Ensure service is initialized
     */
    private ensureInitialized;
}
