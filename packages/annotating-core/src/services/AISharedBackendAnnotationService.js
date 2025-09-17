/**
 * AI-Shared Backend Annotation Service
 *
 * This service extends BaseAIService from reynard-ai-shared to provide
 * lifecycle management, health monitoring, and service coordination for
 * the backend annotation system.
 */
import { ServiceHealth, ServiceError, } from "reynard-ai-shared";
import { BackendAnnotationService, } from "./BackendAnnotationService.js";
/**
 * Backend annotation service that integrates with ai-shared lifecycle management
 */
export class AISharedBackendAnnotationService extends BaseAIService {
    constructor(config) {
        super(config);
        Object.defineProperty(this, "backendService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isBackendConnected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "lastBackendError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.backendService = new BackendAnnotationService(config);
    }
    // ========================================================================
    // BaseAIService Implementation
    // ========================================================================
    /**
     * Initialize the backend annotation service
     */
    async initialize() {
        try {
            // Initialize the backend service
            await this.backendService.initialize();
            this.isBackendConnected = true;
            this.lastBackendError = undefined;
        }
        catch (error) {
            this.isBackendConnected = false;
            this.lastBackendError =
                error instanceof Error ? error.message : String(error);
            throw new ServiceError(`Failed to initialize backend annotation service: ${this.lastBackendError}`, this.name, { error });
        }
    }
    /**
     * Perform health check on the backend annotation service
     */
    async healthCheck() {
        try {
            const backendHealth = this.backendService.getHealthStatus();
            // Check if backend is responsive
            const isHealthy = backendHealth.isHealthy && this.isBackendConnected;
            return {
                status: this.status,
                health: isHealthy ? ServiceHealth.HEALTHY : ServiceHealth.UNHEALTHY,
                lastCheck: new Date(),
                uptime: this.startupTime ? Date.now() - this.startupTime.getTime() : 0,
                memoryUsage: 0, // Backend service doesn't track memory directly
                cpuUsage: 0, // Backend service doesn't track CPU directly
                errorCount: this.lastBackendError ? 1 : 0,
                lastError: this.lastBackendError,
                metadata: {
                    backendHealth,
                    isBackendConnected: this.isBackendConnected,
                    availableGenerators: await this.getAvailableGenerators(),
                },
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.lastBackendError = errorMessage;
            return {
                status: this.status,
                health: ServiceHealth.UNHEALTHY,
                lastCheck: new Date(),
                uptime: this.startupTime ? Date.now() - this.startupTime.getTime() : 0,
                memoryUsage: 0,
                cpuUsage: 0,
                errorCount: 1,
                lastError: errorMessage,
                metadata: {
                    isBackendConnected: false,
                    healthCheckError: errorMessage,
                },
            };
        }
    }
    /**
     * Shutdown the backend annotation service
     */
    async shutdown() {
        try {
            await this.backendService.shutdown();
            this.isBackendConnected = false;
            this.lastBackendError = undefined;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.lastBackendError = errorMessage;
            throw new ServiceError(`Failed to shutdown backend annotation service: ${errorMessage}`, this.name, { error });
        }
    }
    // ========================================================================
    // Annotation Service Interface
    // ========================================================================
    /**
     * Generate a caption using the backend service
     */
    async generateCaption(task) {
        if (!this.isBackendConnected) {
            throw new ServiceError("Backend annotation service is not connected", this.name, { task });
        }
        try {
            return await this.backendService.generateCaption(task);
        }
        catch (error) {
            this.lastBackendError =
                error instanceof Error ? error.message : String(error);
            throw error;
        }
    }
    /**
     * Generate batch captions using the backend service
     */
    async generateBatchCaptions(tasks, progressCallback) {
        if (!this.isBackendConnected) {
            throw new ServiceError("Backend annotation service is not connected", this.name, { taskCount: tasks.length });
        }
        try {
            return await this.backendService.generateBatchCaptions(tasks, progressCallback);
        }
        catch (error) {
            this.lastBackendError =
                error instanceof Error ? error.message : String(error);
            throw error;
        }
    }
    /**
     * Get available caption generators
     */
    async getAvailableGenerators() {
        if (!this.isBackendConnected) {
            return [];
        }
        try {
            return await this.backendService.getAvailableGenerators();
        }
        catch (error) {
            this.lastBackendError =
                error instanceof Error ? error.message : String(error);
            return [];
        }
    }
    /**
     * Get a specific generator
     */
    getGenerator(name) {
        if (!this.isBackendConnected) {
            return undefined;
        }
        try {
            return this.backendService.getGenerator(name);
        }
        catch (error) {
            this.lastBackendError =
                error instanceof Error ? error.message : String(error);
            return undefined;
        }
    }
    /**
     * Check if a generator is available
     */
    isGeneratorAvailable(name) {
        if (!this.isBackendConnected) {
            return false;
        }
        try {
            return this.backendService.isGeneratorAvailable(name);
        }
        catch (error) {
            this.lastBackendError =
                error instanceof Error ? error.message : String(error);
            return false;
        }
    }
    /**
     * Preload a model
     */
    async preloadModel(name) {
        if (!this.isBackendConnected) {
            throw new ServiceError("Backend annotation service is not connected", this.name, { modelName: name });
        }
        try {
            await this.backendService.preloadModel(name);
        }
        catch (error) {
            this.lastBackendError =
                error instanceof Error ? error.message : String(error);
            throw error;
        }
    }
    /**
     * Unload a model
     */
    async unloadModel(name) {
        if (!this.isBackendConnected) {
            throw new ServiceError("Backend annotation service is not connected", this.name, { modelName: name });
        }
        try {
            await this.backendService.unloadModel(name);
        }
        catch (error) {
            this.lastBackendError =
                error instanceof Error ? error.message : String(error);
            throw error;
        }
    }
    /**
     * Get model usage statistics
     */
    getModelUsageStats(name) {
        if (!this.isBackendConnected) {
            return null;
        }
        try {
            return this.backendService.getModelUsageStats(name);
        }
        catch (error) {
            this.lastBackendError =
                error instanceof Error ? error.message : String(error);
            return null;
        }
    }
    /**
     * Get health status
     */
    getHealthStatus() {
        if (!this.isBackendConnected) {
            return {
                isHealthy: false,
                lastCheck: new Date(),
                error: this.lastBackendError || "Service not connected",
            };
        }
        try {
            return this.backendService.getHealthStatus();
        }
        catch (error) {
            this.lastBackendError =
                error instanceof Error ? error.message : String(error);
            return {
                isHealthy: false,
                lastCheck: new Date(),
                error: this.lastBackendError,
            };
        }
    }
    // ========================================================================
    // Utility Methods
    // ========================================================================
    /**
     * Get the underlying backend service
     */
    getBackendService() {
        return this.backendService;
    }
    /**
     * Check if backend is connected
     */
    get isConnected() {
        return this.isBackendConnected;
    }
    /**
     * Get last backend error
     */
    get lastError() {
        return this.lastBackendError;
    }
}
