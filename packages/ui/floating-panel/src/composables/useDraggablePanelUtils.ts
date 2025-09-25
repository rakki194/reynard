/**
 * Draggable Panel Utils
 *
 * Utility functions for draggable panels.
 */

import type { PanelPosition, PanelConstraints, PanelSnapPoints } from "../types.js";

/**
 * Constrain position within bounds
 */
export function constrainPosition(position: PanelPosition, constraints?: PanelConstraints): PanelPosition {
  if (!constraints) return position;

  const { minX = 0, maxX = window.innerWidth, minY = 0, maxY = window.innerHeight } = constraints;

  return {
    top: Math.max(minY, Math.min(maxY, position.top || 0)),
    left: Math.max(minX, Math.min(maxX, position.left || 0)),
  };
}

/**
 * Snap position to nearest snap point
 */
export function snapToPoint(position: PanelPosition, snapPoints?: PanelSnapPoints): PanelPosition {
  if (!snapPoints || snapPoints.length === 0) return position;

  let closestPoint = snapPoints[0];
  let minDistance = Math.sqrt(
    Math.pow((position.left || 0) - closestPoint.left, 2) + Math.pow((position.top || 0) - closestPoint.top, 2)
  );

  for (const point of snapPoints) {
    const distance = Math.sqrt(
      Math.pow((position.left || 0) - point.left, 2) + Math.pow((position.top || 0) - point.top, 2)
    );
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
export function getDragState(isDragging: boolean, startPosition: PanelPosition, currentPosition: PanelPosition) {
  return {
    isDragging,
    startPosition,
    currentPosition,
    delta: {
      x: (currentPosition.left || 0) - (startPosition.left || 0),
      y: (currentPosition.top || 0) - (startPosition.top || 0),
    },
  };
}
