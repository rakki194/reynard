/**
 * Core types for the Reynard Floating Panel system
 * Based on Yipyap's sophisticated BoundingBoxEditor implementation
 */

import type { JSX } from "solid-js";

// ============================================================================
// Core Panel Types
// ============================================================================

export interface FloatingPanel {
  id: string;
  position: PanelPosition;
  size: PanelSize;
  content: JSX.Element;
  config: PanelConfig;
}

export interface PanelPosition {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number;
}

export interface PanelSize {
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
}

export interface PanelConfig {
  draggable?: boolean;
  resizable?: boolean;
  closable?: boolean;
  backdrop?: boolean;
  backdropBlur?: boolean;
  backdropColor?: string;
  animationDelay?: number;
  animationDuration?: number;
  animationEasing?: string;
  showOnHover?: boolean;
  hoverDelay?: number;
  persistent?: boolean;
  theme?: PanelTheme;
}

export type PanelTheme = "default" | "accent" | "warning" | "error" | "success" | "info";

// ============================================================================
// Overlay System Types
// ============================================================================

export interface OverlayState {
  isActive: boolean;
  transitionPhase: TransitionPhase;
  backdropVisible: boolean;
  panels: FloatingPanel[];
  activePanelId?: string;
}

export type TransitionPhase = 
  | "idle" 
  | "entering" 
  | "entering-active" 
  | "active" 
  | "exiting" 
  | "exiting-active";

export interface OverlayConfig {
  backdropBlur?: number;
  backdropColor?: string;
  backdropOpacity?: number;
  outlineColor?: string;
  outlineStyle?: "solid" | "dashed" | "dotted";
  outlineWidth?: number;
  transitionDuration?: number;
  transitionEasing?: string;
  zIndex?: number;
}

// ============================================================================
// Animation System Types
// ============================================================================

export interface AnimationConfig {
  staggerDelay: number;
  entranceDelay: number;
  exitDelay: number;
  duration: number;
  easing: string;
  transform: AnimationTransform;
}

export interface AnimationTransform {
  entrance: string;
  exit: string;
  scale?: number;
  translateX?: number;
  translateY?: number;
}

export interface StaggeredAnimation {
  baseDelay: number;
  staggerStep: number;
  maxDelay: number;
  direction: "forward" | "reverse" | "center-out";
}

// ============================================================================
// State Management Types
// ============================================================================

export interface PanelState {
  isVisible: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isHovered: boolean;
  isFocused: boolean;
  position: PanelPosition;
  size: PanelSize;
  zIndex: number;
}

export interface OverlayManagerState {
  overlay: OverlayState;
  panels: Map<string, PanelState>;
  animations: Map<string, AnimationConfig>;
  transitions: Map<string, TransitionPhase>;
}

// ============================================================================
// Event Handler Types
// ============================================================================

export interface PanelEventHandlers {
  onPanelShow?: (panelId: string) => void;
  onPanelHide?: (panelId: string) => void;
  onPanelDrag?: (panelId: string, position: PanelPosition) => void;
  onPanelResize?: (panelId: string, size: PanelSize) => void;
  onPanelFocus?: (panelId: string) => void;
  onPanelBlur?: (panelId: string) => void;
  onOverlayShow?: () => void;
  onOverlayHide?: () => void;
  onTransitionStart?: (phase: TransitionPhase) => void;
  onTransitionEnd?: (phase: TransitionPhase) => void;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface FloatingPanelOverlayProps {
  isActive: boolean;
  config?: OverlayConfig;
  transitionPhase?: TransitionPhase;
  children?: JSX.Element;
  class?: string;
  onTransitionStart?: (phase: TransitionPhase) => void;
  onTransitionEnd?: (phase: TransitionPhase) => void;
  onPointerDown?: (event: PointerEvent) => void;
  onPointerMove?: (event: PointerEvent) => void;
  onPointerUp?: (event: PointerEvent) => void;
  onMouseMove?: (event: MouseEvent) => void;
  onMouseLeave?: () => void;
}

export interface FloatingPanelProps {
  id: string;
  position: PanelPosition;
  size?: PanelSize;
  config?: PanelConfig;
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
  onShow?: () => void;
  onHide?: () => void;
  onDrag?: (position: PanelPosition) => void;
  onResize?: (size: PanelSize) => void;
}

export interface DraggablePanelProps extends FloatingPanelProps {
  dragHandle?: string;
  dragConstraints?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export interface ResizablePanelProps extends FloatingPanelProps {
  resizeHandles?: ("n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw")[];
  resizeConstraints?: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
}

// ============================================================================
// Composable Return Types
// ============================================================================

export interface UseFloatingPanelReturn {
  panelState: () => PanelState;
  showPanel: () => void;
  hidePanel: () => void;
  togglePanel: () => void;
  updatePosition: (position: Partial<PanelPosition>) => void;
  updateSize: (size: Partial<PanelSize>) => void;
  isVisible: () => boolean;
  isDragging: () => boolean;
  isResizing: () => boolean;
}

export interface UseOverlayManagerReturn {
  overlayState: () => OverlayState;
  showOverlay: () => void;
  hideOverlay: () => void;
  toggleOverlay: () => void;
  addPanel: (panel: FloatingPanel) => void;
  removePanel: (panelId: string) => void;
  updatePanel: (panelId: string, updates: Partial<FloatingPanel>) => void;
  setTransitionPhase: (phase: TransitionPhase) => void;
  isActive: () => boolean;
  getPanel: (panelId: string) => FloatingPanel | undefined;
  getAllPanels: () => FloatingPanel[];
}

export interface UseStaggeredAnimationReturn {
  animationConfig: () => AnimationConfig;
  getStaggerDelay: (index: number) => number;
  getEntranceDelay: (index: number) => number;
  getExitDelay: (index: number) => number;
  isAnimating: () => boolean;
  startAnimation: () => void;
  stopAnimation: () => void;
}

// Advanced draggable/resizable types
export interface AdvancedPanelState {
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
}

export interface DraggableResizableOptions {
  initialState: AdvancedPanelState;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  bounds?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  storageKey?: string;
  onStateChange?: (state: AdvancedPanelState) => void;
}

export interface DraggableResizableReturn {
  panelState: () => AdvancedPanelState;
  isDragging: () => boolean;
  isResizing: () => boolean;
  isMinimized: () => boolean;
  style: () => Record<string, string>;
  handleMouseDown: (e: MouseEvent, type: 'drag' | 'resize') => void;
  toggleMinimized: () => void;
  resetPosition: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface PanelConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  snapToGrid?: boolean;
  gridSize?: number;
}

export interface PanelSnapPoints {
  x: number[];
  y: number[];
  tolerance?: number;
}

export interface PanelBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ============================================================================
// CSS Custom Properties
// ============================================================================

export interface PanelCSSVariables {
  "--panel-bg": string;
  "--panel-border": string;
  "--panel-shadow": string;
  "--panel-radius": string;
  "--panel-padding": string;
  "--panel-z-index": string;
  "--panel-transition-duration": string;
  "--panel-transition-easing": string;
  "--panel-stagger-delay": string;
  "--panel-entrance-delay": string;
  "--panel-exit-delay": string;
}

export interface OverlayCSSVariables {
  "--overlay-bg": string;
  "--overlay-blur": string;
  "--overlay-opacity": string;
  "--overlay-outline": string;
  "--overlay-z-index": string;
  "--overlay-transition-duration": string;
  "--overlay-transition-easing": string;
}
