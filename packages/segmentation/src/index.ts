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
  // Core segmentation types
  SegmentationData,
  SegmentationMetadata,
  SegmentationSource,
  SegmentationTask,
  SegmentationResult,
  SegmentationOptions,
  SegmentationProcessingInfo,
  SegmentationQualityMetrics,

  // Editor types
  SegmentationEditorConfig,
  SegmentationEditorState,
  SegmentationEditorEvents,

  // Export/Import types
  SegmentationExportFormat,
  SegmentationExportData,

  // Service types
  SegmentationService as ISegmentationService,
  SegmentationManager as ISegmentationManager,
  SegmentationStatistics,
} from "./types/index.js";

// ========================================================================
// Services
// ========================================================================

export {
  SegmentationService,
  type SegmentationServiceConfig,
} from "./services/SegmentationService.js";

export {
  SegmentationManager,
  getSegmentationManager,
  initializeSegmentationManager,
} from "./services/SegmentationManager.js";

// ========================================================================
// Components
// ========================================================================

export { SegmentationEditor } from "./components/SegmentationEditor.js";
export { SegmentationCanvas } from "./components/SegmentationCanvas.js";
export { SegmentationToolbar } from "./components/SegmentationToolbar.js";
export { SegmentationPanel } from "./components/SegmentationPanel.js";

// ========================================================================
// Composables
// ========================================================================

export { useSegmentationEditor } from "./composables/useSegmentationEditor.js";
export { usePolygonEditor } from "./composables/usePolygonEditor.js";
export { useCanvasInteraction } from "./composables/useCanvasInteraction.js";

// ========================================================================
// Utilities and Helpers
// ========================================================================

// Re-export commonly used types from dependencies
export type { Point, Polygon } from "reynard-algorithms";
export type { CaptionData, CaptionType } from "reynard-caption";

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
