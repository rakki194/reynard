/**
 * Backend Annotation Service
 *
 * This service interfaces with the FastAPI backend instead of implementing
 * local model loading and generation logic.
 */
import { createCaptionApiClient } from "../clients/index.js";
import { SimpleEventManager } from "./EventManager.js";
import { BatchProcessor } from "./BatchProcessor.js";
import { SingleCaptionProcessor } from "./SingleCaptionProcessor.js";
import { GeneratorManager } from "./GeneratorManager.js";
import { HealthStatsManager } from "./HealthStatsManager.js";
export class BackendAnnotationService {
    constructor(config) {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "singleProcessor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "batchProcessor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "generatorManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "healthStatsManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.client = createCaptionApiClient(config);
        this.eventManager = new SimpleEventManager();
        this.singleProcessor = new SingleCaptionProcessor(this.client, this.eventManager);
        this.batchProcessor = new BatchProcessor(this.client, this.eventManager);
        this.generatorManager = new GeneratorManager(this.client);
        this.healthStatsManager = new HealthStatsManager();
        this.generatorManager.initializeGenerators();
    }
    async generateCaption(task) {
        return this.singleProcessor.processCaption(task);
    }
    async generateBatchCaptions(tasks, progressCallback) {
        return this.batchProcessor.processBatch(tasks, progressCallback);
    }
    async getAvailableGenerators() {
        return this.generatorManager.getAvailableGenerators();
    }
    getGenerator(name) {
        return this.generatorManager.getGenerator(name);
    }
    isGeneratorAvailable(name) {
        return this.generatorManager.isGeneratorAvailable(name);
    }
    async preloadModel(name) {
        return this.generatorManager.preloadModel(name);
    }
    async unloadModel(name) {
        return this.generatorManager.unloadModel(name);
    }
    getModelUsageStats(name) {
        return this.healthStatsManager.getModelUsageStats(name);
    }
    getHealthStatus() {
        return this.healthStatsManager.getHealthStatus();
    }
    // Event system
    addEventListener(listener) {
        this.eventManager.addEventListener(listener);
    }
    removeEventListener(listener) {
        this.eventManager.removeEventListener(listener);
    }
    // Statistics getters (delegated to backend)
    getTotalProcessed() {
        return this.healthStatsManager.getTotalProcessed();
    }
    getTotalProcessingTime() {
        return this.healthStatsManager.getTotalProcessingTime();
    }
    getAverageProcessingTime() {
        return this.healthStatsManager.getAverageProcessingTime();
    }
    getActiveTasksCount() {
        return this.healthStatsManager.getActiveTasksCount();
    }
}
/**
 * Create a backend annotation service
 */
export function createBackendAnnotationService(config) {
    return new BackendAnnotationService(config);
}
