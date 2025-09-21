/**
 * 🦊 Reynard Backend Annotation Manager
 * =====================================
 *
 * Comprehensive annotation management system that interfaces with the FastAPI backend
 * for sophisticated image annotation, caption generation, and model management.
 * This manager provides a simplified interface to complex backend services while
 * maintaining full functionality for annotation workflows.
 *
 * The BackendAnnotationManager provides:
 * - Image annotation and caption generation through backend services
 * - Model management and configuration via FastAPI endpoints
 * - Real-time event system for annotation progress tracking
 * - Health monitoring and service status management
 * - Usage statistics and performance metrics
 * - Error handling and graceful degradation
 *
 * Key Features:
 * - Backend Service Integration: Seamless communication with FastAPI backend
 * - Event System: Real-time progress tracking and status updates
 * - Model Management: Dynamic model loading and configuration
 * - Health Monitoring: Service health checks and status reporting
 * - Usage Analytics: Comprehensive usage statistics and metrics
 * - Error Recovery: Graceful error handling and service recovery
 *
 * Architecture:
 * - BackendAnnotationService: Core backend communication layer
 * - SimpleEventSystem: Lightweight event management for progress tracking
 * - Model Management: Dynamic model configuration and loading
 * - Health Monitoring: Service health checks and status reporting
 *
 * The manager simplifies complex backend operations while providing a clean,
 * intuitive interface for annotation workflows within the Reynard ecosystem.
 *
 * @author Reynard Development Team
 * @version 1.0.0
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
/**
 * Simple event system for backend annotation manager.
 *
 * Provides lightweight event management for annotation progress tracking
 * and status updates. This system allows components to subscribe to
 * annotation events and receive real-time updates during processing.
 *
 * @class SimpleEventSystem
 */
class SimpleEventSystem {
  private listeners: Array<(event: AnyAnnotationEvent) => void> = [];

  /**
   * Add an event listener for annotation events.
   *
   * @param listener - Function to call when annotation events occur
   */
  addEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove an event listener.
   *
   * @param listener - Function to remove from event listeners
   */
  removeEventListener(listener: (event: AnyAnnotationEvent) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Emit an annotation event to all registered listeners.
   *
   * @param event - The annotation event to emit
   */
  emitEvent(event: AnyAnnotationEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in event listener:", error);
      }
    });
  }
}

export type BackendAnnotationManagerConfig = BackendAnnotationServiceConfig;

/**
 * Backend Annotation Manager implementation.
 *
 * Provides comprehensive annotation management through backend service integration.
 * This manager implements the IAnnotationManager interface while delegating
 * complex operations to the FastAPI backend for improved performance and
 * scalability.
 *
 * @class BackendAnnotationManager
 * @implements {IAnnotationManager}
 */
export class BackendAnnotationManager implements IAnnotationManager {
  private annotationService: BackendAnnotationService;
  private eventSystem: SimpleEventSystem;
  private isStarted = false;

  constructor(config: BackendAnnotationManagerConfig) {
    this.annotationService = createBackendAnnotationService(config);
    this.eventSystem = new SimpleEventSystem();

    // Forward events from the annotation service
    this.annotationService.addEventListener(event => {
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

  /**
   * Initialize the manager
   */
  async initialize(): Promise<void> {
    await this.start();
  }

  /**
   * Shutdown the manager
   */
  async shutdown(): Promise<void> {
    await this.stop();
    await this.annotationService.shutdown();
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
export function createBackendAnnotationManager(config: BackendAnnotationManagerConfig): BackendAnnotationManager {
  return new BackendAnnotationManager(config);
}

/**
 * Alias for createBackendAnnotationManager for backward compatibility
 */
export const createAnnotationManager = createBackendAnnotationManager;
