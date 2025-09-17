/**
 * Panel Storage
 *
 * Storage management for draggable/resizable panels.
 */
import type { PanelState } from "./PanelState.js";
/**
 * Save panel state to storage
 */
export declare function savePanelState(key: string, state: PanelState): void;
/**
 * Load panel state from storage
 */
export declare function loadPanelState(key: string, fallback: PanelState): PanelState;
