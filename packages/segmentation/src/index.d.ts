/**
 * Reynard Segmentation Package
 *
 * Comprehensive polygon segmentation system for the Reynard annotation framework.
 * Integrates with existing Reynard packages for a unified annotation experience.
 *
 * @packageDocumentation
 */
export type { SegmentationManager as ISegmentationManager, SegmentationService as ISegmentationService, SegmentationData, SegmentationEditorConfig, SegmentationEditorEvents, SegmentationEditorState, SegmentationExportData, SegmentationExportFormat, SegmentationMetadata, SegmentationOptions, SegmentationProcessingInfo, SegmentationQualityMetrics, SegmentationResult, SegmentationSource, SegmentationStatistics, SegmentationTask, } from "./types/index.js";
export { SegmentationService, type SegmentationServiceConfig } from "./services/SegmentationService.js";
export { SegmentationManager, getSegmentationManager, initializeSegmentationManager, } from "./services/SegmentationManager.js";
export { SegmentationCanvas } from "./components/SegmentationCanvas.js";
export { SegmentationEditor } from "./components/SegmentationEditor.js";
export { SegmentationPanel } from "./components/SegmentationPanel.js";
export { SegmentationToolbar } from "./components/SegmentationToolbar.js";
export { useCanvasInteraction } from "./composables/useCanvasInteraction.js";
export { usePolygonEditor } from "./composables/usePolygonEditor.js";
export { useSegmentationEditor } from "./composables/useSegmentationEditor.js";
export type { Point, Polygon } from "reynard-algorithms";
export type { CaptionData, CaptionType } from "reynard-caption-core";
export declare const VERSION = "0.1.0";
export declare const PACKAGE_NAME = "reynard-segmentation";
export { SegmentationEditor as default } from "./components/SegmentationEditor.js";
