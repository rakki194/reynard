/**
 * useBoxMove composable
 *
 * Provides move functionality for bounding boxes with support for:
 * - Drag-to-move logic
 * - Move constraints and boundary checking
 * - Move snapping and alignment
 * - Performance optimization
 */
import { createSignal } from "solid-js";
export function useBoxMove(options) {
    const { imageInfo, isEnabled, enableSnapping = true, enableAlignment = true, enableConstraints = true, enablePerformanceOptimization = true, onBoxMoved, onBoxMoveStart, onBoxMoveEnd, onBoxMoveError, } = options;
    const [moveState, setMoveState] = createSignal(null);
    const [isMoving, setIsMoving] = createSignal(false);
    const [movingBoxId, setMovingBoxId] = createSignal(null);
    // Performance optimization: throttle move updates
    let lastMoveUpdate = 0;
    const moveUpdateThrottle = 16; // ~60fps
    // Calculate move constraints for a box
    function calculateMoveConstraints(box) {
        return {
            minX: 0,
            maxX: imageInfo.width - box.width,
            minY: 0,
            maxY: imageInfo.height - box.height,
            enableBoundaryCheck: enableConstraints,
            enableSnapping: enableSnapping,
            snapThreshold: 10,
            enableAlignment: enableAlignment,
            alignmentThreshold: 5,
        };
    }
    // Apply move constraints
    function applyMoveConstraints(x, y, constraints) {
        if (!constraints.enableBoundaryCheck) {
            return { x, y };
        }
        return {
            x: Math.max(constraints.minX, Math.min(x, constraints.maxX)),
            y: Math.max(constraints.minY, Math.min(y, constraints.maxY)),
        };
    }
    // Calculate snapping to grid or other boxes
    function calculateSnapping(x, y, _box) {
        if (!enableSnapping) {
            return { x, y };
        }
        // Grid snapping (10px grid)
        const gridSize = 10;
        const snappedX = Math.round(x / gridSize) * gridSize;
        const snappedY = Math.round(y / gridSize) * gridSize;
        return { x: snappedX, y: snappedY };
    }
    // Calculate alignment with other elements
    function calculateAlignment(x, y, box) {
        if (!enableAlignment) {
            return { x, y };
        }
        // Simple alignment to image center and edges
        const imageCenterX = imageInfo.width / 2;
        const imageCenterY = imageInfo.height / 2;
        const threshold = 5;
        let alignedX = x;
        let alignedY = y;
        // Align to image center
        if (Math.abs(x + box.width / 2 - imageCenterX) < threshold) {
            alignedX = imageCenterX - box.width / 2;
        }
        if (Math.abs(y + box.height / 2 - imageCenterY) < threshold) {
            alignedY = imageCenterY - box.height / 2;
        }
        // Align to image edges
        if (Math.abs(x) < threshold) {
            alignedX = 0;
        }
        if (Math.abs(y) < threshold) {
            alignedY = 0;
        }
        if (Math.abs(x + box.width - imageInfo.width) < threshold) {
            alignedX = imageInfo.width - box.width;
        }
        if (Math.abs(y + box.height - imageInfo.height) < threshold) {
            alignedY = imageInfo.height - box.height;
        }
        return { x: alignedX, y: alignedY };
    }
    function startBoxMove(boxId, box, startX, startY) {
        if (!isEnabled)
            return;
        try {
            setMoveState({
                isMoving: true,
                boxId,
                originalBox: box,
                startX,
                startY,
                currentX: startX,
                currentY: startY,
            });
            setIsMoving(true);
            setMovingBoxId(boxId);
            onBoxMoveStart?.(boxId);
            console.debug(`[useBoxMove] Started moving box ${boxId}`);
        }
        catch (error) {
            console.error(`[useBoxMove] Error starting move for box ${boxId}:`, error);
            onBoxMoveError?.(boxId, error);
        }
    }
    function updateBoxMove(currentX, currentY) {
        const state = moveState();
        if (!state || !state.originalBox)
            return;
        // Performance optimization: throttle updates
        if (enablePerformanceOptimization) {
            const now = Date.now();
            if (now - lastMoveUpdate < moveUpdateThrottle) {
                return;
            }
            lastMoveUpdate = now;
        }
        try {
            // Calculate the delta movement
            const deltaX = currentX - state.startX;
            const deltaY = currentY - state.startY;
            // Calculate new position
            const newX = state.originalBox.x + deltaX;
            const newY = state.originalBox.y + deltaY;
            // Apply constraints
            const constraints = calculateMoveConstraints(state.originalBox);
            const constrained = applyMoveConstraints(newX, newY, constraints);
            // Apply snapping
            const snapped = calculateSnapping(constrained.x, constrained.y, state.originalBox);
            // Apply alignment
            const aligned = calculateAlignment(snapped.x, snapped.y, state.originalBox);
            // Update move state
            setMoveState((prev) => prev
                ? {
                    ...prev,
                    currentX,
                    currentY,
                }
                : null);
            // Create updated box
            const updatedBox = {
                ...state.originalBox,
                x: aligned.x,
                y: aligned.y,
            };
            // Notify parent of move update
            onBoxMoved?.(state.boxId, updatedBox);
        }
        catch (error) {
            console.error(`[useBoxMove] Error updating move for box ${state.boxId}:`, error);
            onBoxMoveError?.(state.boxId, error);
        }
    }
    function endBoxMove() {
        const state = moveState();
        if (!state)
            return;
        try {
            // Final update with current position
            updateBoxMove(state.currentX, state.currentY);
            // Clean up state
            setMoveState(null);
            setIsMoving(false);
            setMovingBoxId(null);
            onBoxMoveEnd?.(state.boxId);
            console.debug(`[useBoxMove] Finished moving box ${state.boxId}`);
        }
        catch (error) {
            console.error(`[useBoxMove] Error ending move for box ${state.boxId}:`, error);
            onBoxMoveError?.(state.boxId, error);
        }
    }
    function cancelBoxMove() {
        const state = moveState();
        if (!state)
            return;
        try {
            // Clean up state
            setMoveState(null);
            setIsMoving(false);
            setMovingBoxId(null);
            console.debug(`[useBoxMove] Cancelled move for box ${state.boxId}`);
        }
        catch (error) {
            console.error(`[useBoxMove] Error cancelling move for box ${state.boxId}:`, error);
            onBoxMoveError?.(state.boxId, error);
        }
    }
    return {
        moveState,
        isMoving,
        movingBoxId,
        startBoxMove,
        updateBoxMove,
        endBoxMove,
        cancelBoxMove,
        calculateMoveConstraints,
    };
}
