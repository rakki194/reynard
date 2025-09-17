/**
 * Segmentation Types
 *
 * Core types and interfaces for the Reynard segmentation system.
 * Extends existing annotation types with polygon-specific functionality.
 */
import type { Point, Polygon } from "reynard-algorithms";
import type { CaptionTask, CaptionResult } from "reynard-annotating-core";
import type { CaptionData } from "reynard-caption";
/**
 * Segmentation annotation data
 */
export interface SegmentationData {
    /** Unique identifier for the segmentation */
    id: string;
    /** Polygon points defining the segmentation boundary */
    polygon: Polygon;
    /** Associated caption/label data */
    caption?: CaptionData;
    /** Metadata for the segmentation */
    metadata?: SegmentationMetadata;
    /** Creation timestamp */
    createdAt: Date;
    /** Last modification timestamp */
    updatedAt: Date;
}
/**
 * Segmentation metadata
 */
export interface SegmentationMetadata {
    /** Confidence score for the segmentation (0-1) */
    confidence?: number;
    /** Source of the segmentation (manual, ai, imported) */
    source: SegmentationSource;
    /** Category or class of the segmented object */
    category?: string;
    /** Additional custom properties */
    properties?: Record<string, any>;
}
/**
 * Sources of segmentation data
 */
export declare enum SegmentationSource {
    MANUAL = "manual",
    AI_GENERATED = "ai_generated",
    IMPORTED = "imported",
    REFINED = "refined"
}
/**
 * Segmentation task for processing
 */
export interface SegmentationTask extends Omit<CaptionTask, "type"> {
    /** Task type identifier */
    type: "segmentation";
    /** Image path or URL to segment */
    imagePath: string;
    /** Optional existing segmentation to refine */
    existingSegmentation?: SegmentationData;
    /** Segmentation-specific options */
    options?: SegmentationOptions;
}
/**
 * Segmentation processing options
 */
export interface SegmentationOptions {
    /** Minimum polygon area threshold */
    minArea?: number;
    /** Maximum polygon area threshold */
    maxArea?: number;
    /** Minimum number of polygon points */
    minPoints?: number;
    /** Maximum number of polygon points */
    maxPoints?: number;
    /** Whether to simplify the polygon */
    simplify?: boolean;
    /** Simplification tolerance */
    simplificationTolerance?: number;
    /** Whether to validate polygon geometry */
    validateGeometry?: boolean;
}
/**
 * Segmentation result from processing
 */
export interface SegmentationResult extends Omit<CaptionResult, "type"> {
    /** Result type identifier */
    type: "segmentation";
    /** Generated segmentation data */
    segmentation: SegmentationData;
    /** Processing metadata */
    processingInfo?: SegmentationProcessingInfo;
}
/**
 * Segmentation processing information
 */
export interface SegmentationProcessingInfo {
    /** Processing time in milliseconds */
    processingTime: number;
    /** Algorithm used for segmentation */
    algorithm: string;
    /** Model version used */
    modelVersion?: string;
    /** Quality metrics */
    qualityMetrics?: SegmentationQualityMetrics;
}
/**
 * Quality metrics for segmentation
 */
export interface SegmentationQualityMetrics {
    /** Polygon area */
    area: number;
    /** Polygon perimeter */
    perimeter: number;
    /** Polygon complexity (number of points) */
    complexity: number;
    /** Bounding box dimensions */
    boundingBox: {
        width: number;
        height: number;
    };
    /** Aspect ratio */
    aspectRatio: number;
}
/**
 * Segmentation editor configuration
 */
export interface SegmentationEditorConfig {
    /** Whether editing is enabled */
    enabled: boolean;
    /** Whether to show grid */
    showGrid: boolean;
    /** Grid size in pixels */
    gridSize: number;
    /** Whether to snap to grid */
    snapToGrid: boolean;
    /** Whether to show polygon vertices */
    showVertices: boolean;
    /** Vertex size in pixels */
    vertexSize: number;
    /** Whether to show polygon edges */
    showEdges: boolean;
    /** Edge thickness in pixels */
    edgeThickness: number;
    /** Whether to show polygon fill */
    showFill: boolean;
    /** Fill opacity (0-1) */
    fillOpacity: number;
    /** Whether to show bounding box */
    showBoundingBox: boolean;
    /** Whether to allow vertex editing */
    allowVertexEdit: boolean;
    /** Whether to allow edge editing */
    allowEdgeEdit: boolean;
    /** Whether to allow polygon creation */
    allowPolygonCreation: boolean;
    /** Whether to allow polygon deletion */
    allowPolygonDeletion: boolean;
    /** Maximum number of polygons */
    maxPolygons: number;
    /** Minimum polygon area */
    minPolygonArea: number;
    /** Maximum polygon area */
    maxPolygonArea: number;
}
/**
 * Segmentation editor state
 */
export interface SegmentationEditorState {
    /** Currently selected segmentation */
    selectedSegmentation?: string;
    /** Currently hovered segmentation */
    hoveredSegmentation?: string;
    /** Currently editing segmentation */
    editingSegmentation?: string;
    /** Whether the editor is in creation mode */
    isCreating: boolean;
    /** Whether the editor is in edit mode */
    isEditing: boolean;
    /** Current mouse position */
    mousePosition?: Point;
    /** Current zoom level */
    zoom: number;
    /** Current pan offset */
    panOffset: Point;
}
/**
 * Segmentation editor events
 */
export interface SegmentationEditorEvents {
    /** Called when a segmentation is selected */
    onSegmentationSelect?: (segmentationId: string) => void;
    /** Called when a segmentation is created */
    onSegmentationCreate?: (segmentation: SegmentationData) => void;
    /** Called when a segmentation is updated */
    onSegmentationUpdate?: (segmentation: SegmentationData) => void;
    /** Called when a segmentation is deleted */
    onSegmentationDelete?: (segmentationId: string) => void;
    /** Called when the editor state changes */
    onStateChange?: (state: SegmentationEditorState) => void;
    /** Called when the mouse position changes */
    onMouseMove?: (position: Point) => void;
    /** Called when the zoom level changes */
    onZoomChange?: (zoom: number) => void;
    /** Called when the pan offset changes */
    onPanChange?: (offset: Point) => void;
}
/**
 * Segmentation export formats
 */
export declare enum SegmentationExportFormat {
    COCO = "coco",
    YOLO = "yolo",
    PASCAL_VOC = "pascal_voc",
    LABELME = "labelme",
    REYNARD = "reynard"
}
/**
 * Segmentation export data
 */
export interface SegmentationExportData {
    /** Export format */
    format: SegmentationExportFormat;
    /** Exported data */
    data: any;
    /** Export metadata */
    metadata?: {
        version: string;
        timestamp: Date;
        source: string;
    };
}
/**
 * Segmentation service interface
 */
export interface SegmentationService {
    /** Generate segmentation for an image */
    generateSegmentation(task: SegmentationTask): Promise<SegmentationResult>;
    /** Generate multiple segmentations */
    generateBatchSegmentations(tasks: SegmentationTask[], progressCallback?: (progress: number) => void): Promise<SegmentationResult[]>;
    /** Refine existing segmentation */
    refineSegmentation(segmentation: SegmentationData, options?: SegmentationOptions): Promise<SegmentationResult>;
    /** Validate segmentation geometry */
    validateSegmentation(segmentation: SegmentationData): boolean;
    /** Export segmentation data */
    exportSegmentation(segmentation: SegmentationData, format: SegmentationExportFormat): SegmentationExportData;
    /** Import segmentation data */
    importSegmentation(data: SegmentationExportData): SegmentationData;
}
/**
 * Segmentation manager interface
 */
export interface SegmentationManager {
    /** Initialize the segmentation system */
    initialize(): Promise<void>;
    /** Get available segmentation services */
    getAvailableServices(): Promise<string[]>;
    /** Get segmentation service by name */
    getService(name: string): SegmentationService | undefined;
    /** Check if service is available */
    isServiceAvailable(name: string): boolean;
    /** Get segmentation statistics */
    getStatistics(): Promise<SegmentationStatistics>;
    /** Cleanup resources */
    cleanup(): Promise<void>;
}
/**
 * Segmentation statistics
 */
export interface SegmentationStatistics {
    /** Total number of segmentations */
    totalSegmentations: number;
    /** Number of manual segmentations */
    manualSegmentations: number;
    /** Number of AI-generated segmentations */
    aiGeneratedSegmentations: number;
    /** Average processing time */
    averageProcessingTime: number;
    /** Most used categories */
    topCategories: Array<{
        category: string;
        count: number;
    }>;
    /** Quality metrics */
    qualityMetrics: {
        averageConfidence: number;
        averageComplexity: number;
        averageArea: number;
    };
}
