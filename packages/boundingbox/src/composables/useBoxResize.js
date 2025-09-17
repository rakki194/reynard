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
export function useBoxResize(options = {}) {
    const { minWidth = 10, minHeight = 10, maxWidth = 1000, maxHeight = 1000, enableProportionalResizing = false, enableCornerHandles = true, enableEdgeHandles = true, onResizeStart, onResizeMove, onResizeEnd, onResizeCancel, } = options;
    const [isResizing, setIsResizing] = createSignal(false);
    const [resizingBoxId, setResizingBoxId] = createSignal(null);
    const [resizeState, setResizeState] = createSignal(null);
    const handles = () => {
        const handleList = [];
        if (enableCornerHandles) {
            handleList.push({ position: "bottom-right", cursor: "se-resize" }, { position: "bottom-left", cursor: "sw-resize" }, { position: "top-right", cursor: "ne-resize" }, { position: "top-left", cursor: "nw-resize" });
        }
        if (enableEdgeHandles) {
            handleList.push({ position: "top", cursor: "n-resize" }, { position: "bottom", cursor: "s-resize" }, { position: "left", cursor: "w-resize" }, { position: "right", cursor: "e-resize" });
        }
        return handleList;
    };
    const applyConstraints = (dimensions) => {
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
                const aspectRatio = originalState.originalDimensions.width /
                    originalState.originalDimensions.height;
                // Determine which dimension changed more
                const widthChange = Math.abs(width - originalState.originalDimensions.width);
                const heightChange = Math.abs(height - originalState.originalDimensions.height);
                if (widthChange > heightChange) {
                    height = width / aspectRatio;
                }
                else {
                    width = height * aspectRatio;
                }
            }
        }
        return { width, height, x, y };
    };
    const startResize = (boxId, handle, startDimensions) => {
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
    const updateResize = (dimensions) => {
        if (!isResizing() || !resizeState())
            return;
        const constrainedDimensions = applyConstraints(dimensions);
        setResizeState((prev) => ({
            ...prev,
            currentDimensions: constrainedDimensions,
        }));
        onResizeMove?.(resizingBoxId(), constrainedDimensions);
    };
    const endResize = () => {
        if (!isResizing() || !resizeState())
            return;
        const finalDimensions = resizeState().currentDimensions || resizeState().startDimensions;
        onResizeEnd?.(resizingBoxId(), finalDimensions);
        // Clean up state
        setIsResizing(false);
        setResizingBoxId(null);
        setResizeState(null);
    };
    const cancelResize = () => {
        if (!isResizing())
            return;
        onResizeCancel?.(resizingBoxId());
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
