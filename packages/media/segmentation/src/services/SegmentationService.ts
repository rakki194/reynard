/**
 * Segmentation Service
 *
 * Core service for polygon segmentation operations that integrates with
 * the Reynard AI-shared and annotating-core systems. Provides comprehensive
 * segmentation generation, refinement, and export capabilities.
 */

import {
  BaseAIService,
  ServiceConfig,
  ServiceHealthInfo,
  ServiceHealth,
  ServiceStatus,
  ServiceError,
} from "reynard-ai-shared";
import { BackendAnnotationService, BackendAnnotationServiceConfig } from "reynard-annotating-core";
import { PolygonOps, PointOps, type Point, type Polygon } from "reynard-algorithms";
import {
  SegmentationTask,
  SegmentationResult,
  SegmentationData,
  SegmentationOptions,
  SegmentationSource,
  SegmentationProcessingInfo,
  SegmentationQualityMetrics,
  SegmentationService as ISegmentationService,
} from "../types/index.js";

export interface SegmentationServiceConfig extends ServiceConfig, BackendAnnotationServiceConfig {
  /** Minimum polygon area threshold */
  minArea?: number;
  /** Maximum polygon area threshold */
  maxArea?: number;
  /** Whether to validate polygon geometry */
  validateGeometry?: boolean;
  /** Whether to simplify polygons */
  simplifyPolygons?: boolean;
  /** Simplification tolerance */
  simplificationTolerance?: number;
}

/**
 * Segmentation service that extends BaseAIService for lifecycle management
 * and provides comprehensive polygon segmentation capabilities.
 */
export class SegmentationService extends BaseAIService implements ISegmentationService {
  private backendService: BackendAnnotationService;
  private isBackendConnected = false;
  private lastBackendError?: string;
  private processingStats = {
    totalProcessed: 0,
    averageProcessingTime: 0,
    lastProcessingTime: 0,
    successRate: 0,
    errorCount: 0,
  };
  private config: SegmentationServiceConfig;

  constructor(config: SegmentationServiceConfig) {
    super(config);
    this.config = config;
    this.backendService = new BackendAnnotationService(config);
  }

  // ========================================================================
  // BaseAIService Implementation
  // ========================================================================

  /**
   * Initialize the segmentation service
   */
  async initialize(): Promise<void> {
    try {
      await this.backendService.initialize?.();
      this.isBackendConnected = true;
      this.lastBackendError = undefined;
      this.setStatus(ServiceStatus.READY);
    } catch (error) {
      this.isBackendConnected = false;
      this.lastBackendError = error instanceof Error ? error.message : "Unknown error";
      this.setStatus(ServiceStatus.ERROR);
      throw new ServiceError(
        `Failed to initialize segmentation service: ${this.lastBackendError}`,
        "INITIALIZATION_ERROR"
      );
    }
  }

  /**
   * Get service health information
   */
  async getHealthInfo(): Promise<ServiceHealthInfo> {
    const baseHealth = await super.getHealthInfo();

    return {
      ...baseHealth,
      status: this.isBackendConnected ? ServiceHealth.HEALTHY : ServiceHealth.UNHEALTHY,
      details: {
        ...baseHealth.details,
        backendConnected: this.isBackendConnected,
        lastBackendError: this.lastBackendError,
        processingStats: this.processingStats,
      },
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.backendService.cleanup?.();
      this.isBackendConnected = false;
      this.setStatus(ServiceStatus.STOPPED);
    } catch (error) {
      console.error("Error during segmentation service cleanup:", error);
    }
  }

  // ========================================================================
  // SegmentationService Implementation
  // ========================================================================

  /**
   * Generate segmentation for an image
   */
  async generateSegmentation(task: SegmentationTask): Promise<SegmentationResult> {
    const startTime = Date.now();

    try {
      // Validate task
      this.validateSegmentationTask(task);

      // Convert to caption task for backend processing
      const captionTask = this.convertToCaptionTask(task);

      // Process through backend service
      const captionResult = await this.backendService.generateCaption(captionTask);

      // Convert result back to segmentation format
      const segmentationResult = await this.convertToSegmentationResult(captionResult, task, startTime);

      // Update processing stats
      this.updateProcessingStats(Date.now() - startTime, true);

      return segmentationResult;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateProcessingStats(processingTime, false);

      throw new ServiceError(
        `Segmentation generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "SEGMENTATION_GENERATION_ERROR"
      );
    }
  }

  /**
   * Generate multiple segmentations
   */
  async generateBatchSegmentations(
    tasks: SegmentationTask[],
    progressCallback?: (progress: number) => void
  ): Promise<SegmentationResult[]> {
    const results: SegmentationResult[] = [];
    const total = tasks.length;

    for (let i = 0; i < tasks.length; i++) {
      try {
        const result = await this.generateSegmentation(tasks[i]);
        results.push(result);

        if (progressCallback) {
          progressCallback((i + 1) / total);
        }
      } catch (error) {
        console.error(`Failed to process task ${i + 1}:`, error);
        // Continue with remaining tasks
      }
    }

    return results;
  }

  /**
   * Refine existing segmentation
   */
  async refineSegmentation(segmentation: SegmentationData, options?: SegmentationOptions): Promise<SegmentationResult> {
    const startTime = Date.now();

    try {
      // Validate and optimize polygon
      const optimizedPolygon = this.optimizePolygon(segmentation.polygon, options);

      // Create refined segmentation data
      const refinedSegmentation: SegmentationData = {
        ...segmentation,
        polygon: optimizedPolygon,
        metadata: {
          ...segmentation.metadata,
          source: SegmentationSource.REFINED,
          confidence: this.calculateConfidence(optimizedPolygon),
        },
        updatedAt: new Date(),
      };

      // Create processing info
      const processingInfo: SegmentationProcessingInfo = {
        processingTime: Date.now() - startTime,
        algorithm: "polygon_optimization",
        qualityMetrics: this.calculateQualityMetrics(optimizedPolygon),
      };

      // Update processing stats
      this.updateProcessingStats(Date.now() - startTime, true);

      return {
        success: true,
        type: "segmentation",
        segmentation: refinedSegmentation,
        processingInfo,
        timestamp: new Date(),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateProcessingStats(processingTime, false);

      throw new ServiceError(
        `Segmentation refinement failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "SEGMENTATION_REFINEMENT_ERROR"
      );
    }
  }

  /**
   * Validate segmentation geometry
   */
  validateSegmentation(segmentation: SegmentationData): boolean {
    try {
      const polygon = segmentation.polygon;

      // Check minimum points
      if (polygon.points.length < 3) {
        return false;
      }

      // Check for valid polygon area
      const area = PolygonOps.area(polygon);
      if (area <= 0) {
        return false;
      }

      // Check for self-intersections (basic check)
      if (this.hasSelfIntersections(polygon)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Export segmentation data
   */
  exportSegmentation(segmentation: SegmentationData, format: string): Record<string, unknown> {
    switch (format.toLowerCase()) {
      case "coco":
        return this.exportToCOCO(segmentation);
      case "yolo":
        return this.exportToYOLO(segmentation);
      case "pascal_voc":
        return this.exportToPascalVOC(segmentation);
      case "reynard":
        return this.exportToReynard(segmentation);
      default:
        throw new ServiceError(`Unsupported export format: ${format}`, "UNSUPPORTED_EXPORT_FORMAT");
    }
  }

  /**
   * Import segmentation data
   */
  importSegmentation(data: Record<string, unknown>): SegmentationData {
    // Implementation depends on format
    // For now, return a basic structure
    return {
      id: (data.id as string) || `seg_${Date.now()}`,
      polygon: (data.polygon as Polygon) || { points: [] },
      caption: data.caption as any,
      metadata: {
        ...(data.metadata as Record<string, unknown>),
        source: SegmentationSource.IMPORTED,
      },
      createdAt: new Date((data.createdAt as number) || Date.now()),
      updatedAt: new Date((data.updatedAt as number) || Date.now()),
    };
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  /**
   * Validate segmentation task
   */
  private validateSegmentationTask(task: SegmentationTask): void {
    if (!task.imagePath) {
      throw new ServiceError("Image path is required", "INVALID_TASK");
    }

    if (task.type !== "segmentation") {
      throw new ServiceError("Task type must be 'segmentation'", "INVALID_TASK");
    }
  }

  /**
   * Convert segmentation task to caption task
   */
  private convertToCaptionTask(task: SegmentationTask): any {
    return {
      ...task,
      type: "caption",
      // Add segmentation-specific metadata
      metadata: {
        ...task.metadata,
        segmentationOptions: task.options,
      },
    };
  }

  /**
   * Convert caption result to segmentation result
   */
  private async convertToSegmentationResult(
    captionResult: Record<string, unknown>,
    _originalTask: SegmentationTask,
    startTime: number
  ): Promise<SegmentationResult> {
    // This is a placeholder - in a real implementation, you would
    // parse the caption result to extract polygon information
    const mockPolygon: Polygon = {
      points: [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 },
        { x: 100, y: 200 },
      ],
    };

    const segmentation: SegmentationData = {
      id: `seg_${Date.now()}`,
      polygon: mockPolygon,
      caption: captionResult.caption,
      metadata: {
        source: SegmentationSource.AI_GENERATED,
        confidence: 0.85,
        category: "object",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const processingInfo: SegmentationProcessingInfo = {
      processingTime: Date.now() - startTime,
      algorithm: "ai_segmentation",
      modelVersion: "1.0.0",
      qualityMetrics: this.calculateQualityMetrics(mockPolygon),
    };

    return {
      success: true,
      type: "segmentation",
      segmentation,
      processingInfo,
      timestamp: new Date(),
    };
  }

  /**
   * Optimize polygon geometry
   */
  private optimizePolygon(polygon: Polygon, options?: SegmentationOptions): Polygon {
    let optimized = { ...polygon };

    // Simplify if requested
    if (options?.simplify && options.simplificationTolerance) {
      // Use algorithms package for simplification
      // This is a placeholder - implement actual simplification
      optimized = PolygonOps.create(optimized.points);
    }

    // Validate geometry if requested
    if (options?.validateGeometry) {
      if (
        !this.validateSegmentation({
          id: "temp",
          polygon: optimized,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ) {
        throw new ServiceError("Invalid polygon geometry", "INVALID_GEOMETRY");
      }
    }

    return optimized;
  }

  /**
   * Calculate confidence score for polygon
   */
  private calculateConfidence(polygon: Polygon): number {
    const area = PolygonOps.area(polygon);
    const perimeter = this.calculatePerimeter(polygon);

    // Simple confidence calculation based on area and complexity
    const complexity = polygon.points.length;
    const areaScore = Math.min(area / 10000, 1); // Normalize area
    const complexityScore = Math.min(complexity / 20, 1); // Normalize complexity

    return (areaScore + complexityScore) / 2;
  }

  /**
   * Calculate polygon perimeter
   */
  private calculatePerimeter(polygon: Polygon): number {
    if (polygon.points.length < 2) return 0;

    let _perimeter = 0;
    for (let i = 0; i < polygon.points.length; i++) {
      const current = polygon.points[i];
      const next = polygon.points[(i + 1) % polygon.points.length];
      _perimeter += PointOps.distance(current, next);
    }

    return _perimeter;
  }

  /**
   * Calculate quality metrics for polygon
   */
  private calculateQualityMetrics(polygon: Polygon): SegmentationQualityMetrics {
    const area = PolygonOps.area(polygon);
    const perimeter = this.calculatePerimeter(polygon);
    const complexity = polygon.points.length;

    // Calculate bounding box
    const xs = polygon.points.map(p => p.x);
    const ys = polygon.points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;
    const aspectRatio = width / height;

    return {
      area,
      perimeter,
      complexity,
      boundingBox: { width, height },
      aspectRatio,
    };
  }

  /**
   * Check for polygon self-intersections
   */
  private hasSelfIntersections(polygon: Polygon): boolean {
    // Basic self-intersection check
    // This is a simplified implementation
    const points = polygon.points;

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 2; j < points.length; j++) {
        if (
          this.linesIntersect(points[i], points[(i + 1) % points.length], points[j], points[(j + 1) % points.length])
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if two line segments intersect
   */
  private linesIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    // Line intersection algorithm
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(denom) < 1e-10) return false; // Lines are parallel

    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  /**
   * Update processing statistics
   */
  private updateProcessingStats(processingTime: number, success: boolean = true): void {
    this.processingStats.totalProcessed++;
    this.processingStats.lastProcessingTime = processingTime;
    this.processingStats.averageProcessingTime =
      (this.processingStats.averageProcessingTime * (this.processingStats.totalProcessed - 1) + processingTime) /
      this.processingStats.totalProcessed;

    if (!success) {
      this.processingStats.errorCount++;
    }

    this.processingStats.successRate =
      (this.processingStats.totalProcessed - this.processingStats.errorCount) / this.processingStats.totalProcessed;
  }

  /**
   * Export to COCO format
   */
  private exportToCOCO(segmentation: SegmentationData): Record<string, unknown> {
    return {
      id: segmentation.id,
      category_id: 1, // Default category
      segmentation: {
        counts: this.polygonToRLE(segmentation.polygon),
        size: [800, 600], // Default size
      },
      area: PolygonOps.area(segmentation.polygon),
      bbox: this.polygonToBBox(segmentation.polygon),
      iscrowd: 0,
    };
  }

  /**
   * Export to YOLO format
   */
  private exportToYOLO(segmentation: SegmentationData): Record<string, unknown> {
    const bbox = this.polygonToBBox(segmentation.polygon);
    return {
      class_id: 0, // Default class
      x_center: bbox.x + bbox.width / 2,
      y_center: bbox.y + bbox.height / 2,
      width: bbox.width,
      height: bbox.height,
    };
  }

  /**
   * Export to Pascal VOC format
   */
  private exportToPascalVOC(segmentation: SegmentationData): Record<string, unknown> {
    return {
      object: {
        name: segmentation.metadata?.category || "object",
        bndbox: this.polygonToBBox(segmentation.polygon),
        polygon: segmentation.polygon.points,
      },
    };
  }

  /**
   * Export to Reynard format
   */
  private exportToReynard(segmentation: SegmentationData): Record<string, unknown> {
    return {
      id: segmentation.id,
      polygon: segmentation.polygon,
      caption: segmentation.caption,
      metadata: segmentation.metadata,
      createdAt: segmentation.createdAt,
      updatedAt: segmentation.updatedAt,
    };
  }

  /**
   * Convert polygon to RLE (Run Length Encoding)
   */
  private polygonToRLE(_polygon: Polygon): number[] {
    // Simplified RLE conversion
    // In a real implementation, you would convert the polygon to a mask
    // and then encode it as RLE
    return [0, 0, 0, 0]; // Placeholder
  }

  /**
   * Convert polygon to bounding box
   */
  private polygonToBBox(polygon: Polygon): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const xs = polygon.points.map(p => p.x);
    const ys = polygon.points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}
