/**
 * Backend Annotation Manager
 *
 * Simplified manager that interfaces with the FastAPI backend.
 * This replaces the complex local model management with clean HTTP API calls.
 */
import { createBackendAnnotationManager, } from "reynard-annotating-core";
import { generateFurryTags, generateDetailedCaption, generateAnimeTags, generateGeneralCaption, } from "./caption-generators";
export class BackendAnnotationManager {
    constructor(config) {
        Object.defineProperty(this, "coreManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "eventListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.coreManager = createBackendAnnotationManager(config);
        // Forward events from core manager
        this.coreManager.addEventListener((event) => {
            this.emitEvent(event);
        });
    }
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            await this.coreManager.start();
            this.isInitialized = true;
            console.log("Backend Annotation Manager initialized");
        }
        catch (error) {
            console.error("Failed to initialize Backend Annotation Manager:", error);
            throw error;
        }
    }
    async shutdown() {
        if (!this.isInitialized)
            return;
        try {
            await this.coreManager.stop();
            this.isInitialized = false;
            console.log("Backend Annotation Manager shutdown");
        }
        catch (error) {
            console.error("Error shutting down Backend Annotation Manager:", error);
            throw error;
        }
    }
    // Delegate all methods to the core manager
    getService() {
        return this.coreManager.getService();
    }
    async getAvailableGenerators() {
        return this.coreManager.getAvailableGenerators();
    }
    isGeneratorAvailable(name) {
        return this.coreManager.isGeneratorAvailable(name);
    }
    async preloadModel(name) {
        return this.coreManager.preloadModel(name);
    }
    async unloadModel(name) {
        return this.coreManager.unloadModel(name);
    }
    getModelUsageStats(name) {
        return this.coreManager.getModelUsageStats(name);
    }
    getHealthStatus() {
        return this.coreManager.getHealthStatus();
    }
    getConfiguration() {
        return this.coreManager.getConfiguration();
    }
    updateConfiguration(config) {
        return this.coreManager.updateConfiguration(config);
    }
    getSystemStatistics() {
        return this.coreManager.getSystemStatistics();
    }
    // Event system
    addEventListener(listener) {
        this.eventListeners.push(listener);
    }
    removeEventListener(listener) {
        const index = this.eventListeners.indexOf(listener);
        if (index >= 0) {
            this.eventListeners.splice(index, 1);
        }
    }
    emitEvent(event) {
        for (const listener of this.eventListeners) {
            try {
                listener(event);
            }
            catch (error) {
                console.error("Error in event listener:", error);
            }
        }
    }
    // Convenience methods for common operations
    async generateFurryTags(imagePath, config) {
        return generateFurryTags(this, imagePath, config);
    }
    async generateDetailedCaption(imagePath, config) {
        return generateDetailedCaption(this, imagePath, config);
    }
    async generateAnimeTags(imagePath, config) {
        return generateAnimeTags(this, imagePath, config);
    }
    async generateGeneralCaption(imagePath, config) {
        return generateGeneralCaption(this, imagePath, config);
    }
}
/**
 * Create a backend annotation manager
 */
export function createAnnotationManager(config) {
    return new BackendAnnotationManager(config);
}
