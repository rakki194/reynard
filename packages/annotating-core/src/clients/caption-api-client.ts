/**
 * Caption API Client for Reynard Annotating
 *
 * Specialized API client for caption generation operations that extends
 * the generic ApiClient from the core package.
 */

import {
  ApiClient,
  type ApiClientConfig,
  type HealthStatus,
} from "reynard-core";
import {
  CaptionApiClientConfig,
  CaptionRequest,
  BatchCaptionRequest,
  GeneratorInfo,
  CaptionResponse,
  SystemStats,
  ModelUsageStats,
} from "./caption-types.js";

export class CaptionApiClient extends ApiClient {
  constructor(config: CaptionApiClientConfig) {
    const apiConfig: ApiClientConfig = {
      serviceName: "caption-api",
      version: "1.0.0",
      ...config,
    };
    super(apiConfig);
  }

  /**
   * Generate a single caption
   */
  async generateCaption(request: CaptionRequest): Promise<CaptionResponse> {
    return this.httpClient.request({
      method: "POST",
      endpoint: "/caption/generate",
      data: request,
    });
  }

  /**
   * Generate captions for multiple images
   */
  async generateBatchCaptions(
    request: BatchCaptionRequest,
  ): Promise<CaptionResponse[]> {
    return this.httpClient.request({
      method: "POST",
      endpoint: "/caption/batch",
      data: request,
    });
  }

  /**
   * Get available caption generators
   */
  async getAvailableGenerators(): Promise<Record<string, GeneratorInfo>> {
    return this.httpClient.request({
      method: "GET",
      endpoint: "/caption/generators",
    });
  }

  /**
   * Get information about a specific generator
   */
  async getGeneratorInfo(generatorName: string): Promise<GeneratorInfo> {
    return this.httpClient.request({
      method: "GET",
      endpoint: `/caption/generators/${generatorName}`,
    });
  }

  /**
   * Load a specific model
   */
  async loadModel(
    generatorName: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.httpClient.request({
      method: "POST",
      endpoint: `/caption/models/${generatorName}/load`,
    });
  }

  /**
   * Unload a specific model
   */
  async unloadModel(
    generatorName: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.httpClient.request({
      method: "POST",
      endpoint: `/caption/models/${generatorName}/unload`,
    });
  }

  /**
   * Get list of loaded models
   */
  async getLoadedModels(): Promise<string[]> {
    return this.httpClient.request({
      method: "GET",
      endpoint: "/caption/models/loaded",
    });
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    return this.httpClient.request({
      method: "GET",
      endpoint: "/caption/stats",
    });
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    return this.httpClient.request({
      method: "GET",
      endpoint: "/caption/health",
    });
  }

  /**
   * Get usage statistics for a specific model
   */
  async getModelStats(generatorName: string): Promise<ModelUsageStats> {
    return this.httpClient.request({
      method: "GET",
      endpoint: `/caption/models/${generatorName}/stats`,
    });
  }

  /**
   * Get request queue status
   */
  async getQueueStatus(): Promise<any> {
    return this.httpClient.request({
      method: "GET",
      endpoint: "/caption/queue",
    });
  }

  /**
   * Upload an image file for caption generation
   */
  async uploadImage(
    file: File,
    generatorName: string,
    config?: Record<string, any>,
  ): Promise<CaptionResponse> {
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
  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await this.getHealthStatus();
      this.lastHealthCheck = Date.now();
      return response;
    } catch (error) {
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
