/**
 * Reynard Segmentation Package
 *
 * Comprehensive polygon segmentation system for the Reynard annotation framework.
 * Integrates with existing Reynard packages for a unified annotation experience.
 *
 * @packageDocumentation
 */

// ========================================================================
// Core Types and Interfaces
// ========================================================================

export type {
  SegmentationManager as ISegmentationManager,
  // Service types
  SegmentationService as ISegmentationService,
  // Core segmentation types
  SegmentationData,
  // Editor types
  SegmentationEditorConfig,
  SegmentationEditorEvents,
  SegmentationEditorState,
  SegmentationExportData,
  // Export/Import types
  SegmentationExportFormat,
  SegmentationMetadata,
  SegmentationOptions,
  SegmentationProcessingInfo,
  SegmentationQualityMetrics,
  SegmentationResult,
  SegmentationSource,
  SegmentationStatistics,
  SegmentationTask,
} from "./types/index.js";

// ========================================================================
// Services
// ========================================================================

export { SegmentationService, type SegmentationServiceConfig } from "./services/SegmentationService.js";

export {
  SegmentationManager,
  getSegmentationManager,
  initializeSegmentationManager,
} from "./services/SegmentationManager.js";

// ========================================================================
// Components
// ========================================================================

export { SegmentationCanvas } from "./components/SegmentationCanvas.js";
export { SegmentationEditor } from "./components/SegmentationEditor.js";
export { SegmentationPanel } from "./components/SegmentationPanel.js";
export { SegmentationToolbar } from "./components/SegmentationToolbar.js";

// ========================================================================
// Composables
// ========================================================================

export { useCanvasInteraction } from "./composables/useCanvasInteraction.js";
export { usePolygonEditor } from "./composables/usePolygonEditor.js";
export { useSegmentationEditor } from "./composables/useSegmentationEditor.js";

// ========================================================================
// Utilities and Helpers
// ========================================================================

// Re-export commonly used types from dependencies
export type { Point, Polygon } from "reynard-algorithms";
export type { CaptionData, CaptionType } from "reynard-caption-core";

// ========================================================================
// Version Information
// ========================================================================

export const VERSION = "0.1.0";
export const PACKAGE_NAME = "reynard-segmentation";

// ========================================================================
// Default Exports
// ========================================================================

// Main component for easy importing
export { SegmentationEditor as default } from "./components/SegmentationEditor.js";
