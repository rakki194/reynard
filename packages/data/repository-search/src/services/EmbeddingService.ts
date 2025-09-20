/**
 * Embedding Service
 *
 * Comprehensive embedding generation service for multimodal content.
 * Supports text, image, audio, and data embeddings with vector storage and indexing.
 */

import { BaseAIService } from "reynard-ai-shared";
import type { ModalityType, SearchOptions, VectorEmbedding } from "../types";
import { RepositoryError } from "../types";

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
  errors: Array<{ request: EmbeddingRequest; error: string }>;
  totalTime: number;
  successRate: number;
}

export class EmbeddingService extends BaseAIService {
  private initialized = false;
  private embeddingModels: Map<string, any> = new Map();
  private embeddingCache: Map<string, VectorEmbedding> = new Map();
  private config: EmbeddingConfig;

  constructor(config?: Partial<EmbeddingConfig>) {
    super({
      name: "embedding-service",
      dependencies: [],
      startupPriority: 80,
      requiredPackages: ["@xenova/transformers", "openai", "ollama"],
      autoStart: true,
      config: {
        textModel: "text-embedding-3-large",
        imageModel: "clip-vit-base-patch32",
        audioModel: "whisper-base",
        dataModel: "text-embedding-3-large",
        dimensions: 1536,
        batchSize: 10,
        qualityThreshold: 0.7,
        enableCaching: true,
        cacheSize: 1000,
        ...config,
      },
    });

    this.config = this.config as EmbeddingConfig;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize embedding models
      await this.initializeModels();

      this.initialized = true;
      this.logger.info("EmbeddingService initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize EmbeddingService:", error);
      throw new RepositoryError("Failed to initialize EmbeddingService", "EMBEDDING_SERVICE_INIT_ERROR", error);
    }
  }

  async shutdown(): Promise<void> {
    // Cleanup models and cache
    this.embeddingModels.clear();
    this.embeddingCache.clear();
    this.initialized = false;
    this.logger.info("EmbeddingService shutdown complete");
  }

  async healthCheck(): Promise<any> {
    return {
      status: this.initialized ? "healthy" : "unhealthy",
      modelsLoaded: this.embeddingModels.size,
      cacheSize: this.embeddingCache.size,
      lastCheck: new Date(),
    };
  }

  /**
   * Generate embedding for a single file
   */
  async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResult> {
    this.ensureInitialized();

    try {
      const startTime = Date.now();

      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      if (this.config.enableCaching && !request.options?.forceRegenerate) {
        const cached = this.embeddingCache.get(cacheKey);
        if (cached) {
          return {
            embedding: cached,
            processingTime: 0,
            quality: 1.0,
            cached: true,
          };
        }
      }

      // Generate embedding based on modality
      const embedding = await this.generateModalityEmbedding(request);

      // Calculate quality score
      const quality = this.calculateEmbeddingQuality(embedding);

      // Cache the result
      if (this.config.enableCaching && quality >= this.config.qualityThreshold) {
        this.cacheEmbedding(cacheKey, embedding);
      }

      const processingTime = Date.now() - startTime;

      return {
        embedding,
        processingTime,
        quality,
        cached: false,
      };
    } catch (error) {
      this.logger.error(`Failed to generate embedding for ${request.fileId}:`, error);
      throw new RepositoryError(`Failed to generate embedding: ${request.fileId}`, "EMBEDDING_GENERATION_ERROR", error);
    }
  }

  /**
   * Generate embeddings for multiple files in batch
   */
  async generateBatchEmbeddings(request: BatchEmbeddingRequest): Promise<BatchEmbeddingResult> {
    this.ensureInitialized();

    const startTime = Date.now();
    const results: EmbeddingResult[] = [];
    const errors: Array<{ request: EmbeddingRequest; error: string }> = [];

    const batchSize = request.options?.batchSize || this.config.batchSize;
    const parallel = request.options?.parallel ?? true;

    try {
      if (parallel) {
        // Process in parallel batches
        for (let i = 0; i < request.requests.length; i += batchSize) {
          const batch = request.requests.slice(i, i + batchSize);
          const batchPromises = batch.map(async req => {
            try {
              return await this.generateEmbedding(req);
            } catch (error) {
              errors.push({
                request: req,
                error: error instanceof Error ? error.message : String(error),
              });
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          results.push(...(batchResults.filter(r => r !== null) as EmbeddingResult[]));

          // Progress callback
          if (request.options?.progressCallback) {
            request.options.progressCallback(results.length, request.requests.length);
          }
        }
      } else {
        // Process sequentially
        for (const req of request.requests) {
          try {
            const result = await this.generateEmbedding(req);
            results.push(result);
          } catch (error) {
            errors.push({
              request: req,
              error: error instanceof Error ? error.message : String(error),
            });
          }

          // Progress callback
          if (request.options?.progressCallback) {
            request.options.progressCallback(results.length, request.requests.length);
          }
        }
      }

      const totalTime = Date.now() - startTime;
      const successRate = results.length / request.requests.length;

      return {
        results,
        errors,
        totalTime,
        successRate,
      };
    } catch (error) {
      this.logger.error("Failed to generate batch embeddings:", error);
      throw new RepositoryError("Failed to generate batch embeddings", "BATCH_EMBEDDING_ERROR", error);
    }
  }

  /**
   * Find similar files using vector similarity
   */
  async findSimilarFiles(
    fileId: string,
    modality: ModalityType,
    options: SearchOptions = {}
  ): Promise<Array<{ fileId: string; similarity: number; embedding: VectorEmbedding }>> {
    this.ensureInitialized();

    try {
      // This would typically query the vector database
      // For now, return a mock implementation
      this.logger.warn("findSimilarFiles not yet implemented - requires database integration");
      return [];
    } catch (error) {
      this.logger.error(`Failed to find similar files for ${fileId}:`, error);
      throw new RepositoryError(`Failed to find similar files: ${fileId}`, "SIMILARITY_SEARCH_ERROR", error);
    }
  }

  /**
   * Get embedding for a file (from cache or database)
   */
  async getEmbedding(fileId: string, modality: ModalityType): Promise<VectorEmbedding | null> {
    this.ensureInitialized();

    try {
      // Check cache first
      const cacheKey = `${fileId}:${modality}`;
      const cached = this.embeddingCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // This would typically query the database
      // For now, return null
      this.logger.warn("getEmbedding not yet implemented - requires database integration");
      return null;
    } catch (error) {
      this.logger.error(`Failed to get embedding for ${fileId}:`, error);
      throw new RepositoryError(`Failed to get embedding: ${fileId}`, "EMBEDDING_RETRIEVAL_ERROR", error);
    }
  }

  /**
   * Delete embedding for a file
   */
  async deleteEmbedding(fileId: string, modality: ModalityType): Promise<void> {
    this.ensureInitialized();

    try {
      // Remove from cache
      const cacheKey = `${fileId}:${modality}`;
      this.embeddingCache.delete(cacheKey);

      // This would typically delete from database
      // For now, just log
      this.logger.info(`Deleted embedding for ${fileId}:${modality}`);
    } catch (error) {
      this.logger.error(`Failed to delete embedding for ${fileId}:`, error);
      throw new RepositoryError(`Failed to delete embedding: ${fileId}`, "EMBEDDING_DELETION_ERROR", error);
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Initialize embedding models
   */
  private async initializeModels(): Promise<void> {
    try {
      // Initialize text embedding model
      await this.initializeTextModel();

      // Initialize image embedding model
      await this.initializeImageModel();

      // Initialize audio embedding model if configured
      if (this.config.audioModel) {
        await this.initializeAudioModel();
      }

      // Initialize data embedding model if configured
      if (this.config.dataModel) {
        await this.initializeDataModel();
      }
    } catch (error) {
      this.logger.error("Failed to initialize embedding models:", error);
      throw error;
    }
  }

  /**
   * Initialize text embedding model
   */
  private async initializeTextModel(): Promise<void> {
    try {
      // Mock implementation - would use actual model loading
      this.embeddingModels.set("text", {
        name: this.config.textModel,
        dimensions: this.config.dimensions,
        loaded: true,
      });

      this.logger.info(`Text embedding model ${this.config.textModel} initialized`);
    } catch (error) {
      this.logger.error("Failed to initialize text model:", error);
      throw error;
    }
  }

  /**
   * Initialize image embedding model
   */
  private async initializeImageModel(): Promise<void> {
    try {
      // Mock implementation - would use actual model loading
      this.embeddingModels.set("image", {
        name: this.config.imageModel,
        dimensions: 768, // CLIP dimensions
        loaded: true,
      });

      this.logger.info(`Image embedding model ${this.config.imageModel} initialized`);
    } catch (error) {
      this.logger.error("Failed to initialize image model:", error);
      throw error;
    }
  }

  /**
   * Initialize audio embedding model
   */
  private async initializeAudioModel(): Promise<void> {
    try {
      // Mock implementation - would use actual model loading
      this.embeddingModels.set("audio", {
        name: this.config.audioModel,
        dimensions: 512, // Whisper dimensions
        loaded: true,
      });

      this.logger.info(`Audio embedding model ${this.config.audioModel} initialized`);
    } catch (error) {
      this.logger.error("Failed to initialize audio model:", error);
      throw error;
    }
  }

  /**
   * Initialize data embedding model
   */
  private async initializeDataModel(): Promise<void> {
    try {
      // Mock implementation - would use actual model loading
      this.embeddingModels.set("data", {
        name: this.config.dataModel,
        dimensions: this.config.dimensions,
        loaded: true,
      });

      this.logger.info(`Data embedding model ${this.config.dataModel} initialized`);
    } catch (error) {
      this.logger.error("Failed to initialize data model:", error);
      throw error;
    }
  }

  /**
   * Generate embedding based on modality
   */
  private async generateModalityEmbedding(request: EmbeddingRequest): Promise<VectorEmbedding> {
    const modelId = request.options?.model || this.getModelForModality(request.modality);
    const dimensions = request.options?.dimensions || this.getDimensionsForModality(request.modality);

    let vector: number[];

    switch (request.modality) {
      case "text":
        vector = await this.generateTextEmbedding(request.content, modelId);
        break;
      case "image":
        vector = await this.generateImageEmbedding(request.content, modelId);
        break;
      case "audio":
        vector = await this.generateAudioEmbedding(request.content, modelId);
        break;
      case "data":
        vector = await this.generateDataEmbedding(request.content, modelId);
        break;
      default:
        throw new Error(`Unsupported modality: ${request.modality}`);
    }

    return {
      id: this.generateEmbeddingId(request.fileId, request.modality),
      modelId,
      dimensions,
      vector,
      metadata: {
        modality: request.modality,
        modelVersion: this.getModelVersion(modelId),
        processingTime: 0, // Will be set by caller
        quality: 0, // Will be calculated by caller
        parameters: request.options?.metadata || {},
      },
      createdAt: new Date(),
    };
  }

  /**
   * Generate text embedding
   */
  private async generateTextEmbedding(text: string, modelId: string): Promise<number[]> {
    try {
      // Mock implementation - would use actual text embedding
      const dimensions = this.getDimensionsForModality("text");
      return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
    } catch (error) {
      this.logger.error("Failed to generate text embedding:", error);
      throw error;
    }
  }

  /**
   * Generate image embedding
   */
  private async generateImageEmbedding(imagePath: string, modelId: string): Promise<number[]> {
    try {
      // Mock implementation - would use actual image embedding
      const dimensions = this.getDimensionsForModality("image");
      return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
    } catch (error) {
      this.logger.error("Failed to generate image embedding:", error);
      throw error;
    }
  }

  /**
   * Generate audio embedding
   */
  private async generateAudioEmbedding(audioPath: string, modelId: string): Promise<number[]> {
    try {
      // Mock implementation - would use actual audio embedding
      const dimensions = this.getDimensionsForModality("audio");
      return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
    } catch (error) {
      this.logger.error("Failed to generate audio embedding:", error);
      throw error;
    }
  }

  /**
   * Generate data embedding
   */
  private async generateDataEmbedding(data: any, modelId: string): Promise<number[]> {
    try {
      // Mock implementation - would use actual data embedding
      const dimensions = this.getDimensionsForModality("data");
      return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
    } catch (error) {
      this.logger.error("Failed to generate data embedding:", error);
      throw error;
    }
  }

  /**
   * Calculate embedding quality score
   */
  private calculateEmbeddingQuality(embedding: VectorEmbedding): number {
    try {
      const vector = embedding.vector;

      // Check for zero vector
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      if (magnitude === 0) {
        return 0;
      }

      // Check for NaN or infinite values
      if (vector.some(val => !isFinite(val))) {
        return 0;
      }

      // Check for reasonable magnitude (not too small or too large)
      const normalizedMagnitude = magnitude / Math.sqrt(vector.length);
      if (normalizedMagnitude < 0.1 || normalizedMagnitude > 10) {
        return 0.5;
      }

      // Check for diversity (not all same values)
      const uniqueValues = new Set(vector.map(v => Math.round(v * 1000) / 1000));
      const diversity = uniqueValues.size / vector.length;

      return Math.min(1.0, diversity * 2); // Scale diversity to 0-1
    } catch (error) {
      this.logger.warn("Failed to calculate embedding quality:", error);
      return 0;
    }
  }

  /**
   * Generate cache key for embedding request
   */
  private generateCacheKey(request: EmbeddingRequest): string {
    const contentHash = this.hashContent(request.content);
    return `${request.fileId}:${request.modality}:${contentHash}`;
  }

  /**
   * Hash content for cache key
   */
  private hashContent(content: any): string {
    // Simple hash implementation
    const str = JSON.stringify(content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Cache embedding
   */
  private cacheEmbedding(key: string, embedding: VectorEmbedding): void {
    // Implement LRU cache if needed
    if (this.embeddingCache.size >= this.config.cacheSize) {
      // Remove oldest entry (simple implementation)
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
    }

    this.embeddingCache.set(key, embedding);
  }

  /**
   * Generate unique embedding ID
   */
  private generateEmbeddingId(fileId: string, modality: ModalityType): string {
    return `${fileId}:${modality}:${Date.now()}`;
  }

  /**
   * Get model for modality
   */
  private getModelForModality(modality: ModalityType): string {
    switch (modality) {
      case "text":
        return this.config.textModel;
      case "image":
        return this.config.imageModel;
      case "audio":
        return this.config.audioModel || this.config.textModel;
      case "data":
        return this.config.dataModel || this.config.textModel;
      default:
        return this.config.textModel;
    }
  }

  /**
   * Get dimensions for modality
   */
  private getDimensionsForModality(modality: ModalityType): number {
    switch (modality) {
      case "text":
        return this.config.dimensions;
      case "image":
        return 768; // CLIP dimensions
      case "audio":
        return 512; // Whisper dimensions
      case "data":
        return this.config.dimensions;
      default:
        return this.config.dimensions;
    }
  }

  /**
   * Get model version
   */
  private getModelVersion(modelId: string): string {
    // Mock implementation - would get actual version
    return "1.0.0";
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new RepositoryError(
        "EmbeddingService not initialized. Call initialize() first.",
        "EMBEDDING_SERVICE_NOT_INITIALIZED"
      );
    }
  }
}
