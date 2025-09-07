/**
 * Resize Handles Module
 * 
 * Handles generation and configuration of resize handles for bounding boxes.
 * Supports corner and edge handles with customizable constraints.
 */

import type { ResizeHandle } from '../types';

export interface HandleGenerationOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableProportionalResizing?: boolean;
  enableCornerHandles?: boolean;
  enableEdgeHandles?: boolean;
}

/**
 * Generates resize handles based on configuration options
 * 
 * @param options - Configuration for handle generation
 * @returns Array of configured resize handles
 * 
 * @example
 * ```typescript
 * const handles = generateResizeHandles({
 *   enableCornerHandles: true,
 *   enableEdgeHandles: false,
 *   minWidth: 20,
 *   minHeight: 15
 * });
 * ```
 */
export function generateResizeHandles(options: HandleGenerationOptions = {}): ResizeHandle[] {
  const {
    minWidth = 10,
    minHeight = 10,
    maxWidth = Infinity,
    maxHeight = Infinity,
    enableProportionalResizing = true,
    enableCornerHandles = true,
    enableEdgeHandles = true,
  } = options;

  const handleList: ResizeHandle[] = [];

  if (enableCornerHandles) {
    handleList.push(...generateCornerHandles({
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      maintainAspectRatio: enableProportionalResizing,
    }));
  }

  if (enableEdgeHandles) {
    handleList.push(...generateEdgeHandles({
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    }));
  }

  return handleList;
}

/**
 * Generates corner resize handles
 */
function generateCornerHandles(constraints: {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  maintainAspectRatio: boolean;
}): ResizeHandle[] {
  return [
    {
      id: 'top-left',
      position: 'top-left',
      cursor: 'nw-resize',
      constraints: { ...constraints },
    },
    {
      id: 'top-right',
      position: 'top-right',
      cursor: 'ne-resize',
      constraints: { ...constraints },
    },
    {
      id: 'bottom-left',
      position: 'bottom-left',
      cursor: 'sw-resize',
      constraints: { ...constraints },
    },
    {
      id: 'bottom-right',
      position: 'bottom-right',
      cursor: 'se-resize',
      constraints: { ...constraints },
    },
  ];
}

/**
 * Generates edge resize handles
 */
function generateEdgeHandles(constraints: {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}): ResizeHandle[] {
  return [
    {
      id: 'top',
      position: 'top',
      cursor: 'n-resize',
      constraints: { ...constraints },
    },
    {
      id: 'right',
      position: 'right',
      cursor: 'e-resize',
      constraints: { ...constraints },
    },
    {
      id: 'bottom',
      position: 'bottom',
      cursor: 's-resize',
      constraints: { ...constraints },
    },
    {
      id: 'left',
      position: 'left',
      cursor: 'w-resize',
      constraints: { ...constraints },
    },
  ];
}

/**
 * Finds a resize handle by ID
 * 
 * @param handles - Array of resize handles
 * @param id - The handle ID to find
 * @returns The handle if found, undefined otherwise
 */
export function findResizeHandle(handles: ResizeHandle[], id: string): ResizeHandle | undefined {
  return handles.find(handle => handle.id === id);
}

/**
 * Updates handle constraints with aspect ratio
 * 
 * @param handle - The handle to update
 * @param aspectRatio - The aspect ratio to apply
 * @returns Updated handle with aspect ratio constraint
 */
export function updateHandleWithAspectRatio(
  handle: ResizeHandle,
  aspectRatio: number
): ResizeHandle {
  return {
    ...handle,
    constraints: {
      ...handle.constraints,
      aspectRatio: handle.constraints.maintainAspectRatio ? aspectRatio : undefined,
    },
  };
}
