/**
 * Panel Storage
 *
 * Storage management for draggable/resizable panels.
 */

import type { PanelState } from "./PanelState.js";

/**
 * Save panel state to storage
 */
export function savePanelState(key: string, state: PanelState): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save panel state:", error);
  }
}

/**
 * Load panel state from storage
 */
export function loadPanelState(key: string, fallback: PanelState): PanelState {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return { ...fallback, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn("Failed to load panel state:", error);
  }
  return fallback;
}

