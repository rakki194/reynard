/**
 * Resize Handles Module
 *
 * Handles generation and configuration of resize handles for bounding boxes.
 * Supports corner and edge handles with customizable constraints.
 */
import type { ResizeHandle } from "../types";
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
export declare function generateResizeHandles(options?: HandleGenerationOptions): ResizeHandle[];
/**
 * Finds a resize handle by ID
 *
 * @param handles - Array of resize handles
 * @param id - The handle ID to find
 * @returns The handle if found, undefined otherwise
 */
export declare function findResizeHandle(handles: ResizeHandle[], id: string): ResizeHandle | undefined;
/**
 * Updates handle constraints with aspect ratio
 *
 * @param handle - The handle to update
 * @param aspectRatio - The aspect ratio to apply
 * @returns Updated handle with aspect ratio constraint
 */
export declare function updateHandleWithAspectRatio(handle: ResizeHandle, aspectRatio: number): ResizeHandle;
