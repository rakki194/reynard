/**
 * useBoxResize composable
 *
 * Provides resize functionality for bounding boxes with support for:
 * - Corner and edge resize handles
 * - Constraint enforcement (min/max dimensions)
 * - Proportional resizing
 * - Performance optimization
 */

import { createSignal } from "solid-js";
import type { BoundingBox } from "../types";

export interface ResizeDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ResizeHandle {
  position: string;
  cursor: string;
}

export interface ResizeOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableProportionalResizing?: boolean;
  enableCornerHandles?: boolean;
  enableEdgeHandles?: boolean;
  onResizeStart?: (boxId: string, handle: string) => void;
  onResizeMove?: (boxId: string, dimensions: ResizeDimensions) => void;
  onResizeEnd?: (boxId: string, finalDimensions: ResizeDimensions) => void;
  onResizeCancel?: (boxId: string) => void;
}

export interface UseBoxResizeReturn {
  isResizing: () => boolean;
  resizingBoxId: () => string | null;
  resizeState: () => any;
  handles: () => ResizeHandle[];
  startResize: (boxId: string, handle: string, startDimensions: ResizeDimensions) => void;
  updateResize: (dimensions: ResizeDimensions) => void;
  endResize: () => void;
  cancelResize: () => void;
  getCurrentBoxId: () => string | null;
}

export function useBoxResize(options: ResizeOptions = {}): UseBoxResizeReturn {
  const {
    minWidth = 10,
    minHeight = 10,
    maxWidth = 1000,
    maxHeight = 1000,
    enableProportionalResizing = false,
    enableCornerHandles = true,
    enableEdgeHandles = true,
    onResizeStart,
    onResizeMove,
    onResizeEnd,
    onResizeCancel,
  } = options;

  const [isResizing, setIsResizing] = createSignal(false);
  const [resizingBoxId, setResizingBoxId] = createSignal<string | null>(null);
  const [resizeState, setResizeState] = createSignal<any>(null);

  const handles = (): ResizeHandle[] => {
    const handleList: ResizeHandle[] = [];

    if (enableCornerHandles) {
      handleList.push(
        { position: "bottom-right", cursor: "se-resize" },
        { position: "bottom-left", cursor: "sw-resize" },
        { position: "top-right", cursor: "ne-resize" },
        { position: "top-left", cursor: "nw-resize" }
      );
    }

    if (enableEdgeHandles) {
      handleList.push(
        { position: "top", cursor: "n-resize" },
        { position: "bottom", cursor: "s-resize" },
        { position: "left", cursor: "w-resize" },
        { position: "right", cursor: "e-resize" }
      );
    }

    return handleList;
  };

  const applyConstraints = (dimensions: ResizeDimensions): ResizeDimensions => {
    let { width, height, x, y } = dimensions;

    // Apply minimum constraints
    width = Math.max(width, minWidth);
    height = Math.max(height, minHeight);

    // Apply maximum constraints
    width = Math.min(width, maxWidth);
    height = Math.min(height, maxHeight);

    // Apply proportional resizing if enabled
    if (enableProportionalResizing && resizeState()) {
      const originalState = resizeState();
      if (originalState.originalDimensions) {
        const aspectRatio = originalState.originalDimensions.width / originalState.originalDimensions.height;

        // Determine which dimension changed more
        const widthChange = Math.abs(width - originalState.originalDimensions.width);
        const heightChange = Math.abs(height - originalState.originalDimensions.height);

        if (widthChange > heightChange) {
          height = width / aspectRatio;
        } else {
          width = height * aspectRatio;
        }
      }
    }

    return { width, height, x, y };
  };

  const startResize = (boxId: string, handle: string, startDimensions: ResizeDimensions) => {
    setIsResizing(true);
    setResizingBoxId(boxId);
    setResizeState({
      boxId,
      handle,
      originalDimensions: { ...startDimensions },
      startDimensions: { ...startDimensions },
    });

    onResizeStart?.(boxId, handle);
  };

  const updateResize = (dimensions: ResizeDimensions) => {
    if (!isResizing() || !resizeState()) return;

    const constrainedDimensions = applyConstraints(dimensions);

    setResizeState((prev: any) => ({
      ...prev,
      currentDimensions: constrainedDimensions,
    }));

    onResizeMove?.(resizingBoxId()!, constrainedDimensions);
  };

  const endResize = () => {
    if (!isResizing() || !resizeState()) return;

    const finalDimensions = resizeState().currentDimensions || resizeState().startDimensions;

    onResizeEnd?.(resizingBoxId()!, finalDimensions);

    // Clean up state
    setIsResizing(false);
    setResizingBoxId(null);
    setResizeState(null);
  };

  const cancelResize = () => {
    if (!isResizing()) return;

    onResizeCancel?.(resizingBoxId()!);

    // Clean up state
    setIsResizing(false);
    setResizingBoxId(null);
    setResizeState(null);
  };

  const getCurrentBoxId = () => resizingBoxId();

  return {
    isResizing,
    resizingBoxId,
    resizeState,
    handles,
    startResize,
    updateResize,
    endResize,
    cancelResize,
    getCurrentBoxId,
  };
}
