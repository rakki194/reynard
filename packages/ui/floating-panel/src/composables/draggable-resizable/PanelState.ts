/**
 * Panel State Management
 *
 * State management for draggable/resizable panels.
 */

import { createSignal } from "solid-js";

export interface PanelState {
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
}

/**
 * Create panel state signal
 */
export function createPanelState(initialState: PanelState) {
  return createSignal<PanelState>(initialState);
}

/**
 * Update panel state
 */
export function updatePanelState(
  setState: (updater: (prev: PanelState) => PanelState) => void,
  updates: Partial<PanelState>
) {
  setState((prev: PanelState) => ({ ...prev, ...updates }));
}
