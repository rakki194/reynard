/**
 * Overlay State Management
 *
 * State management for overlay manager.
 */
import { createSignal } from "solid-js";
/**
 * Create initial overlay state
 */
export function createInitialOverlayState(initialPanels) {
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
export function createOverlayState(initialPanels) {
    return createSignal(createInitialOverlayState(initialPanels));
}
