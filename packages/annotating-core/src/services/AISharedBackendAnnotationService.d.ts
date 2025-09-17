/**
 * AI-Shared Backend Annotation Service
 *
 * This service extends BaseAIService from reynard-ai-shared to provide
 * lifecycle management, health monitoring, and service coordination for
 * the backend annotation system.
 */
import { ServiceConfig, ServiceHealthInfo } from "reynard-ai-shared";
import { BackendAnnotationService, BackendAnnotationServiceConfig } from "./BackendAnnotationService.js";
import { CaptionTask, CaptionResult, AnnotationProgress } from "../types/index.js";
export interface AISharedBackendAnnotationServiceConfig extends ServiceConfig, BackendAnnotationServiceConfig {
}
/**
 * Backend annotation service that integrates with ai-shared lifecycle management
 */
export declare class AISharedBackendAnnotationService extends BaseAIService {
    private backendService;
    private isBackendConnected;
    private lastBackendError?;
    constructor(config: AISharedBackendAnnotationServiceConfig);
    /**
     * Initialize the backend annotation service
     */
    initialize(): Promise<void>;
    /**
     * Perform health check on the backend annotation service
     */
    healthCheck(): Promise<ServiceHealthInfo>;
    /**
     * Shutdown the backend annotation service
     */
    shutdown(): Promise<void>;
    /**
     * Generate a caption using the backend service
     */
    generateCaption(task: CaptionTask): Promise<CaptionResult>;
    /**
     * Generate batch captions using the backend service
     */
    generateBatchCaptions(tasks: CaptionTask[], progressCallback?: (progress: AnnotationProgress) => void): Promise<CaptionResult[]>;
    /**
     * Get available caption generators
     */
    getAvailableGenerators(): Promise<any[]>;
    /**
     * Get a specific generator
     */
    getGenerator(name: string): any;
    /**
     * Check if a generator is available
     */
    isGeneratorAvailable(name: string): boolean;
    /**
     * Preload a model
     */
    preloadModel(name: string): Promise<void>;
    /**
     * Unload a model
     */
    unloadModel(name: string): Promise<void>;
    /**
     * Get model usage statistics
     */
    getModelUsageStats(name: string): any;
    /**
     * Get health status
     */
    getHealthStatus(): any;
    /**
     * Get the underlying backend service
     */
    getBackendService(): BackendAnnotationService;
    /**
     * Check if backend is connected
     */
    get isConnected(): boolean;
    /**
     * Get last backend error
     */
    get lastError(): string | undefined;
}
