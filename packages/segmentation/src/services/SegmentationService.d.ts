/**
 * Segmentation Service
 *
 * Core service for polygon segmentation operations that integrates with
 * the Reynard AI-shared and annotating-core systems. Provides comprehensive
 * segmentation generation, refinement, and export capabilities.
 */
import { ServiceConfig, ServiceHealthInfo } from "reynard-ai-shared";
import { BackendAnnotationServiceConfig } from "reynard-annotating-core";
import { SegmentationTask, SegmentationResult, SegmentationData, SegmentationOptions, SegmentationService as ISegmentationService } from "../types/index.js";
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
export declare class SegmentationService extends BaseAIService implements ISegmentationService {
    private backendService;
    private isBackendConnected;
    private lastBackendError?;
    private processingStats;
    private config;
    constructor(config: SegmentationServiceConfig);
    /**
     * Initialize the segmentation service
     */
    initialize(): Promise<void>;
    /**
     * Get service health information
     */
    getHealthInfo(): Promise<ServiceHealthInfo>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Generate segmentation for an image
     */
    generateSegmentation(task: SegmentationTask): Promise<SegmentationResult>;
    /**
     * Generate multiple segmentations
     */
    generateBatchSegmentations(tasks: SegmentationTask[], progressCallback?: (progress: number) => void): Promise<SegmentationResult[]>;
    /**
     * Refine existing segmentation
     */
    refineSegmentation(segmentation: SegmentationData, options?: SegmentationOptions): Promise<SegmentationResult>;
    /**
     * Validate segmentation geometry
     */
    validateSegmentation(segmentation: SegmentationData): boolean;
    /**
     * Export segmentation data
     */
    exportSegmentation(segmentation: SegmentationData, format: string): Record<string, unknown>;
    /**
     * Import segmentation data
     */
    importSegmentation(data: Record<string, unknown>): SegmentationData;
    /**
     * Validate segmentation task
     */
    private validateSegmentationTask;
    /**
     * Convert segmentation task to caption task
     */
    private convertToCaptionTask;
    /**
     * Convert caption result to segmentation result
     */
    private convertToSegmentationResult;
    /**
     * Optimize polygon geometry
     */
    private optimizePolygon;
    /**
     * Calculate confidence score for polygon
     */
    private calculateConfidence;
    /**
     * Calculate polygon perimeter
     */
    private calculatePerimeter;
    /**
     * Calculate quality metrics for polygon
     */
    private calculateQualityMetrics;
    /**
     * Check for polygon self-intersections
     */
    private hasSelfIntersections;
    /**
     * Check if two line segments intersect
     */
    private linesIntersect;
    /**
     * Update processing statistics
     */
    private updateProcessingStats;
    /**
     * Export to COCO format
     */
    private exportToCOCO;
    /**
     * Export to YOLO format
     */
    private exportToYOLO;
    /**
     * Export to Pascal VOC format
     */
    private exportToPascalVOC;
    /**
     * Export to Reynard format
     */
    private exportToReynard;
    /**
     * Convert polygon to RLE (Run Length Encoding)
     */
    private polygonToRLE;
    /**
     * Convert polygon to bounding box
     */
    private polygonToBBox;
}
