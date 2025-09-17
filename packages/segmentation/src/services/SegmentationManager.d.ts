/**
 * Segmentation Manager
 *
 * Central manager for segmentation services that integrates with the
 * Reynard annotation system and provides unified access to segmentation
 * capabilities. Coordinates multiple segmentation services and provides
 * comprehensive statistics and management features.
 */
import { ServiceRegistry } from "reynard-ai-shared";
import { AnnotationServiceRegistry } from "reynard-annotating-core";
import { SegmentationService, SegmentationServiceConfig } from "./SegmentationService.js";
import { SegmentationTask, SegmentationResult, SegmentationData, SegmentationOptions, SegmentationExportFormat, SegmentationExportData, SegmentationStatistics, SegmentationManager as ISegmentationManager, SegmentationService as ISegmentationService } from "../types/index.js";
/**
 * Segmentation manager that coordinates multiple segmentation services
 * and provides comprehensive management capabilities.
 */
export declare class SegmentationManager implements ISegmentationManager {
    private serviceRegistry;
    private annotationServiceRegistry;
    private segmentationServices;
    private isInitialized;
    private statistics;
    private errorCount;
    private lastError?;
    constructor(serviceRegistry?: ServiceRegistry, annotationServiceRegistry?: AnnotationServiceRegistry);
    /**
     * Initialize the segmentation system
     */
    initialize(): Promise<void>;
    /**
     * Get available segmentation services
     */
    getAvailableServices(): Promise<string[]>;
    /**
     * Get segmentation service by name
     */
    getService(name: string): ISegmentationService | undefined;
    /**
     * Check if service is available
     */
    isServiceAvailable(name: string): boolean;
    /**
     * Get segmentation statistics
     */
    getStatistics(): Promise<SegmentationStatistics>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Register a segmentation service
     */
    registerSegmentationService(name: string, config: SegmentationServiceConfig): Promise<SegmentationService>;
    /**
     * Unregister a segmentation service
     */
    unregisterSegmentationService(name: string): Promise<void>;
    /**
     * Generate segmentation using the best available service
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
     * Validate segmentation
     */
    validateSegmentation(segmentation: SegmentationData): boolean;
    /**
     * Export segmentation data
     */
    exportSegmentation(segmentation: SegmentationData, format: SegmentationExportFormat): SegmentationExportData;
    /**
     * Import segmentation data
     */
    importSegmentation(data: SegmentationExportData): SegmentationData;
    /**
     * Ensure the manager is initialized
     */
    private ensureInitialized;
    /**
     * Register default segmentation services
     */
    private registerDefaultServices;
    /**
     * Get the best available service
     */
    private getBestAvailableService;
    /**
     * Update statistics from a segmentation result
     */
    private updateStatisticsFromResult;
    /**
     * Update statistics from all services
     */
    private updateStatistics;
}
/**
 * Get the global segmentation manager instance
 */
export declare function getSegmentationManager(): SegmentationManager;
/**
 * Initialize the global segmentation manager
 */
export declare function initializeSegmentationManager(): Promise<SegmentationManager>;
