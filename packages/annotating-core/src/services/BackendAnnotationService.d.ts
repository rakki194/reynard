/**
 * Backend Annotation Service
 *
 * This service interfaces with the FastAPI backend instead of implementing
 * local model loading and generation logic.
 */
import { CaptionTask, CaptionResult, CaptionGenerator, AnnotationProgress, AnnotationService as IAnnotationService, ModelUsageStats, HealthStatus, AnyAnnotationEvent } from "../types/index.js";
export interface BackendAnnotationServiceConfig {
    baseUrl: string;
    timeout?: number;
    retries?: number;
    apiKey?: string;
}
export declare class BackendAnnotationService implements IAnnotationService {
    private client;
    private eventManager;
    private singleProcessor;
    private batchProcessor;
    private generatorManager;
    private healthStatsManager;
    constructor(config: BackendAnnotationServiceConfig);
    generateCaption(task: CaptionTask): Promise<CaptionResult>;
    generateBatchCaptions(tasks: CaptionTask[], progressCallback?: (progress: AnnotationProgress) => void): Promise<CaptionResult[]>;
    getAvailableGenerators(): Promise<CaptionGenerator[]>;
    getGenerator(name: string): CaptionGenerator | undefined;
    isGeneratorAvailable(name: string): boolean;
    preloadModel(name: string): Promise<void>;
    unloadModel(name: string): Promise<void>;
    getModelUsageStats(name: string): ModelUsageStats | null;
    getHealthStatus(): HealthStatus;
    addEventListener(listener: (event: AnyAnnotationEvent) => void): void;
    removeEventListener(listener: (event: AnyAnnotationEvent) => void): void;
    getTotalProcessed(): number;
    getTotalProcessingTime(): number;
    getAverageProcessingTime(): number;
    getActiveTasksCount(): number;
}
/**
 * Create a backend annotation service
 */
export declare function createBackendAnnotationService(config: BackendAnnotationServiceConfig): BackendAnnotationService;
