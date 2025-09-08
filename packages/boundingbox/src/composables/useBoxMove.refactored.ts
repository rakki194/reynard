/**
 * useBoxMove composable - Refactored
 * 
 * Modular box movement with separated concerns:
 * - Core state management in useBoxMove.core
 * - Movement operations in useBoxMove.operations
 * - Main composable orchestrates the modules
 */

import type { BoundingBox, ImageInfo } from '../types';
import { createMoveState, type MoveConstraints } from './useBoxMove.core';
import { createMoveOperations } from './useBoxMove.operations';

export interface UseBoxMoveOptions {
  constraints?: Partial<MoveConstraints>;
  imageInfo?: ImageInfo;
}

export interface UseBoxMoveReturn {
  isMoving: () => boolean;
  movingBoxId: () => string | null;
  startMove: (boxId: string, box: BoundingBox, startX: number, startY: number) => void;
  updateMove: (currentX: number, currentY: number) => BoundingBox | null;
  endMove: () => BoundingBox | null;
  canMove: (box: BoundingBox, deltaX: number, deltaY: number) => boolean;
  cancelMove: () => void;
}

export function useBoxMove(
  boundingBoxes: { updateBox: (id: string, updates: Partial<BoundingBox>) => boolean },
  options: UseBoxMoveOptions = {}
): UseBoxMoveReturn {
  const { constraints = {}, imageInfo } = options;

  // Default constraints
  const defaultConstraints: MoveConstraints = {
    minX: 0,
    maxX: imageInfo?.width || 1000,
    minY: 0,
    maxY: imageInfo?.height || 1000,
    enableBoundaryCheck: true,
    enableSnapping: false,
    snapThreshold: 10,
    enableAlignment: false,
    alignmentThreshold: 5,
  };

  const finalConstraints = { ...defaultConstraints, ...constraints };

  // Create state and operations
  const state = createMoveState();
  const operations = createMoveOperations(state.state, finalConstraints);

  const startMove = (boxId: string, box: BoundingBox, startX: number, startY: number) => {
    operations.startMove(boxId, box, startX, startY);
  };

  const updateMove = (currentX: number, currentY: number): BoundingBox | null => {
    return operations.updateMove(currentX, currentY, imageInfo);
  };

  const endMove = (): BoundingBox | null => {
    return operations.endMove();
  };

  const canMove = (box: BoundingBox, deltaX: number, deltaY: number): boolean => {
    return operations.canMove(box, deltaX, deltaY, imageInfo);
  };

  const cancelMove = () => {
    state.reset();
  };

  return {
    isMoving: () => state.state().isMoving,
    movingBoxId: () => state.state().boxId,
    startMove,
    updateMove,
    endMove,
    canMove,
    cancelMove,
  };
}
