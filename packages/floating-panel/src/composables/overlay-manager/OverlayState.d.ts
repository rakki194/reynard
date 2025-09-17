/**
 * Overlay State Management
 *
 * State management for overlay manager.
 */
import type { OverlayState, FloatingPanel } from "../../types.js";
/**
 * Create initial overlay state
 */
export declare function createInitialOverlayState(initialPanels?: FloatingPanel[]): OverlayState;
/**
 * Create overlay state signal
 */
export declare function createOverlayState(initialPanels?: FloatingPanel[]): import("solid-js").Signal<OverlayState>;
