/**
 * Segmentation Manager
 *
 * Central manager for segmentation services that integrates with the
 * Reynard annotation system and provides unified access to segmentation
 * capabilities. Coordinates multiple segmentation services and provides
 * comprehensive statistics and management features.
 */

import { ServiceRegistry, getServiceRegistry, ServiceError } from "reynard-ai-shared";
import { AnnotationServiceRegistry } from "reynard-annotating-core";
import { SegmentationService, SegmentationServiceConfig } from "./SegmentationService.js";
import {
  SegmentationTask,
  SegmentationResult,
  SegmentationData,
  SegmentationOptions,
  SegmentationExportFormat,
  SegmentationExportData,
  SegmentationStatistics,
  SegmentationManager as ISegmentationManager,
  SegmentationService as ISegmentationService,
} from "../types/index.js";

/**
 * Segmentation manager that coordinates multiple segmentation services
 * and provides comprehensive management capabilities.
 */
export class SegmentationManager implements ISegmentationManager {
  private serviceRegistry: ServiceRegistry;
  private annotationServiceRegistry: AnnotationServiceRegistry;
  private segmentationServices: Map<string, SegmentationService> = new Map();
  private isInitialized = false;
  private statistics: SegmentationStatistics = {
    totalSegmentations: 0,
    manualSegmentations: 0,
    aiGeneratedSegmentations: 0,
    averageProcessingTime: 0,
    topCategories: [],
    qualityMetrics: {
      averageConfidence: 0,
      averageComplexity: 0,
      averageArea: 0,
    },
  };
  private errorCount = 0;
  private lastError?: string;

  constructor(serviceRegistry?: ServiceRegistry, annotationServiceRegistry?: AnnotationServiceRegistry) {
    this.serviceRegistry = serviceRegistry || getServiceRegistry();
    this.annotationServiceRegistry = annotationServiceRegistry || new AnnotationServiceRegistry(this.serviceRegistry);
  }

  // ========================================================================
  // ISegmentationManager Implementation
  // ========================================================================

  /**
   * Initialize the segmentation system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize the service registry
      await this.serviceRegistry.initialize();

      // Initialize the annotation service registry
      await this.annotationServiceRegistry.initialize();

      // Register default segmentation services
      await this.registerDefaultServices();

      this.isInitialized = true;
      console.log("🦊 Segmentation manager initialized successfully");
    } catch (error) {
      this.errorCount++;
      this.lastError = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to initialize segmentation manager:", error);
      throw new ServiceError(
        `Segmentation manager initialization failed: ${this.lastError}`,
        "MANAGER_INITIALIZATION_ERROR"
      );
    }
  }

  /**
   * Get available segmentation services
   */
  async getAvailableServices(): Promise<string[]> {
    await this.ensureInitialized();
    return Array.from(this.segmentationServices.keys());
  }

  /**
   * Get segmentation service by name
   */
  getService(name: string): ISegmentationService | undefined {
    return this.segmentationServices.get(name);
  }

  /**
   * Check if service is available
   */
  isServiceAvailable(name: string): boolean {
    const service = this.segmentationServices.get(name);
    return service !== undefined && service.getStatus() === "ready";
  }

  /**
   * Get segmentation statistics
   */
  async getStatistics(): Promise<SegmentationStatistics> {
    await this.ensureInitialized();

    // Update statistics from all services
    await this.updateStatistics();

    return {
      ...this.statistics,
      errorCount: this.errorCount,
      lastError: this.lastError,
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      // Cleanup all segmentation services
      for (const [name, service] of this.segmentationServices) {
        try {
          await service.cleanup();
          console.log(`🦊 Cleaned up segmentation service: ${name}`);
        } catch (error) {
          console.error(`Failed to cleanup service ${name}:`, error);
        }
      }

      this.segmentationServices.clear();
      this.isInitialized = false;

      console.log("🦊 Segmentation manager cleaned up successfully");
    } catch (error) {
      console.error("Error during segmentation manager cleanup:", error);
    }
  }

  // ========================================================================
  // Service Management
  // ========================================================================

  /**
   * Register a segmentation service
   */
  async registerSegmentationService(name: string, config: SegmentationServiceConfig): Promise<SegmentationService> {
    await this.ensureInitialized();

    if (this.segmentationServices.has(name)) {
      throw new Error(`Segmentation service '${name}' is already registered`);
    }

    try {
      // Create and initialize the service
      const service = new SegmentationService(config);
      await service.initialize();

      // Register with the service registry
      this.serviceRegistry.registerService(name, service);

      // Store in our local map
      this.segmentationServices.set(name, service);

      console.log(`🦊 Registered segmentation service: ${name}`);
      return service;
    } catch (error) {
      console.error(`Failed to register segmentation service '${name}':`, error);
      throw error;
    }
  }

  /**
   * Unregister a segmentation service
   */
  async unregisterSegmentationService(name: string): Promise<void> {
    const service = this.segmentationServices.get(name);
    if (!service) {
      console.warn(`Segmentation service '${name}' is not registered`);
      return;
    }

    try {
      // Cleanup the service
      await service.cleanup();

      // Unregister from service registry
      this.serviceRegistry.unregisterService(name);

      // Remove from local map
      this.segmentationServices.delete(name);

      console.log(`🦊 Unregistered segmentation service: ${name}`);
    } catch (error) {
      console.error(`Failed to unregister segmentation service '${name}':`, error);
      throw error;
    }
  }

  // ========================================================================
  // Segmentation Operations
  // ========================================================================

  /**
   * Generate segmentation using the best available service
   */
  async generateSegmentation(task: SegmentationTask): Promise<SegmentationResult> {
    await this.ensureInitialized();

    const service = this.getBestAvailableService();
    if (!service) {
      throw new Error("No segmentation services are available");
    }

    try {
      const result = await service.generateSegmentation(task);

      // Update statistics
      this.updateStatisticsFromResult(result);

      return result;
    } catch (error) {
      console.error("Failed to generate segmentation:", error);
      throw error;
    }
  }

  /**
   * Generate multiple segmentations
   */
  async generateBatchSegmentations(
    tasks: SegmentationTask[],
    progressCallback?: (progress: number) => void
  ): Promise<SegmentationResult[]> {
    await this.ensureInitialized();

    const service = this.getBestAvailableService();
    if (!service) {
      throw new Error("No segmentation services are available");
    }

    try {
      const results = await service.generateBatchSegmentations(tasks, progressCallback);

      // Update statistics
      for (const result of results) {
        this.updateStatisticsFromResult(result);
      }

      return results;
    } catch (error) {
      console.error("Failed to generate batch segmentations:", error);
      throw error;
    }
  }

  /**
   * Refine existing segmentation
   */
  async refineSegmentation(segmentation: SegmentationData, options?: SegmentationOptions): Promise<SegmentationResult> {
    await this.ensureInitialized();

    const service = this.getBestAvailableService();
    if (!service) {
      throw new Error("No segmentation services are available");
    }

    try {
      const result = await service.refineSegmentation(segmentation, options);

      // Update statistics
      this.updateStatisticsFromResult(result);

      return result;
    } catch (error) {
      console.error("Failed to refine segmentation:", error);
      throw error;
    }
  }

  /**
   * Validate segmentation
   */
  validateSegmentation(segmentation: SegmentationData): boolean {
    const service = this.getBestAvailableService();
    if (!service) {
      return false;
    }

    return service.validateSegmentation(segmentation);
  }

  /**
   * Export segmentation data
   */
  exportSegmentation(segmentation: SegmentationData, format: SegmentationExportFormat): SegmentationExportData {
    const service = this.getBestAvailableService();
    if (!service) {
      throw new Error("No segmentation services are available");
    }

    try {
      const data = service.exportSegmentation(segmentation, format);

      return {
        format,
        data,
        metadata: {
          version: "1.0.0",
          timestamp: new Date(),
          source: "reynard-segmentation",
        },
      };
    } catch (error) {
      console.error("Failed to export segmentation:", error);
      throw error;
    }
  }

  /**
   * Import segmentation data
   */
  importSegmentation(data: SegmentationExportData): SegmentationData {
    const service = this.getBestAvailableService();
    if (!service) {
      throw new Error("No segmentation services are available");
    }

    try {
      const segmentation = service.importSegmentation(data.data);

      // Update statistics
      this.statistics.totalSegmentations++;
      if (segmentation.metadata?.source === "manual") {
        this.statistics.manualSegmentations++;
      } else if (segmentation.metadata?.source === "ai_generated") {
        this.statistics.aiGeneratedSegmentations++;
      }

      return segmentation;
    } catch (error) {
      console.error("Failed to import segmentation:", error);
      throw error;
    }
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  /**
   * Ensure the manager is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Register default segmentation services
   */
  private async registerDefaultServices(): Promise<void> {
    try {
      // Register a default segmentation service
      const defaultConfig: SegmentationServiceConfig = {
        name: "default-segmentation",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
        simplifyPolygons: true,
        simplificationTolerance: 2.0,
        timeout: 30000,
        retries: 3,
      };

      await this.registerSegmentationService("default", defaultConfig);

      console.log("🦊 Registered default segmentation service");
    } catch (error) {
      console.error("Failed to register default services:", error);
      // Don't throw - allow partial initialization
    }
  }

  /**
   * Get the best available service
   */
  private getBestAvailableService(): SegmentationService | undefined {
    // For now, return the first available service
    // In the future, this could implement more sophisticated selection logic
    for (const [name, service] of this.segmentationServices) {
      if (this.isServiceAvailable(name)) {
        return service;
      }
    }

    return undefined;
  }

  /**
   * Update statistics from a segmentation result
   */
  private updateStatisticsFromResult(result: SegmentationResult): void {
    if (!result.success || !result.segmentation) {
      return;
    }

    const segmentation = result.segmentation;

    // Update total count
    this.statistics.totalSegmentations++;

    // Update source-specific counts
    if (segmentation.metadata?.source === "manual") {
      this.statistics.manualSegmentations++;
    } else if (segmentation.metadata?.source === "ai_generated") {
      this.statistics.aiGeneratedSegmentations++;
    }

    // Update processing time
    if (result.processingInfo) {
      const processingTime = result.processingInfo.processingTime;
      this.statistics.averageProcessingTime =
        (this.statistics.averageProcessingTime * (this.statistics.totalSegmentations - 1) + processingTime) /
        this.statistics.totalSegmentations;
    }

    // Update quality metrics
    if (result.processingInfo?.qualityMetrics) {
      const metrics = result.processingInfo.qualityMetrics;

      // Update average confidence
      if (segmentation.metadata?.confidence !== undefined) {
        this.statistics.qualityMetrics.averageConfidence =
          (this.statistics.qualityMetrics.averageConfidence * (this.statistics.totalSegmentations - 1) +
            segmentation.metadata.confidence) /
          this.statistics.totalSegmentations;
      }

      // Update average complexity
      this.statistics.qualityMetrics.averageComplexity =
        (this.statistics.qualityMetrics.averageComplexity * (this.statistics.totalSegmentations - 1) +
          metrics.complexity) /
        this.statistics.totalSegmentations;

      // Update average area
      this.statistics.qualityMetrics.averageArea =
        (this.statistics.qualityMetrics.averageArea * (this.statistics.totalSegmentations - 1) + metrics.area) /
        this.statistics.totalSegmentations;
    }

    // Update category statistics
    if (segmentation.metadata?.category) {
      const category = segmentation.metadata.category;
      const existingCategory = this.statistics.topCategories.find(c => c.category === category);

      if (existingCategory) {
        existingCategory.count++;
      } else {
        this.statistics.topCategories.push({ category, count: 1 });
      }

      // Sort by count and keep top 10
      this.statistics.topCategories.sort((a, b) => b.count - a.count);
      this.statistics.topCategories = this.statistics.topCategories.slice(0, 10);
    }
  }

  /**
   * Update statistics from all services
   */
  private async updateStatistics(): Promise<void> {
    // This could be enhanced to gather statistics from all services
    // For now, we rely on the statistics gathered during operations
  }
}

/**
 * Global segmentation manager instance
 */
let globalSegmentationManager: SegmentationManager | undefined;

/**
 * Get the global segmentation manager instance
 */
export function getSegmentationManager(): SegmentationManager {
  if (!globalSegmentationManager) {
    globalSegmentationManager = new SegmentationManager();
  }
  return globalSegmentationManager;
}

/**
 * Initialize the global segmentation manager
 */
export async function initializeSegmentationManager(): Promise<SegmentationManager> {
  const manager = getSegmentationManager();
  await manager.initialize();
  return manager;
}
