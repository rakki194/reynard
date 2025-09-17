/**
 * useBoxResize composable
 *
 * Provides resize functionality for bounding boxes with support for:
 * - Corner and edge resize handles
 * - Constraint enforcement (min/max dimensions)
 * - Proportional resizing
 * - Performance optimization
 */
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
export declare function useBoxResize(options?: ResizeOptions): UseBoxResizeReturn;
