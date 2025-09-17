/**
 * Configuration Types
 *
 * Defines types for global AI configuration, service configuration,
 * and system settings within the Reynard framework.
 */
import type { ModelType } from "./model-management";
export interface GlobalAIConfig {
    defaultModels: Record<ModelType, string>;
    gpuAcceleration: boolean;
    maxConcurrentModels: number;
    defaultBatchSize: number;
    cacheEnabled: boolean;
    cacheSize: number;
    logLevel: "debug" | "info" | "warn" | "error";
    performanceMonitoring: boolean;
    autoCleanup: boolean;
    cleanupInterval: number;
}
export interface ServiceConfig {
    name: string;
    dependencies?: string[];
    requiredPackages?: string[];
    startupPriority?: number;
    healthCheckInterval?: number;
    autoStart?: boolean;
    config?: Record<string, any>;
}
