/**
 * Panel State Management
 *
 * State management for draggable/resizable panels.
 */
import { createSignal } from "solid-js";
/**
 * Create panel state signal
 */
export function createPanelState(initialState) {
    return createSignal(initialState);
}
/**
 * Update panel state
 */
export function updatePanelState(setState, updates) {
    setState((prev) => ({ ...prev, ...updates }));
}
