/**
 * Draggable Panel Utils
 *
 * Utility functions for draggable panels.
 */
/**
 * Constrain position within bounds
 */
export function constrainPosition(position, constraints) {
    if (!constraints)
        return position;
    const { minX = 0, maxX = window.innerWidth, minY = 0, maxY = window.innerHeight, } = constraints;
    return {
        top: Math.max(minY, Math.min(maxY, position.top)),
        left: Math.max(minX, Math.min(maxX, position.left)),
    };
}
/**
 * Snap position to nearest snap point
 */
export function snapToPoint(position, snapPoints) {
    if (!snapPoints || snapPoints.length === 0)
        return position;
    let closestPoint = snapPoints[0];
    let minDistance = Math.sqrt(Math.pow(position.left - closestPoint.left, 2) +
        Math.pow(position.top - closestPoint.top, 2));
    for (const point of snapPoints) {
        const distance = Math.sqrt(Math.pow(position.left - point.left, 2) +
            Math.pow(position.top - point.top, 2));
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    }
    const snapThreshold = 50; // pixels
    if (minDistance <= snapThreshold) {
        return closestPoint;
    }
    return position;
}
/**
 * Get drag state
 */
export function getDragState(isDragging, startPosition, currentPosition) {
    return {
        isDragging,
        startPosition,
        currentPosition,
        delta: {
            x: currentPosition.left - startPosition.left,
            y: currentPosition.top - startPosition.top,
        },
    };
}
