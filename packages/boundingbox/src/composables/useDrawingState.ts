/**
 * Drawing State Composable
 *
 * Manages drawing state for new bounding boxes
 */

import { createSignal } from "solid-js";
import type { BoundingBox } from "../types";
import type { Setter } from "solid-js";

export interface DrawingState {
  isDrawing: () => boolean;
  setIsDrawing: Setter<boolean>;
  newBox: () => Partial<BoundingBox> | null;
  setNewBox: Setter<Partial<BoundingBox> | null>;
  startPoint: () => { x: number; y: number } | null;
  setStartPoint: Setter<{ x: number; y: number } | null>;
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
