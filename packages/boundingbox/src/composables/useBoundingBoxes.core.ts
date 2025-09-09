/**
 * Core Bounding Box State Management
 *
 * Handles the fundamental state operations for bounding boxes
 */

import { createSignal, createMemo } from "solid-js";
import type { BoundingBox } from "../types";
import { validateBoundingBox } from "../utils/validation";

export interface BoundingBoxState {
  boxes: () => BoundingBox[];
  setBoxes: (boxes: BoundingBox[]) => void;
  selectedBoxId: () => string | null;
  setSelectedBoxId: (id: string | null) => void;
  validationErrors: () => Record<string, string[]>;
  setValidationErrors: (errors: Record<string, string[]>) => void;
}

export function createBoundingBoxState(
  initialBoxes: BoundingBox[] = [],
): BoundingBoxState {
  const [boxes, setBoxes] = createSignal<BoundingBox[]>(initialBoxes);
  const [selectedBoxId, setSelectedBoxId] = createSignal<string | null>(
    initialBoxes.length > 0 ? initialBoxes[0].id : null,
  );
  const [validationErrors, setValidationErrors] = createSignal<
    Record<string, string[]>
  >({});

  return {
    boxes,
    setBoxes,
    selectedBoxId,
    setSelectedBoxId,
    validationErrors,
    setValidationErrors,
  };
}

export function createBoundingBoxComputed(state: BoundingBoxState) {
  const boxCount = createMemo(() => state.boxes().length);

  const selectedBox = createMemo(() => {
    const id = state.selectedBoxId();
    return id ? state.boxes().find((box) => box.id === id) : undefined;
  });

  return {
    boxCount,
    selectedBox,
  };
}

export function validateBoxes(
  boxes: BoundingBox[],
  enableValidation: boolean,
  imageInfo?: { width: number; height: number },
): Record<string, string[]> {
  if (!enableValidation) return {};

  const errors: Record<string, string[]> = {};

  boxes.forEach((box) => {
    if (imageInfo) {
      const validationResult = validateBoundingBox(box, imageInfo);
      if (!validationResult.isValid) {
        errors[box.id] = validationResult.errors;
      }
    }
  });

  return errors;
}
