/**
 * Overlay State Management
 *
 * State management for overlay manager.
 */

import { createSignal } from "solid-js";
import type { OverlayState, FloatingPanel } from "../../types.js";

/**
 * Create initial overlay state
 */
export function createInitialOverlayState(initialPanels?: FloatingPanel[]): OverlayState {
  return {
    isActive: false,
    transitionPhase: "idle",
    backdropVisible: false,
    panels: initialPanels || [],
    activePanelId: undefined,
    hoveredPanelId: undefined,
    lastInteraction: Date.now(),
  };
}

/**
 * Create overlay state signal
 */
export function createOverlayState(initialPanels?: FloatingPanel[]) {
  return createSignal<OverlayState>(createInitialOverlayState(initialPanels));
}

