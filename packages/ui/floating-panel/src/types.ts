/**
 * Core types for the Reynard Floating Panel system
 * Based on Yipyap's sophisticated BoundingBoxEditor implementation
 */

// Core Panel Types
export type { FloatingPanel, PanelPosition, PanelSize } from "./types/core/PanelTypes.js";
export type { PanelConfig, PanelTheme } from "./types/core/PanelConfig.js";
export type { PanelConstraints, PanelSnapPoints } from "./types/core/PanelConstraints.js";
export type { PanelEventHandlers, FloatingPanelProps } from "./types/core/PanelEvents.js";

// Re-export for internal use
import type { FloatingPanel, PanelPosition } from "./types/core/PanelTypes.js";
import type { PanelEventHandlers } from "./types/core/PanelEvents.js";

// Additional missing types that need to be exported
export interface AnimationConfig {
  baseDelay: number;
  staggerStep: number;
  maxDelay: number;
  direction: "forward" | "reverse" | "center-out";
  duration: number;
  easing: string;
  transform: {
    entrance: string;
    exit: string;
    scale?: number;
    translateX?: number;
    translateY?: number;
  };
}

export interface AnimationTransform {
  entrance: string;
  exit: string;
  scale?: number;
  translateX?: number;
  translateY?: number;
}

export interface StaggeredAnimation {
  isAnimating: boolean;
  currentIndex: number;
  totalItems: number;
  config: AnimationConfig;
}

export interface PanelState {
  position: PanelPosition;
  size: { width: number; height: number };
  isVisible: boolean;
  isDragging: boolean;
  isResizing: boolean;
}

export interface OverlayManagerState {
  isActive: boolean;
  panels: FloatingPanel[];
  activePanelId?: string;
  hoveredPanelId?: string;
}

export interface FloatingPanelOverlayProps {
  panels: FloatingPanel[];
  config?: OverlayConfig;
  isActive?: boolean;
  transitionPhase?: TransitionPhase;
  class?: string;
  onPanelShow?: (panel: FloatingPanel) => void;
  onPanelHide?: (panel: FloatingPanel) => void;
  onPanelDrag?: (panel: FloatingPanel, position: PanelPosition) => void;
  onPanelResize?: (panel: FloatingPanel, size: { width: number; height: number }) => void;
  onTransitionStart?: (phase: TransitionPhase) => void;
  onTransitionEnd?: (phase: TransitionPhase) => void;
  onPointerDown?: (event: PointerEvent) => void;
  onPointerMove?: (event: PointerEvent) => void;
  onPointerUp?: (event: PointerEvent) => void;
  onMouseMove?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  children?: any;
}

export interface DraggablePanelProps {
  position: PanelPosition;
  size?: { width: number; height: number };
  draggable?: boolean;
  resizable?: boolean;
  constraints?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
  onDrag?: (position: PanelPosition) => void;
  onResize?: (size: { width: number; height: number }) => void;
}

export interface ResizablePanelProps {
  size: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  onResize?: (size: { width: number; height: number }) => void;
}

export interface PanelBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface PanelCSSVariables {
  "--panel-x": string;
  "--panel-y": string;
  "--panel-width": string;
  "--panel-height": string;
  "--panel-z-index": string;
}

export interface OverlayCSSVariables {
  "--overlay-backdrop-color": string;
  "--overlay-backdrop-opacity": string;
  "--overlay-backdrop-blur": string;
  "--overlay-z-index": string;
}

export interface AdvancedPanelState extends PanelState {
  animationPhase: "entering" | "visible" | "exiting" | "hidden";
  transform: string;
  opacity: number;
}

export interface DraggableResizableOptions {
  draggable?: boolean;
  resizable?: boolean;
  constraints?: PanelBounds;
  snapPoints?: Array<{ x: number; y: number }>;
  onDrag?: (position: PanelPosition) => void;
  onResize?: (size: { width: number; height: number }) => void;
}

export interface DraggableResizableReturn {
  position: () => PanelPosition;
  setPosition: (position: PanelPosition) => void;
  size: () => { width: number; height: number };
  setSize: (size: { width: number; height: number }) => void;
  isDragging: () => boolean;
  isResizing: () => boolean;
  startDrag: (event: globalThis.PointerEvent) => void;
  startResize: (event: globalThis.PointerEvent) => void;
  updateDrag: (event: globalThis.PointerEvent) => void;
  updateResize: (event: globalThis.PointerEvent) => void;
  endDrag: () => void;
  endResize: () => void;
}

// Overlay Types
export interface OverlayState {
  isActive: boolean;
  transitionPhase: TransitionPhase;
  backdropVisible: boolean;
  panels: FloatingPanel[];
  activePanelId?: string;
  hoveredPanelId?: string;
  lastInteraction: number;
}

export type TransitionPhase = "idle" | "showing" | "hiding" | "visible";

export interface OverlayConfig {
  backdropBlur?: number;
  backdropColor?: string;
  backdropOpacity?: number;
  outlineColor?: string;
  outlineStyle?: string;
  outlineWidth?: number;
  transitionDuration?: number;
  transitionEasing?: string;
  zIndex?: number;
}

// Composable Return Types
export interface UseFloatingPanelReturn {
  position: () => PanelPosition;
  setPosition: (position: PanelPosition) => void;
}

export interface UseOverlayManagerOptions {
  config?: OverlayConfig;
  eventHandlers?: PanelEventHandlers;
  autoHideDelay?: number;
  initialPanels?: FloatingPanel[];
  onPanelShow?: (panel: FloatingPanel) => void;
  onPanelHide?: (panel: FloatingPanel) => void;
  onPanelDrag?: (panel: FloatingPanel, position: PanelPosition) => void;
  onPanelResize?: (panel: FloatingPanel, size: { width: number; height: number }) => void;
}

export interface UseOverlayManagerReturn {
  overlayState: () => OverlayState;
  setOverlayState: (state: OverlayState) => void;
  config: OverlayConfig;
  eventHandlers: PanelEventHandlers;
  showPanel: (panelId: string) => void;
  hidePanel: (panelId: string) => void;
  togglePanel: (panelId: string) => void;
  handlePanelShow: (panel: FloatingPanel) => void;
  handlePanelHide: (panel: FloatingPanel) => void;
  handlePanelDrag: (panel: FloatingPanel, position: PanelPosition) => void;
  handlePanelResize: (panel: FloatingPanel, size: { width: number; height: number }) => void;
}

export interface UseStaggeredAnimationReturn {
  isAnimating: () => boolean;
  currentIndex: () => number;
  totalItems: () => number;
  startAnimation: (items: unknown[]) => Promise<void>;
  stopAnimation: () => void;
  getDelayForIndex: (index: number) => number;
  config: Record<string, unknown>;
  /** Current animation engine being used */
  animationEngine: () => "full" | "fallback" | "disabled";
  /** Whether animations are currently disabled */
  isAnimationsDisabled: () => boolean;
}
