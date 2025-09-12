/**
 * Box Move Operations
 *
 * Handles the actual movement logic and constraints
 */

import type { BoundingBox, ImageInfo } from "../types";
import type { MoveState, MoveConstraints } from "./useBoxMove.core";

export interface MoveOperations {
  startMove: (
    boxId: string,
    box: BoundingBox,
    startX: number,
    startY: number,
  ) => void;
  updateMove: (
    currentX: number,
    currentY: number,
    imageInfo?: ImageInfo,
  ) => BoundingBox | null;
  endMove: () => BoundingBox | null;
  canMove: (
    box: BoundingBox,
    deltaX: number,
    deltaY: number,
    imageInfo?: ImageInfo,
  ) => boolean;
}

export function createMoveOperations(
  state: {
    state: () => MoveState;
    setIsMoving: (moving: boolean) => void;
    setBoxId: (id: string | null) => void;
    setOriginalBox: (box: BoundingBox | null) => void;
    setStartPosition: (x: number, y: number) => void;
    setCurrentPosition: (x: number, y: number) => void;
    setDelta: (deltaX: number, deltaY: number) => void;
    reset: () => void;
  },
  constraints: MoveConstraints,
): MoveOperations {
  const startMove = (
    boxId: string,
    box: BoundingBox,
    startX: number,
    startY: number,
  ) => {
    state.setIsMoving(true);
    state.setBoxId(boxId);
    state.setOriginalBox(box);
    state.setStartPosition(startX, startY);
    state.setCurrentPosition(startX, startY);
    state.setDelta(0, 0);
  };

  const updateMove = (
    currentX: number,
    currentY: number,
    imageInfo?: ImageInfo,
  ): BoundingBox | null => {
    const currentState = state.state();
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
      newBox.x = Math.max(
        0,
        Math.min(newBox.x, imageInfo.width - newBox.width),
      );
      newBox.y = Math.max(
        0,
        Math.min(newBox.y, imageInfo.height - newBox.height),
      );
    }

    // Update state with current position
    state.setCurrentPosition(currentX, currentY);
    state.setDelta(deltaX, deltaY);

    return newBox;
  };

  const endMove = (): BoundingBox | null => {
    const currentState = state.state();
    if (!currentState.isMoving || !currentState.originalBox) return null;

    const result = updateMove(currentState.currentX, currentState.currentY);

    // Reset the state after ending the move
    state.reset();

    return result;
  };

  const canMove = (
    box: BoundingBox,
    deltaX: number,
    deltaY: number,
    imageInfo?: ImageInfo,
  ): boolean => {
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
