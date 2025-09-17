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

export interface UseOverlayManagerReturn {
  overlayState: () => OverlayState;
  setOverlayState: (state: OverlayState) => void;
  config: OverlayConfig;
  eventHandlers: PanelEventHandlers;
  showPanel: (panelId: string) => void;
  hidePanel: (panelId: string) => void;
  togglePanel: (panelId: string) => void;
}

export interface UseStaggeredAnimationReturn {
  isAnimating: () => boolean;
  currentIndex: () => number;
  totalItems: () => number;
  startAnimation: (items: unknown[]) => void;
  stopAnimation: () => void;
  getDelayForIndex: (index: number) => number;
  config: Record<string, unknown>;
}
