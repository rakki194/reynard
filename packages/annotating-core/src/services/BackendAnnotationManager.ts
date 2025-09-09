/**
 * Backend Annotation Manager
 *
 * Simplified manager that interfaces with the FastAPI backend instead of
 * implementing complex local model management.
 */

import {
  AnnotationManager as IAnnotationManager,
  AnnotationService,
  CaptionGenerator,
  ModelManagerConfig,
  ModelUsageStats,
  HealthStatus,
  AnyAnnotationEvent,
} from "../types/index.js";
import {
  BackendAnnotationService,
  createBackendAnnotationService,
  BackendAnnotationServiceConfig,
} from "./BackendAnnotationService.js";
// Simple event system for backend manager
class SimpleEventSystem {
  private listeners: Array<(event: AnyAnnotationEvent) => void> = [];

  addEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    this.listeners.push(listener);
  }

  removeEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  emitEvent(event: AnyAnnotationEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in event listener:", error);
      }
    });
  }
}

export type BackendAnnotationManagerConfig = BackendAnnotationServiceConfig;

export class BackendAnnotationManager implements IAnnotationManager {
  private annotationService: BackendAnnotationService;
  private eventSystem: SimpleEventSystem;
  private isStarted = false;

  constructor(config: BackendAnnotationManagerConfig) {
    this.annotationService = createBackendAnnotationService(config);
    this.eventSystem = new SimpleEventSystem();

    // Forward events from the annotation service
    this.annotationService.addEventListener((event) => {
      this.eventSystem.emitEvent(event);
    });
  }

  async start(): Promise<void> {
    if (this.isStarted) return;

    // Initialize generators from backend
    await this.annotationService.getAvailableGenerators();
    this.isStarted = true;
  }

  async stop(): Promise<void> {
    this.isStarted = false;
  }

  getService(): AnnotationService {
    return this.annotationService;
  }

  async getAvailableGenerators(): Promise<CaptionGenerator[]> {
    return this.annotationService.getAvailableGenerators();
  }

  isGeneratorAvailable(name: string): boolean {
    return this.annotationService.isGeneratorAvailable(name);
  }

  async preloadModel(name: string): Promise<void> {
    return this.annotationService.preloadModel(name);
  }

  async unloadModel(name: string): Promise<void> {
    return this.annotationService.unloadModel(name);
  }

  getModelUsageStats(name: string): ModelUsageStats | null {
    return this.annotationService.getModelUsageStats(name);
  }

  getHealthStatus(): HealthStatus {
    return this.annotationService.getHealthStatus();
  }

  getConfiguration(): ModelManagerConfig {
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

  updateConfiguration(_config: Partial<ModelManagerConfig>): void {
    // Configuration updates would need to be sent to backend
    console.warn("Configuration updates not supported in backend mode");
  }

  // Event system
  addEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    this.eventSystem.addEventListener(listener);
  }

  removeEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    this.eventSystem.removeEventListener(listener);
  }

  // Model management (delegated to backend)
  async registerGenerator(_generator: CaptionGenerator): Promise<void> {
    // Generators are managed by the backend
    console.warn("Generator registration not supported in backend mode");
  }

  getModelManager(): unknown {
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
export function createBackendAnnotationManager(
  config: BackendAnnotationManagerConfig,
): BackendAnnotationManager {
  return new BackendAnnotationManager(config);
}
