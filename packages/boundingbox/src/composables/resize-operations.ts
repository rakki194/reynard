/**
 * Resize Operations Module
 *
 * Core resize operation logic including:
 * - Resize state management
 * - Resize event handling
 * - Dimension updates
 */

import type { ResizeHandle } from "../types";
import type { ResizeDimensions } from "./resize-constraints";
import { applyResizeConstraints } from "./resize-constraints";
import { updateHandleWithAspectRatio } from "./resize-handles";

export interface ResizeState {
  isResizing: boolean;
  activeHandle: ResizeHandle | null;
  startDimensions: ResizeDimensions | null;
  currentDimensions: ResizeDimensions | null;
  proportional: boolean;
}

export interface ResizeCallbacks {
  onResizeStart?: (boxId: string, handle: ResizeHandle) => void;
  onResizeMove?: (boxId: string, dimensions: ResizeDimensions) => void;
  onResizeEnd?: (boxId: string, finalDimensions: ResizeDimensions) => void;
  onResizeCancel?: (boxId: string) => void;
}

/**
 * Creates initial resize state
 */
export function createInitialResizeState(): ResizeState {
  return {
    isResizing: false,
    activeHandle: null,
    startDimensions: null,
    currentDimensions: null,
    proportional: false,
  };
}

/**
 * Starts a resize operation
 *
 * @param boxId - The ID of the box being resized
 * @param handle - The resize handle being used
 * @param startDimensions - The initial dimensions
 * @param callbacks - Event callbacks
 * @returns Updated resize state
 */
export function startResizeOperation(
  boxId: string,
  handle: ResizeHandle,
  startDimensions: ResizeDimensions,
  callbacks: ResizeCallbacks,
): ResizeState {
  // Calculate aspect ratio if proportional resizing is enabled
  const aspectRatio = startDimensions.width / startDimensions.height;
  const updatedHandle = updateHandleWithAspectRatio(handle, aspectRatio);

  const newState: ResizeState = {
    isResizing: true,
    activeHandle: updatedHandle,
    startDimensions,
    currentDimensions: startDimensions,
    proportional: handle.constraints.maintainAspectRatio || false,
  };

  callbacks.onResizeStart?.(boxId, updatedHandle);
  return newState;
}

/**
 * Updates resize operation with new dimensions
 *
 * @param newDimensions - The new dimensions
 * @param currentState - Current resize state
 * @param callbacks - Event callbacks
 * @returns Updated resize state
 */
export function updateResizeOperation(
  newDimensions: ResizeDimensions,
  currentState: ResizeState,
  _callbacks: ResizeCallbacks,
): ResizeState {
  if (!currentState.isResizing || !currentState.activeHandle) {
    return currentState;
  }

  // Apply constraints
  const constrainedDimensions = applyResizeConstraints(
    newDimensions,
    currentState.activeHandle.constraints,
  );

  return {
    ...currentState,
    currentDimensions: constrainedDimensions,
  };
}

/**
 * Ends a resize operation
 *
 * @param currentState - Current resize state
 * @param boxId - The ID of the box being resized
 * @param callbacks - Event callbacks
 * @returns Final resize state and dimensions
 */
export function endResizeOperation(
  currentState: ResizeState,
  boxId: string,
  callbacks: ResizeCallbacks,
): { state: ResizeState; finalDimensions: ResizeDimensions | null } {
  if (!currentState.isResizing) {
    return { state: currentState, finalDimensions: null };
  }

  const finalDimensions =
    currentState.currentDimensions || currentState.startDimensions;

  if (finalDimensions) {
    callbacks.onResizeEnd?.(boxId, finalDimensions);
  }

  const newState = createInitialResizeState();
  return { state: newState, finalDimensions };
}

/**
 * Cancels a resize operation
 *
 * @param currentState - Current resize state
 * @param boxId - The ID of the box being resized
 * @param callbacks - Event callbacks
 * @returns Reset resize state
 */
export function cancelResizeOperation(
  currentState: ResizeState,
  boxId: string,
  callbacks: ResizeCallbacks,
): ResizeState {
  const newState = createInitialResizeState();

  if (boxId) {
    callbacks.onResizeCancel?.(boxId);
  }

  return newState;
}

/**
 * Checks if currently resizing
 *
 * @param state - Current resize state
 * @returns True if resizing
 */
export function isResizing(state: ResizeState): boolean {
  return state.isResizing;
}

/**
 * Gets the active resize handle
 *
 * @param state - Current resize state
 * @returns Active handle or null
 */
export function getActiveHandle(state: ResizeState): ResizeHandle | null {
  return state.activeHandle;
}
