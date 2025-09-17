/**
 * Backend Annotation Manager
 *
 * Simplified manager that interfaces with the FastAPI backend.
 * This replaces the complex local model management with clean HTTP API calls.
 */
import { type ModelManagerConfig, type AnyAnnotationEvent } from "reynard-annotating-core";
import type { BackendAnnotationManagerConfig } from "./config";
export declare class BackendAnnotationManager {
    private coreManager;
    private isInitialized;
    private eventListeners;
    constructor(config: BackendAnnotationManagerConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getService(): any;
    getAvailableGenerators(): Promise<any>;
    isGeneratorAvailable(name: string): any;
    preloadModel(name: string): Promise<any>;
    unloadModel(name: string): Promise<any>;
    getModelUsageStats(name: string): any;
    getHealthStatus(): any;
    getConfiguration(): any;
    updateConfiguration(config: Partial<ModelManagerConfig>): any;
    getSystemStatistics(): any;
    addEventListener(listener: (event: AnyAnnotationEvent) => void): void;
    removeEventListener(listener: (event: AnyAnnotationEvent) => void): void;
    private emitEvent;
    generateFurryTags(imagePath: string, config?: Record<string, unknown>): Promise<CaptionResult>;
    generateDetailedCaption(imagePath: string, config?: Record<string, unknown>): Promise<CaptionResult>;
    generateAnimeTags(imagePath: string, config?: Record<string, unknown>): Promise<CaptionResult>;
    generateGeneralCaption(imagePath: string, config?: Record<string, unknown>): Promise<CaptionResult>;
}
/**
 * Create a backend annotation manager
 */
export declare function createAnnotationManager(config: BackendAnnotationManagerConfig): BackendAnnotationManager;
