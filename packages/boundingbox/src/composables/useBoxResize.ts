/**
 * useBoxResize composable
 *
 * Orchestrates resize functionality for bounding boxes by coordinating:
 * - Resize handle generation
 * - Resize operations and state management
 * - Constraint application
 * - Event callbacks
 */

import { createSignal, createMemo } from "solid-js";
import type { ResizeHandle } from "../types";
import type { ResizeDimensions } from "./resize-constraints";
import type { ResizeState, ResizeCallbacks } from "./resize-operations";

// Re-export types for external use
export type { ResizeState };
import { generateResizeHandles } from "./resize-handles";
import {
  createInitialResizeState,
  startResizeOperation,
  updateResizeOperation,
  endResizeOperation,
  cancelResizeOperation,
  isResizing as checkIsResizing,
  getActiveHandle as getActiveResizeHandle,
} from "./resize-operations";

export interface ResizeOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableProportionalResizing?: boolean;
  enableCornerHandles?: boolean;
  enableEdgeHandles?: boolean;
  onResizeStart?: (boxId: string, handle: ResizeHandle) => void;
  onResizeMove?: (boxId: string, dimensions: ResizeDimensions) => void;
  onResizeEnd?: (boxId: string, finalDimensions: ResizeDimensions) => void;
  onResizeCancel?: (boxId: string) => void;
}

export interface UseBoxResizeReturn {
  resizeState: () => ResizeState;
  handles: () => ResizeHandle[];
  startResize: (
    boxId: string,
    handle: ResizeHandle,
    startDimensions: ResizeDimensions,
  ) => void;
  updateResize: (newDimensions: ResizeDimensions) => void;
  endResize: () => void;
  cancelResize: () => void;
  isResizing: () => boolean;
  getActiveHandle: () => ResizeHandle | null;
  setCurrentBoxId: (boxId: string | null) => void;
  getCurrentBoxId: () => string | null;
}

export function useBoxResize(options: ResizeOptions = {}): UseBoxResizeReturn {
  const {
    minWidth = 10,
    minHeight = 10,
    maxWidth = Infinity,
    maxHeight = Infinity,
    enableProportionalResizing = true,
    enableCornerHandles = true,
    enableEdgeHandles = true,
    onResizeStart,
    onResizeMove,
    onResizeEnd,
    onResizeCancel,
  } = options;

  const [resizeState, setResizeState] = createSignal<ResizeState>(
    createInitialResizeState(),
  );
  const [currentBoxId, setCurrentBoxId] = createSignal<string | null>(null);

  // Generate resize handles using the extracted module
  const handles = createMemo((): ResizeHandle[] => {
    return generateResizeHandles({
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      enableProportionalResizing,
      enableCornerHandles,
      enableEdgeHandles,
    });
  });

  // Create callbacks object for resize operations
  const callbacks: ResizeCallbacks = {
    onResizeStart,
    onResizeMove,
    onResizeEnd,
    onResizeCancel,
  };

  function startResize(
    boxId: string,
    handle: ResizeHandle,
    startDimensions: ResizeDimensions,
  ) {
    setCurrentBoxId(boxId);
    const newState = startResizeOperation(
      boxId,
      handle,
      startDimensions,
      callbacks,
    );
    setResizeState(newState);
  }

  function updateResize(newDimensions: ResizeDimensions) {
    const state = resizeState();
    const boxId = currentBoxId();

    if (!boxId) return;

    const newState = updateResizeOperation(newDimensions, state, callbacks);
    setResizeState(newState);

    if (newState.currentDimensions) {
      onResizeMove?.(boxId, newState.currentDimensions);
    }
  }

  function endResize() {
    const state = resizeState();
    const boxId = currentBoxId();

    if (!boxId) return;

    const { state: newState } = endResizeOperation(state, boxId, callbacks);
    setResizeState(newState);
    setCurrentBoxId(null);
  }

  function cancelResize() {
    const state = resizeState();
    const boxId = currentBoxId();

    const newState = cancelResizeOperation(state, boxId || "", callbacks);
    setResizeState(newState);
    setCurrentBoxId(null);
  }

  function isResizing(): boolean {
    return checkIsResizing(resizeState());
  }

  function getActiveHandle(): ResizeHandle | null {
    return getActiveResizeHandle(resizeState());
  }

  function getCurrentBoxId(): string | null {
    return currentBoxId();
  }

  return {
    resizeState,
    handles,
    startResize,
    updateResize,
    endResize,
    cancelResize,
    isResizing,
    getActiveHandle,
    setCurrentBoxId,
    getCurrentBoxId,
  };
}
