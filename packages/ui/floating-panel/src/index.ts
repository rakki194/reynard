/**
 * Reynard Floating Panel System
 *
 * Advanced floating panel system with staggered animations, state management,
 * and sophisticated overlay effects based on Yipyap's BoundingBoxEditor.
 *
 * @packageDocumentation
 */

// Core types
export type {
  FloatingPanel as FloatingPanelType,
  PanelPosition,
  PanelSize,
  PanelConfig,
  PanelTheme,
  OverlayState,
  TransitionPhase,
  OverlayConfig,
  AnimationConfig,
  AnimationTransform,
  StaggeredAnimation,
  PanelState,
  OverlayManagerState,
  PanelEventHandlers,
  FloatingPanelOverlayProps,
  FloatingPanelProps,
  DraggablePanelProps,
  ResizablePanelProps,
  UseFloatingPanelReturn,
  UseOverlayManagerReturn,
  UseStaggeredAnimationReturn,
  PanelConstraints,
  PanelSnapPoints,
  PanelBounds,
  PanelCSSVariables,
  OverlayCSSVariables,
  AdvancedPanelState,
  DraggableResizableOptions,
  DraggableResizableReturn,
} from "./types";

// Core components
export { FloatingPanelOverlay } from "./components/FloatingPanelOverlay";
export { FloatingPanel } from "./components/FloatingPanel";
export { FloatingPanelDebug } from "./components/FloatingPanelDebug";
export { FloatingPanelAdvanced } from "./components/FloatingPanelAdvanced";
export { PanelHeader } from "./components/PanelHeader";

// Composables
export { useOverlayManager } from "./composables/useOverlayManager";
export { useStaggeredAnimation, usePanelAnimation, useMultiPanelAnimation } from "./composables/useStaggeredAnimation";
export { useDraggablePanel } from "./composables/useDraggablePanel";
export { useDraggableResizable } from "./composables/useDraggableResizable";

// Re-export styles
import "./styles.css";
import "./components/FloatingPanelOverlay.css";
import "./components/FloatingPanel.css";
import "./components/FloatingPanelAdvanced.css";
