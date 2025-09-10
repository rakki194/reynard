/**
 * useBoxMove composable - Refactored
 *
 * Modular box movement with separated concerns:
 * - Core state management in useBoxMove.core
 * - Movement operations in useBoxMove.operations
 * - Main composable orchestrates the modules
 */

import type { BoundingBox, ImageInfo } from "../types";
import {
  createMoveState,
  type MoveConstraints,
  type MoveState,
} from "./useBoxMove.core";
import { createMoveOperations } from "./useBoxMove.operations";

// Re-export types for external use
export type { MoveConstraints, MoveState };

export interface UseBoxMoveOptions {
  constraints?: Partial<MoveConstraints>;
  imageInfo?: ImageInfo;
  callbacks?: {
    onBoxMoveStart?: (boxId: string) => void;
    onBoxMoved?: (boxId: string, box: BoundingBox) => void;
    onBoxMoveEnd?: (boxId: string) => void;
  };
}

// Alias for compatibility
export type MoveOptions = UseBoxMoveOptions;

export interface UseBoxMoveReturn {
  isMoving: () => boolean;
  movingBoxId: () => string | null;
  startMove: (
    boxId: string,
    box: BoundingBox,
    startX: number,
    startY: number,
  ) => void;
  updateMove: (currentX: number, currentY: number) => BoundingBox | null;
  endMove: () => BoundingBox | null;
  canMove: (box: BoundingBox, deltaX: number, deltaY: number) => boolean;
  cancelMove: () => void;
  // Additional methods expected by tests
  startBoxMove: (
    boxId: string,
    box: BoundingBox,
    startX: number,
    startY: number,
  ) => void;
  updateBoxMove: (currentX: number, currentY: number) => BoundingBox | null;
  endBoxMove: () => BoundingBox | null;
  moveState: () => MoveState;
}

export function useBoxMove(
  boundingBoxes: {
    updateBox: (id: string, updates: Partial<BoundingBox>) => boolean;
  },
  options: UseBoxMoveOptions = {},
): UseBoxMoveReturn {
  const { constraints = {}, imageInfo, callbacks = {} } = options;

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
  const operations = createMoveOperations(state, finalConstraints);

  const startMove = (
    boxId: string,
    box: BoundingBox,
    startX: number,
    startY: number,
  ) => {
    operations.startMove(boxId, box, startX, startY);
    callbacks.onBoxMoveStart?.(boxId);
  };

  const updateMove = (
    currentX: number,
    currentY: number,
  ): BoundingBox | null => {
    const result = operations.updateMove(currentX, currentY, imageInfo);
    if (result) {
      callbacks.onBoxMoved?.(result.id, result);
    }
    return result;
  };

  const endMove = (): BoundingBox | null => {
    const result = operations.endMove();
    if (result) {
      callbacks.onBoxMoveEnd?.(result.id);
    }
    return result;
  };

  const canMove = (
    box: BoundingBox,
    deltaX: number,
    deltaY: number,
  ): boolean => {
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
    // Additional methods for compatibility
    startBoxMove: startMove,
    updateBoxMove: updateMove,
    endBoxMove: endMove,
    moveState: state.state,
  };
}
