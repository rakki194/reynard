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
export declare function createInitialResizeState(): ResizeState;
/**
 * Starts a resize operation
 *
 * @param boxId - The ID of the box being resized
 * @param handle - The resize handle being used
 * @param startDimensions - The initial dimensions
 * @param callbacks - Event callbacks
 * @returns Updated resize state
 */
export declare function startResizeOperation(boxId: string, handle: ResizeHandle, startDimensions: ResizeDimensions, callbacks: ResizeCallbacks): ResizeState;
/**
 * Updates resize operation with new dimensions
 *
 * @param newDimensions - The new dimensions
 * @param currentState - Current resize state
 * @param callbacks - Event callbacks
 * @returns Updated resize state
 */
export declare function updateResizeOperation(newDimensions: ResizeDimensions, currentState: ResizeState, _callbacks: ResizeCallbacks): ResizeState;
/**
 * Ends a resize operation
 *
 * @param currentState - Current resize state
 * @param boxId - The ID of the box being resized
 * @param callbacks - Event callbacks
 * @returns Final resize state and dimensions
 */
export declare function endResizeOperation(currentState: ResizeState, boxId: string, callbacks: ResizeCallbacks): {
    state: ResizeState;
    finalDimensions: ResizeDimensions | null;
};
/**
 * Cancels a resize operation
 *
 * @param currentState - Current resize state
 * @param boxId - The ID of the box being resized
 * @param callbacks - Event callbacks
 * @returns Reset resize state
 */
export declare function cancelResizeOperation(currentState: ResizeState, boxId: string, callbacks: ResizeCallbacks): ResizeState;
/**
 * Checks if currently resizing
 *
 * @param state - Current resize state
 * @returns True if resizing
 */
export declare function isResizing(state: ResizeState): boolean;
/**
 * Gets the active resize handle
 *
 * @param state - Current resize state
 * @returns Active handle or null
 */
export declare function getActiveHandle(state: ResizeState): ResizeHandle | null;
