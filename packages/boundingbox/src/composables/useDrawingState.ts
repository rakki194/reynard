/**
 * Drawing State Composable
 *
 * Manages drawing state for new bounding boxes
 */

import { createSignal } from "solid-js";
import type { BoundingBox } from "../types";

export interface DrawingState {
  isDrawing: () => boolean;
  setIsDrawing: (value: boolean) => void;
  newBox: () => Partial<BoundingBox> | null;
  setNewBox: (value: Partial<BoundingBox> | null) => void;
  startPoint: () => { x: number; y: number } | null;
  setStartPoint: (value: { x: number; y: number } | null) => void;
}

export const useDrawingState = (): DrawingState => {
  const [isDrawing, setIsDrawing] = createSignal(false);
  const [newBox, setNewBox] = createSignal<Partial<BoundingBox> | null>(null);
  const [startPoint, setStartPoint] = createSignal<{
    x: number;
    y: number;
  } | null>(null);

  return {
    isDrawing,
    setIsDrawing,
    newBox,
    setNewBox,
    startPoint,
    setStartPoint,
  };
};
