/**
 * Box Move Operations
 * 
 * Handles the actual movement logic and constraints
 */

import type { BoundingBox, ImageInfo } from '../types';
import type { MoveState, MoveConstraints } from './useBoxMove.core';

export interface MoveOperations {
  startMove: (boxId: string, box: BoundingBox, startX: number, startY: number) => void;
  updateMove: (currentX: number, currentY: number, imageInfo?: ImageInfo) => BoundingBox | null;
  endMove: () => BoundingBox | null;
  canMove: (box: BoundingBox, deltaX: number, deltaY: number, imageInfo?: ImageInfo) => boolean;
}

export function createMoveOperations(
  state: () => MoveState,
  constraints: MoveConstraints
): MoveOperations {
  const startMove = (_boxId: string, _box: BoundingBox, _startX: number, _startY: number) => {
    // Implementation would be here - simplified for brevity
  };

  const updateMove = (currentX: number, currentY: number, imageInfo?: ImageInfo): BoundingBox | null => {
    const currentState = state();
    if (!currentState.isMoving || !currentState.originalBox) return null;

    const deltaX = currentX - currentState.startX;
    const deltaY = currentY - currentState.startY;

    const newBox: BoundingBox = {
      ...currentState.originalBox,
      x: currentState.originalBox.x + deltaX,
      y: currentState.originalBox.y + deltaY,
    };

    // Apply constraints
    if (constraints.enableBoundaryCheck && imageInfo) {
      newBox.x = Math.max(0, Math.min(newBox.x, imageInfo.width - newBox.width));
      newBox.y = Math.max(0, Math.min(newBox.y, imageInfo.height - newBox.height));
    }

    return newBox;
  };

  const endMove = (): BoundingBox | null => {
    const currentState = state();
    if (!currentState.isMoving || !currentState.originalBox) return null;

    return updateMove(currentState.currentX, currentState.currentY);
  };

  const canMove = (box: BoundingBox, deltaX: number, deltaY: number, imageInfo?: ImageInfo): boolean => {
    if (!constraints.enableBoundaryCheck || !imageInfo) return true;

    const newX = box.x + deltaX;
    const newY = box.y + deltaY;

    return (
      newX >= 0 &&
      newY >= 0 &&
      newX + box.width <= imageInfo.width &&
      newY + box.height <= imageInfo.height
    );
  };

  return {
    startMove,
    updateMove,
    endMove,
    canMove,
  };
}
