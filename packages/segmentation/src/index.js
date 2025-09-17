/**
 * Reynard Segmentation Package
 *
 * Comprehensive polygon segmentation system for the Reynard annotation framework.
 * Integrates with existing Reynard packages for a unified annotation experience.
 *
 * @packageDocumentation
 */
// ========================================================================
// Services
// ========================================================================
export { SegmentationService } from "./services/SegmentationService.js";
export { SegmentationManager, getSegmentationManager, initializeSegmentationManager, } from "./services/SegmentationManager.js";
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
// Version Information
// ========================================================================
export const VERSION = "0.1.0";
export const PACKAGE_NAME = "reynard-segmentation";
// ========================================================================
// Default Exports
// ========================================================================
// Main component for easy importing
export { SegmentationEditor as default } from "./components/SegmentationEditor.js";
