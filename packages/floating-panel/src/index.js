/**
 * Reynard Floating Panel System
 *
 * Advanced floating panel system with staggered animations, state management,
 * and sophisticated overlay effects based on Yipyap's BoundingBoxEditor.
 *
 * @packageDocumentation
 */
// Core components
export { FloatingPanelOverlay } from "./components/FloatingPanelOverlay";
export { FloatingPanel } from "./components/FloatingPanel";
export { FloatingPanelDebug } from "./components/FloatingPanelDebug";
export { FloatingPanelAdvanced } from "./components/FloatingPanelAdvanced";
export { PanelHeader } from "./components/PanelHeader";
// Composables
export { useOverlayManager } from "./composables/useOverlayManager";
export { useStaggeredAnimation, usePanelAnimation, useMultiPanelAnimation, } from "./composables/useStaggeredAnimation";
export { useDraggablePanel } from "./composables/useDraggablePanel";
export { useDraggableResizable } from "./composables/useDraggableResizable";
// Re-export styles
import "./styles.css";
import "./components/FloatingPanelOverlay.css";
import "./components/FloatingPanel.css";
import "./components/FloatingPanelAdvanced.css";
