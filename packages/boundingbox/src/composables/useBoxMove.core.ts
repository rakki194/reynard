/**
 * Core Box Move State Management
 * 
 * Handles the fundamental state for box movement operations
 */

import { createSignal } from 'solid-js';
import type { BoundingBox } from '../types';

export interface MoveConstraints {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  enableBoundaryCheck: boolean;
  enableSnapping: boolean;
  snapThreshold: number;
  enableAlignment: boolean;
  alignmentThreshold: number;
}

export interface MoveState {
  isMoving: boolean;
  boxId: string | null;
  originalBox: BoundingBox | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
}

export function createMoveState(): {
  state: () => MoveState;
  setIsMoving: (moving: boolean) => void;
  setBoxId: (id: string | null) => void;
  setOriginalBox: (box: BoundingBox | null) => void;
  setStartPosition: (x: number, y: number) => void;
  setCurrentPosition: (x: number, y: number) => void;
  setDelta: (deltaX: number, deltaY: number) => void;
  reset: () => void;
} {
  const [state, setState] = createSignal<MoveState>({
    isMoving: false,
    boxId: null,
    originalBox: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  const setIsMoving = (moving: boolean) => {
    setState(prev => ({ ...prev, isMoving: moving }));
  };

  const setBoxId = (id: string | null) => {
    setState(prev => ({ ...prev, boxId: id }));
  };

  const setOriginalBox = (box: BoundingBox | null) => {
    setState(prev => ({ ...prev, originalBox: box }));
  };

  const setStartPosition = (x: number, y: number) => {
    setState(prev => ({ ...prev, startX: x, startY: y }));
  };

  const setCurrentPosition = (x: number, y: number) => {
    setState(prev => ({ ...prev, currentX: x, currentY: y }));
  };

  const setDelta = (deltaX: number, deltaY: number) => {
    setState(prev => ({ ...prev, deltaX, deltaY }));
  };

  const reset = () => {
    setState({
      isMoving: false,
      boxId: null,
      originalBox: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
    });
  };

  return {
    state,
    setIsMoving,
    setBoxId,
    setOriginalBox,
    setStartPosition,
    setCurrentPosition,
    setDelta,
    reset,
  };
}
