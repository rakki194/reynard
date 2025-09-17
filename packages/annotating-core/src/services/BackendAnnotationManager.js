/**
 * Backend Annotation Manager
 *
 * Simplified manager that interfaces with the FastAPI backend instead of
 * implementing complex local model management.
 */
import { createBackendAnnotationService, } from "./BackendAnnotationService.js";
// Simple event system for backend manager
class SimpleEventSystem {
    constructor() {
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    addEventListener(listener) {
        this.listeners.push(listener);
    }
    removeEventListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
    }
    emitEvent(event) {
        this.listeners.forEach((listener) => {
            try {
                listener(event);
            }
            catch (error) {
                console.error("Error in event listener:", error);
            }
        });
    }
}
export class BackendAnnotationManager {
    constructor(config) {
        Object.defineProperty(this, "annotationService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isStarted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.annotationService = createBackendAnnotationService(config);
        this.eventSystem = new SimpleEventSystem();
        // Forward events from the annotation service
        this.annotationService.addEventListener((event) => {
            this.eventSystem.emitEvent(event);
        });
    }
    async start() {
        if (this.isStarted)
            return;
        // Initialize generators from backend
        await this.annotationService.getAvailableGenerators();
        this.isStarted = true;
    }
    async stop() {
        this.isStarted = false;
    }
    getService() {
        return this.annotationService;
    }
    async getAvailableGenerators() {
        return this.annotationService.getAvailableGenerators();
    }
    isGeneratorAvailable(name) {
        return this.annotationService.isGeneratorAvailable(name);
    }
    async preloadModel(name) {
        return this.annotationService.preloadModel(name);
    }
    async unloadModel(name) {
        return this.annotationService.unloadModel(name);
    }
    getModelUsageStats(name) {
        return this.annotationService.getModelUsageStats(name);
    }
    getHealthStatus() {
        return this.annotationService.getHealthStatus();
    }
    getConfiguration() {
        // Return a minimal config since we're using backend
        return {
            maxConcurrentDownloads: 1,
            maxConcurrentLoads: 1,
            downloadTimeout: 30000,
            loadTimeout: 30000,
            autoUnloadDelay: 300000, // 5 minutes
            healthCheckInterval: 60000, // 1 minute
            usageTrackingEnabled: true,
            preloadEnabled: false,
            preloadModels: [],
        };
    }
    updateConfiguration(_config) {
        // Configuration updates would need to be sent to backend
        console.warn("Configuration updates not supported in backend mode");
    }
    // Event system
    addEventListener(listener) {
        this.eventSystem.addEventListener(listener);
    }
    removeEventListener(listener) {
        this.eventSystem.removeEventListener(listener);
    }
    // Model management (delegated to backend)
    async registerGenerator(_generator) {
        // Generators are managed by the backend
        console.warn("Generator registration not supported in backend mode");
    }
    getModelManager() {
        // No local model manager in backend mode
        return null;
    }
    // Statistics and monitoring (delegated to backend)
    getSystemStatistics() {
        return {
            totalProcessed: this.annotationService.getTotalProcessed(),
            totalProcessingTime: this.annotationService.getTotalProcessingTime(),
            averageProcessingTime: this.annotationService.getAverageProcessingTime(),
            activeTasks: this.annotationService.getActiveTasksCount(),
            loadedModels: 0, // Would need to fetch from backend
            availableGenerators: 0, // Would need to fetch from backend
            usageStats: {},
            healthStatus: this.getHealthStatus(),
            queueStatus: {},
        };
    }
}
/**
 * Create a backend annotation manager
 */
export function createBackendAnnotationManager(config) {
    return new BackendAnnotationManager(config);
}
