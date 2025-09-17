/**
 * Caption API Client for Reynard Annotating
 *
 * Specialized API client for caption generation operations that extends
 * the generic ApiClient from the core package.
 */
import { ApiClient, type HealthStatus } from "reynard-core";
import { CaptionApiClientConfig, CaptionRequest, BatchCaptionRequest, GeneratorInfo, CaptionResponse, SystemStats, ModelUsageStats } from "./caption-types.js";
export declare class CaptionApiClient extends ApiClient {
    constructor(config: CaptionApiClientConfig);
    /**
     * Generate a single caption
     */
    generateCaption(request: CaptionRequest): Promise<CaptionResponse>;
    /**
     * Generate captions for multiple images
     */
    generateBatchCaptions(request: BatchCaptionRequest): Promise<CaptionResponse[]>;
    /**
     * Get available caption generators
     */
    getAvailableGenerators(): Promise<Record<string, GeneratorInfo>>;
    /**
     * Get information about a specific generator
     */
    getGeneratorInfo(generatorName: string): Promise<GeneratorInfo>;
    /**
     * Load a specific model
     */
    loadModel(generatorName: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Unload a specific model
     */
    unloadModel(generatorName: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get list of loaded models
     */
    getLoadedModels(): Promise<string[]>;
    /**
     * Get system statistics
     */
    getSystemStats(): Promise<SystemStats>;
    /**
     * Get system health status
     */
    getHealthStatus(): Promise<HealthStatus>;
    /**
     * Get usage statistics for a specific model
     */
    getModelStats(generatorName: string): Promise<ModelUsageStats>;
    /**
     * Get request queue status
     */
    getQueueStatus(): Promise<any>;
    /**
     * Upload an image file for caption generation
     */
    uploadImage(file: File, generatorName: string, config?: Record<string, any>): Promise<CaptionResponse>;
    /**
     * Override health check to use caption-specific endpoint
     */
    checkHealth(): Promise<HealthStatus>;
}
