/**
 * Backend Annotation Manager
 *
 * Simplified manager that interfaces with the FastAPI backend.
 * This replaces the complex local model management with clean HTTP API calls.
 */

import {
  BackendAnnotationManager as CoreBackendManager,
  createBackendAnnotationManager,
  type ModelManagerConfig,
  type AnyAnnotationEvent,
} from "reynard-annotating-core";
import type { BackendAnnotationManagerConfig } from "./config";
import {
  generateFurryTags,
  generateDetailedCaption,
  generateAnimeTags,
  generateGeneralCaption,
} from "./caption-generators";

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
  ) {
    return generateFurryTags(this, imagePath, config);
  }

  async generateDetailedCaption(
    imagePath: string,
    config?: Record<string, unknown>,
  ) {
    return generateDetailedCaption(this, imagePath, config);
  }

  async generateAnimeTags(
    imagePath: string,
    config?: Record<string, unknown>,
  ) {
    return generateAnimeTags(this, imagePath, config);
  }

  async generateGeneralCaption(
    imagePath: string,
    config?: Record<string, unknown>,
  ) {
    return generateGeneralCaption(this, imagePath, config);
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
