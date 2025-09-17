/**
 * Caption API Client for Reynard Annotating
 *
 * Specialized API client for caption generation operations that extends
 * the generic ApiClient from the core package.
 */
import { ApiClient, } from "reynard-core";
export class CaptionApiClient extends ApiClient {
    constructor(config) {
        const apiConfig = {
            serviceName: "caption-api",
            version: "1.0.0",
            ...config,
        };
        super(apiConfig);
    }
    /**
     * Generate a single caption
     */
    async generateCaption(request) {
        return this.httpClient.request({
            method: "POST",
            endpoint: "/caption/generate",
            data: request,
        });
    }
    /**
     * Generate captions for multiple images
     */
    async generateBatchCaptions(request) {
        return this.httpClient.request({
            method: "POST",
            endpoint: "/caption/batch",
            data: request,
        });
    }
    /**
     * Get available caption generators
     */
    async getAvailableGenerators() {
        return this.httpClient.request({
            method: "GET",
            endpoint: "/caption/generators",
        });
    }
    /**
     * Get information about a specific generator
     */
    async getGeneratorInfo(generatorName) {
        return this.httpClient.request({
            method: "GET",
            endpoint: `/caption/generators/${generatorName}`,
        });
    }
    /**
     * Load a specific model
     */
    async loadModel(generatorName) {
        return this.httpClient.request({
            method: "POST",
            endpoint: `/caption/models/${generatorName}/load`,
        });
    }
    /**
     * Unload a specific model
     */
    async unloadModel(generatorName) {
        return this.httpClient.request({
            method: "POST",
            endpoint: `/caption/models/${generatorName}/unload`,
        });
    }
    /**
     * Get list of loaded models
     */
    async getLoadedModels() {
        return this.httpClient.request({
            method: "GET",
            endpoint: "/caption/models/loaded",
        });
    }
    /**
     * Get system statistics
     */
    async getSystemStats() {
        return this.httpClient.request({
            method: "GET",
            endpoint: "/caption/stats",
        });
    }
    /**
     * Get system health status
     */
    async getHealthStatus() {
        return this.httpClient.request({
            method: "GET",
            endpoint: "/caption/health",
        });
    }
    /**
     * Get usage statistics for a specific model
     */
    async getModelStats(generatorName) {
        return this.httpClient.request({
            method: "GET",
            endpoint: `/caption/models/${generatorName}/stats`,
        });
    }
    /**
     * Get request queue status
     */
    async getQueueStatus() {
        return this.httpClient.request({
            method: "GET",
            endpoint: "/caption/queue",
        });
    }
    /**
     * Upload an image file for caption generation
     */
    async uploadImage(file, generatorName, config) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("generator_name", generatorName);
        if (config) {
            formData.append("config", JSON.stringify(config));
        }
        return this.httpClient.upload({
            endpoint: "/caption/upload",
            formData,
        });
    }
    /**
     * Override health check to use caption-specific endpoint
     */
    async checkHealth() {
        try {
            const response = await this.getHealthStatus();
            this.lastHealthCheck = Date.now();
            return response;
        }
        catch (error) {
            return {
                isHealthy: false,
                status: "unhealthy",
                timestamp: Date.now(),
                version: this.config.version,
                serviceName: this.config.serviceName,
                details: {
                    error: error instanceof Error ? error.message : String(error),
                },
            };
        }
    }
}
