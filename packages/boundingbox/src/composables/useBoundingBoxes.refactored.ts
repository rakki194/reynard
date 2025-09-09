/**
 * useBoundingBoxes composable - Refactored
 *
 * Modular bounding box management with separated concerns:
 * - Core state management in useBoundingBoxes.core
 * - CRUD operations in useBoundingBoxes.operations
 * - Main composable orchestrates the modules
 */

import type { BoundingBox, ImageInfo } from "../types";
import {
  createBoundingBoxState,
  createBoundingBoxComputed,
} from "./useBoundingBoxes.core";
import { createBoundingBoxOperations } from "./useBoundingBoxes.operations";

export interface UseBoundingBoxesOptions {
  initialBoxes?: BoundingBox[];
  imageInfo?: ImageInfo;
  enableValidation?: boolean;
}

export interface UseBoundingBoxesReturn {
  boxes: () => BoundingBox[];
  setBoxes: (boxes: BoundingBox[]) => void;
  addBox: (box: BoundingBox) => boolean;
  updateBox: (id: string, updates: Partial<BoundingBox>) => boolean;
  removeBox: (id: string) => boolean;
  selectBox: (id: string | null) => void;
  selectedBoxId: () => string | null;
  clearBoxes: () => void;
  getBox: (id: string) => BoundingBox | undefined;
  hasBox: (id: string) => boolean;
  boxCount: () => number;
  selectedBox: () => BoundingBox | undefined;
  validationErrors: () => Record<string, string[]>;
}

export function useBoundingBoxes(
  options: UseBoundingBoxesOptions = {},
): UseBoundingBoxesReturn {
  const { initialBoxes = [], imageInfo, enableValidation = true } = options;

  // Create core state
  const state = createBoundingBoxState(initialBoxes);

  // Create computed values
  const computed = createBoundingBoxComputed(state);

  // Create operations
  const operations = createBoundingBoxOperations(
    state,
    imageInfo,
    enableValidation,
  );

  // Selection management
  const selectBox = (id: string | null) => {
    if (id && !operations.hasBox(id)) {
      console.warn("Cannot select non-existent box:", id);
      return;
    }
    state.setSelectedBoxId(id);
  };

  return {
    // State accessors
    boxes: state.boxes,
    setBoxes: state.setBoxes,
    selectedBoxId: state.selectedBoxId,
    validationErrors: state.validationErrors,

    // Operations
    addBox: operations.addBox,
    updateBox: operations.updateBox,
    removeBox: operations.deleteBox,
    getBox: operations.getBox,
    hasBox: operations.hasBox,
    clearBoxes: operations.clearBoxes,

    // Selection
    selectBox,
    selectedBox: computed.selectedBox,

    // Computed
    boxCount: computed.boxCount,
  };
}
