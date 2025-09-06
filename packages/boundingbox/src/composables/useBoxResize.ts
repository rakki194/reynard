/**
 * useBoxResize composable
 * 
 * Provides resize functionality for bounding boxes with support for:
 * - Corner and edge resize handles
 * - Proportional resizing with aspect ratio maintenance
 * - Size constraints and validation
 * - Fabric.js integration for smooth canvas-based editing
 */

import { createSignal, createMemo } from 'solid-js';
import type { BoundingBox, ResizeHandle, TransformConstraints } from '../types';
// checkBoundingBoxConstraints import removed as it's not used

export interface ResizeState {
  isResizing: boolean;
  activeHandle: ResizeHandle | null;
  startDimensions: { width: number; height: number; x: number; y: number } | null;
  currentDimensions: { width: number; height: number; x: number; y: number } | null;
  proportional: boolean;
}

export interface ResizeOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableProportionalResizing?: boolean;
  enableCornerHandles?: boolean;
  enableEdgeHandles?: boolean;
  // handleSize, handleColor, handleBorderColor removed as they're not used
  onResizeStart?: (boxId: string, handle: ResizeHandle) => void;
  onResizeMove?: (boxId: string, dimensions: { width: number; height: number; x: number; y: number }) => void;
  onResizeEnd?: (boxId: string, finalDimensions: { width: number; height: number; x: number; y: number }) => void;
  onResizeCancel?: (boxId: string) => void;
}

export interface UseBoxResizeReturn {
  resizeState: () => ResizeState;
  handles: () => ResizeHandle[];
  startResize: (
    boxId: string,
    handle: ResizeHandle,
    startDimensions: { width: number; height: number; x: number; y: number }
  ) => void;
  updateResize: (newDimensions: { width: number; height: number; x: number; y: number }) => void;
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
    // handleSize, handleColor, handleBorderColor removed as they're not used
    onResizeStart,
    onResizeMove,
    onResizeEnd,
    onResizeCancel,
  } = options;

  const [resizeState, setResizeState] = createSignal<ResizeState>({
    isResizing: false,
    activeHandle: null,
    startDimensions: null,
    currentDimensions: null,
    proportional: false,
  });

  const [currentBoxId, setCurrentBoxId] = createSignal<string | null>(null);

  // Define resize handles based on options
  const handles = createMemo((): ResizeHandle[] => {
    const handleList: ResizeHandle[] = [];

    if (enableCornerHandles) {
      handleList.push(
        {
          id: 'top-left',
          position: 'top-left',
          cursor: 'nw-resize',
          constraints: { minWidth, minHeight, maxWidth, maxHeight, maintainAspectRatio: enableProportionalResizing },
        },
        {
          id: 'top-right',
          position: 'top-right',
          cursor: 'ne-resize',
          constraints: { minWidth, minHeight, maxWidth, maxHeight, maintainAspectRatio: enableProportionalResizing },
        },
        {
          id: 'bottom-left',
          position: 'bottom-left',
          cursor: 'sw-resize',
          constraints: { minWidth, minHeight, maxWidth, maxHeight, maintainAspectRatio: enableProportionalResizing },
        },
        {
          id: 'bottom-right',
          position: 'bottom-right',
          cursor: 'se-resize',
          constraints: { minWidth, minHeight, maxWidth, maxHeight, maintainAspectRatio: enableProportionalResizing },
        }
      );
    }

    if (enableEdgeHandles) {
      handleList.push(
        {
          id: 'top',
          position: 'top',
          cursor: 'n-resize',
          constraints: { minWidth, minHeight, maxWidth, maxHeight },
        },
        {
          id: 'right',
          position: 'right',
          cursor: 'e-resize',
          constraints: { minWidth, minHeight, maxWidth, maxHeight },
        },
        {
          id: 'bottom',
          position: 'bottom',
          cursor: 's-resize',
          constraints: { minWidth, minHeight, maxWidth, maxHeight },
        },
        {
          id: 'left',
          position: 'left',
          cursor: 'w-resize',
          constraints: { minWidth, minHeight, maxWidth, maxHeight },
        }
      );
    }

    return handleList;
  });

  function startResize(
    boxId: string,
    handle: ResizeHandle,
    startDimensions: { width: number; height: number; x: number; y: number }
  ) {
    setCurrentBoxId(boxId);
    
    // Calculate aspect ratio if proportional resizing is enabled
    const aspectRatio = startDimensions.width / startDimensions.height;
    const updatedHandle = {
      ...handle,
      constraints: {
        ...handle.constraints,
        aspectRatio: handle.constraints.maintainAspectRatio ? aspectRatio : undefined
      }
    };
    
    setResizeState({
      isResizing: true,
      activeHandle: updatedHandle,
      startDimensions,
      currentDimensions: startDimensions,
      proportional: handle.constraints.maintainAspectRatio || false,
    });

    onResizeStart?.(boxId, updatedHandle);
  }

  function updateResize(newDimensions: { width: number; height: number; x: number; y: number }) {
    const state = resizeState();
    if (!state.isResizing || !state.activeHandle) return;

    const boxId = currentBoxId();
    if (!boxId) return;

    // Apply constraints
    const constrainedDimensions = applyResizeConstraints(newDimensions, state.activeHandle.constraints);

    setResizeState(prev => ({
      ...prev,
      currentDimensions: constrainedDimensions,
    }));

    onResizeMove?.(boxId, constrainedDimensions);
  }

  function endResize() {
    const state = resizeState();
    const boxId = currentBoxId();
    
    if (!state.isResizing || !boxId) return;

    const finalDimensions = state.currentDimensions || state.startDimensions;
    if (finalDimensions) {
      onResizeEnd?.(boxId, finalDimensions);
    }

    setResizeState({
      isResizing: false,
      activeHandle: null,
      startDimensions: null,
      currentDimensions: null,
      proportional: false,
    });
    setCurrentBoxId(null);
  }

  function cancelResize() {
    const boxId = currentBoxId();
    
    setResizeState({
      isResizing: false,
      activeHandle: null,
      startDimensions: null,
      currentDimensions: null,
      proportional: false,
    });
    setCurrentBoxId(null);

    if (boxId) {
      onResizeCancel?.(boxId);
    }
  }

  function applyResizeConstraints(
    dimensions: { width: number; height: number; x: number; y: number },
    constraints: TransformConstraints
  ): { width: number; height: number; x: number; y: number } {
    let { width, height, x, y } = dimensions;

    // Apply size constraints
    if (constraints.minWidth !== undefined) {
      width = Math.max(width, constraints.minWidth);
    }
    if (constraints.minHeight !== undefined) {
      height = Math.max(height, constraints.minHeight);
    }
    if (constraints.maxWidth !== undefined) {
      width = Math.min(width, constraints.maxWidth);
    }
    if (constraints.maxHeight !== undefined) {
      height = Math.min(height, constraints.maxHeight);
    }

    // Apply aspect ratio constraint
    if (constraints.maintainAspectRatio && constraints.aspectRatio) {
      const currentAspectRatio = width / height;
      if (Math.abs(currentAspectRatio - constraints.aspectRatio) > 0.01) {
        // Adjust height to maintain aspect ratio
        height = width / constraints.aspectRatio;
      }
    }

    return { width, height, x, y };
  }

  function isResizing(): boolean {
    return resizeState().isResizing;
  }

  function getActiveHandle(): ResizeHandle | null {
    return resizeState().activeHandle;
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
