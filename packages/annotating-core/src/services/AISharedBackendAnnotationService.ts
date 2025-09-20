/**
 * AI-Shared Backend Annotation Service
 *
 * This service extends BaseAIService from reynard-ai-shared to provide
 * lifecycle management, health monitoring, and service coordination for
 * the backend annotation system.
 */

import {
  BaseAIService,
  ServiceConfig,
  ServiceHealthInfo,
  ServiceHealth,
  ServiceError,
} from "reynard-ai-shared";
import { BackendAnnotationService, BackendAnnotationServiceConfig } from "./BackendAnnotationService.js";
import { CaptionTask, CaptionResult, AnnotationProgress } from "../types/index.js";

export interface AISharedBackendAnnotationServiceConfig extends ServiceConfig, BackendAnnotationServiceConfig {}

/**
 * Backend annotation service that integrates with ai-shared lifecycle management
 */
export class AISharedBackendAnnotationService extends BaseAIService {
  private backendService: BackendAnnotationService;
  private isBackendConnected = false;
  private lastBackendError?: string;

  constructor(config: AISharedBackendAnnotationServiceConfig) {
    super(config);
    this.backendService = new BackendAnnotationService(config);
  }

  // ========================================================================
  // BaseAIService Implementation
  // ========================================================================

  /**
   * Initialize the backend annotation service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize the backend service
      await this.backendService.initialize();
      this.isBackendConnected = true;
      this.lastBackendError = undefined;
    } catch (error) {
      this.isBackendConnected = false;
      this.lastBackendError = error instanceof Error ? error.message : String(error);
      throw new ServiceError(`Failed to initialize backend annotation service: ${this.lastBackendError}`, this.name, {
        error,
      });
    }
  }

  /**
   * Perform health check on the backend annotation service
   */
  async healthCheck(): Promise<ServiceHealthInfo> {
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
    } catch (error) {
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
  async shutdown(): Promise<void> {
    try {
      await this.backendService.shutdown();
      this.isBackendConnected = false;
      this.lastBackendError = undefined;
    } catch (error) {
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
  async generateCaption(task: CaptionTask): Promise<CaptionResult> {
    if (!this.isBackendConnected) {
      throw new ServiceError("Backend annotation service is not connected", this.name, { task });
    }

    try {
      return await this.backendService.generateCaption(task);
    } catch (error) {
      this.lastBackendError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  /**
   * Generate batch captions using the backend service
   */
  async generateBatchCaptions(
    tasks: CaptionTask[],
    progressCallback?: (progress: AnnotationProgress) => void
  ): Promise<CaptionResult[]> {
    if (!this.isBackendConnected) {
      throw new ServiceError("Backend annotation service is not connected", this.name, { taskCount: tasks.length });
    }

    try {
      return await this.backendService.generateBatchCaptions(tasks, progressCallback);
    } catch (error) {
      this.lastBackendError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  /**
   * Get available caption generators
   */
  async getAvailableGenerators(): Promise<any[]> {
    if (!this.isBackendConnected) {
      return [];
    }

    try {
      return await this.backendService.getAvailableGenerators();
    } catch (error) {
      this.lastBackendError = error instanceof Error ? error.message : String(error);
      return [];
    }
  }

  /**
   * Get a specific generator
   */
  getGenerator(name: string): any {
    if (!this.isBackendConnected) {
      return undefined;
    }

    try {
      return this.backendService.getGenerator(name);
    } catch (error) {
      this.lastBackendError = error instanceof Error ? error.message : String(error);
      return undefined;
    }
  }

  /**
   * Check if a generator is available
   */
  isGeneratorAvailable(name: string): boolean {
    if (!this.isBackendConnected) {
      return false;
    }

    try {
      return this.backendService.isGeneratorAvailable(name);
    } catch (error) {
      this.lastBackendError = error instanceof Error ? error.message : String(error);
      return false;
    }
  }

  /**
   * Preload a model
   */
  async preloadModel(name: string): Promise<void> {
    if (!this.isBackendConnected) {
      throw new ServiceError("Backend annotation service is not connected", this.name, { modelName: name });
    }

    try {
      await this.backendService.preloadModel(name);
    } catch (error) {
      this.lastBackendError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  /**
   * Unload a model
   */
  async unloadModel(name: string): Promise<void> {
    if (!this.isBackendConnected) {
      throw new ServiceError("Backend annotation service is not connected", this.name, { modelName: name });
    }

    try {
      await this.backendService.unloadModel(name);
    } catch (error) {
      this.lastBackendError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  /**
   * Get model usage statistics
   */
  getModelUsageStats(name: string): any {
    if (!this.isBackendConnected) {
      return null;
    }

    try {
      return this.backendService.getModelUsageStats(name);
    } catch (error) {
      this.lastBackendError = error instanceof Error ? error.message : String(error);
      return null;
    }
  }

  /**
   * Get health status
   */
  getHealthStatus(): any {
    if (!this.isBackendConnected) {
      return {
        isHealthy: false,
        lastCheck: new Date(),
        error: this.lastBackendError || "Service not connected",
      };
    }

    try {
      return this.backendService.getHealthStatus();
    } catch (error) {
      this.lastBackendError = error instanceof Error ? error.message : String(error);
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
  getBackendService(): BackendAnnotationService {
    return this.backendService;
  }

  /**
   * Check if backend is connected
   */
  get isConnected(): boolean {
    return this.isBackendConnected;
  }

  /**
   * Get last backend error
   */
  get lastError(): string | undefined {
    return this.lastBackendError;
  }
}
