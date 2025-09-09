/**
 * Backend Annotation Manager
 *
 * Simplified manager that interfaces with the FastAPI backend.
 * This replaces the complex local model management with clean HTTP API calls.
 */

import {
  BackendAnnotationManager as CoreBackendManager,
  createBackendAnnotationManager,
  type CaptionTask,
  type CaptionResult,
  type ModelManagerConfig,
  type AnyAnnotationEvent,
} from "reynard-annotating-core";

// Define the config type locally since it's not exported from core
export interface BackendAnnotationManagerConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
}

export class BackendAnnotationManager {
  private coreManager: CoreBackendManager;
  private isInitialized = false;
  private eventListeners: Array<(event: AnyAnnotationEvent) => void> = [];

  constructor(config: BackendAnnotationManagerConfig) {
    this.coreManager = createBackendAnnotationManager(config);

    // Forward events from core manager
    this.coreManager.addEventListener((event: AnyAnnotationEvent) => {
      this.emitEvent(event);
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.coreManager.start();
      this.isInitialized = true;
      console.log("Backend Annotation Manager initialized");
    } catch (error) {
      console.error("Failed to initialize Backend Annotation Manager:", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      await this.coreManager.stop();
      this.isInitialized = false;
      console.log("Backend Annotation Manager shutdown");
    } catch (error) {
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

  isGeneratorAvailable(name: string) {
    return this.coreManager.isGeneratorAvailable(name);
  }

  async preloadModel(name: string) {
    return this.coreManager.preloadModel(name);
  }

  async unloadModel(name: string) {
    return this.coreManager.unloadModel(name);
  }

  getModelUsageStats(name: string) {
    return this.coreManager.getModelUsageStats(name);
  }

  getHealthStatus() {
    return this.coreManager.getHealthStatus();
  }

  getConfiguration() {
    return this.coreManager.getConfiguration();
  }

  updateConfiguration(config: Partial<ModelManagerConfig>) {
    return this.coreManager.updateConfiguration(config);
  }

  getSystemStatistics() {
    return this.coreManager.getSystemStatistics();
  }

  // Event system
  addEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index >= 0) {
      this.eventListeners.splice(index, 1);
    }
  }

  private emitEvent(event: AnyAnnotationEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in event listener:", error);
      }
    }
  }

  // Convenience methods for common operations
  async generateFurryTags(
    imagePath: string,
    config?: Record<string, unknown>,
  ): Promise<CaptionResult> {
    const service = this.getService();
    const task: CaptionTask = {
      imagePath,
      generatorName: "jtp2",
      config: config || {},
    };
    return service.generateCaption(task);
  }

  async generateDetailedCaption(
    imagePath: string,
    config?: Record<string, unknown>,
  ): Promise<CaptionResult> {
    const service = this.getService();
    const task: CaptionTask = {
      imagePath,
      generatorName: "joycaption",
      config: config || {},
    };
    return service.generateCaption(task);
  }

  async generateAnimeTags(
    imagePath: string,
    config?: Record<string, unknown>,
  ): Promise<CaptionResult> {
    const service = this.getService();
    const task: CaptionTask = {
      imagePath,
      generatorName: "wdv3",
      config: config || {},
    };
    return service.generateCaption(task);
  }

  async generateGeneralCaption(
    imagePath: string,
    config?: Record<string, unknown>,
  ): Promise<CaptionResult> {
    const service = this.getService();
    const task: CaptionTask = {
      imagePath,
      generatorName: "florence2",
      config: config || {},
    };
    return service.generateCaption(task);
  }
}

/**
 * Create a backend annotation manager
 */
export function createAnnotationManager(
  config: BackendAnnotationManagerConfig,
): BackendAnnotationManager {
  return new BackendAnnotationManager(config);
}

/**
 * Default configuration for backend annotation manager
 */
export const DEFAULT_BACKEND_CONFIG: BackendAnnotationManagerConfig = {
  baseUrl: "http://localhost:8000",
  timeout: 30000,
  retries: 3,
};
