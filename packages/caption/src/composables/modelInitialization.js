/**
 * Model Initialization Utilities
 *
 * Utility functions for initializing the model manager and setting up event listeners.
 * Extracted to keep composables under the 140-line limit.
 */
import { createAnnotationManager } from "reynard-annotating";
/**
 * Initializes the model manager with configuration
 */
export const initializeModelManager = async (baseUrl, apiKey) => {
    const manager = createAnnotationManager({
        baseUrl,
        apiKey,
    });
    await manager.initialize();
    return manager;
};
/**
 * Sets up periodic health checks
 */
export const setupHealthChecks = (loadSystemHealth, intervalMs = 5000) => {
    return setInterval(async () => {
        await loadSystemHealth();
    }, intervalMs);
};
/**
 * Sets up model event listeners
 */
export const setupModelEventListeners = (manager, loadModelData) => {
    manager.addEventListener((event) => {
        if (event.type === "model_loaded" || event.type === "model_unloaded") {
            loadModelData();
        }
    });
};
/**
 * Cleans up model manager resources
 */
export const cleanupModelManager = async (manager, healthCheckInterval) => {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
    }
    if (manager) {
        await manager.shutdown();
    }
};
