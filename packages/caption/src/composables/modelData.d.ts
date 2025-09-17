/**
 * Model Data Utilities
 *
 * Utility functions for managing model information and system statistics.
 * Extracted to keep composables under the 140-line limit.
 */
export interface ModelInfo {
    name: string;
    displayName: string;
    description: string;
    isLoaded: boolean;
    isLoading: boolean;
    error?: string;
    healthStatus?: "healthy" | "unhealthy" | "unknown";
    usageStats?: {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageResponseTime: number;
    };
}
/**
 * Creates the default model information array
 */
export declare const createDefaultModels: (loadedModels: string[]) => ModelInfo[];
/**
 * Extracts loaded models from system statistics
 */
export declare const extractLoadedModels: (systemStats: any) => string[];
/**
 * Creates model status mapping from loaded models
 */
export declare const createModelStatusMap: (loadedModels: string[]) => Record<string, boolean>;
