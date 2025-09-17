/**
 * Model Initialization Utilities
 *
 * Utility functions for initializing the model manager and setting up event listeners.
 * Extracted to keep composables under the 140-line limit.
 */
import { createAnnotationManager } from "reynard-annotating";
export interface ModelManagerInstance {
    manager: ReturnType<typeof createAnnotationManager>;
    healthCheckInterval: ReturnType<typeof setInterval>;
}
/**
 * Initializes the model manager with configuration
 */
export declare const initializeModelManager: (baseUrl: string, apiKey?: string) => Promise<ReturnType<typeof createAnnotationManager>>;
/**
 * Sets up periodic health checks
 */
export declare const setupHealthChecks: (loadSystemHealth: () => Promise<void>, intervalMs?: number) => ReturnType<typeof setInterval>;
/**
 * Sets up model event listeners
 */
export declare const setupModelEventListeners: (manager: ReturnType<typeof createAnnotationManager>, loadModelData: () => Promise<void>) => void;
/**
 * Cleans up model manager resources
 */
export declare const cleanupModelManager: (manager: ReturnType<typeof createAnnotationManager> | null, healthCheckInterval: ReturnType<typeof setInterval> | null) => Promise<void>;
