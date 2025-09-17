/**
 * Backend Annotation Manager
 *
 * Simplified manager that interfaces with the FastAPI backend instead of
 * implementing complex local model management.
 */
import { AnnotationManager as IAnnotationManager, AnnotationService, CaptionGenerator, ModelManagerConfig, ModelUsageStats, HealthStatus, AnyAnnotationEvent } from "../types/index.js";
import { BackendAnnotationServiceConfig } from "./BackendAnnotationService.js";
export type BackendAnnotationManagerConfig = BackendAnnotationServiceConfig;
export declare class BackendAnnotationManager implements IAnnotationManager {
    private annotationService;
    private eventSystem;
    private isStarted;
    constructor(config: BackendAnnotationManagerConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    getService(): AnnotationService;
    getAvailableGenerators(): Promise<CaptionGenerator[]>;
    isGeneratorAvailable(name: string): boolean;
    preloadModel(name: string): Promise<void>;
    unloadModel(name: string): Promise<void>;
    getModelUsageStats(name: string): ModelUsageStats | null;
    getHealthStatus(): HealthStatus;
    getConfiguration(): ModelManagerConfig;
    updateConfiguration(_config: Partial<ModelManagerConfig>): void;
    addEventListener(listener: (event: AnyAnnotationEvent) => void): void;
    removeEventListener(listener: (event: AnyAnnotationEvent) => void): void;
    registerGenerator(_generator: CaptionGenerator): Promise<void>;
    getModelManager(): unknown;
    getSystemStatistics(): {
        totalProcessed: number;
        totalProcessingTime: number;
        averageProcessingTime: number;
        activeTasks: number;
        loadedModels: number;
        availableGenerators: number;
        usageStats: {};
        healthStatus: HealthStatus;
        queueStatus: {};
    };
}
/**
 * Create a backend annotation manager
 */
export declare function createBackendAnnotationManager(config: BackendAnnotationManagerConfig): BackendAnnotationManager;
