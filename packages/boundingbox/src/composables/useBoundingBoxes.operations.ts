/**
 * Bounding Box Operations
 * 
 * Handles CRUD operations for bounding boxes
 */

import type { BoundingBox, ImageInfo } from '../types';
import type { BoundingBoxState } from './useBoundingBoxes.core';
import { createValidationOperations } from './useBoundingBoxes.validation';

export interface BoundingBoxOperations {
  addBox: (box: BoundingBox) => boolean;
  updateBox: (id: string, updates: Partial<BoundingBox>) => boolean;
  deleteBox: (id: string) => boolean;
  getBox: (id: string) => BoundingBox | undefined;
  hasBox: (id: string) => boolean;
  clearBoxes: () => void;
}

export function createBoundingBoxOperations(
  state: BoundingBoxState,
  imageInfo?: ImageInfo,
  enableValidation = true
): BoundingBoxOperations {
  const validation = createValidationOperations(enableValidation);

  const addBox = (box: BoundingBox): boolean => {
    const currentBoxes = state.boxes();
    
    if (!validation.canAddBox(box, currentBoxes, imageInfo)) {
      console.warn('Cannot add box:', box.id);
      return false;
    }

    state.setBoxes([...currentBoxes, box]);
    return true;
  };

  const updateBox = (id: string, updates: Partial<BoundingBox>): boolean => {
    const currentBoxes = state.boxes();
    const boxIndex = currentBoxes.findIndex(box => box.id === id);
    
    if (boxIndex === -1) {
      console.warn('Box not found:', id);
      return false;
    }

    if (!validation.canUpdateBox(id, updates, currentBoxes, imageInfo)) {
      console.warn('Cannot update box:', id);
      return false;
    }

    const updatedBox = { ...currentBoxes[boxIndex], ...updates };
    const newBoxes = [...currentBoxes];
    newBoxes[boxIndex] = updatedBox;
    state.setBoxes(newBoxes);
    return true;
  };

  const deleteBox = (id: string): boolean => {
    const currentBoxes = state.boxes();
    const boxIndex = currentBoxes.findIndex(box => box.id === id);
    
    if (boxIndex === -1) {
      console.warn('Box not found:', id);
      return false;
    }

    const newBoxes = currentBoxes.filter(box => box.id !== id);
    state.setBoxes(newBoxes);
    
    // Clear selection if deleted box was selected
    if (state.selectedBoxId() === id) {
      state.setSelectedBoxId(newBoxes.length > 0 ? newBoxes[0].id : null);
    }
    
    return true;
  };

  const getBox = (id: string): BoundingBox | undefined => {
    return state.boxes().find(box => box.id === id);
  };

  const hasBox = (id: string): boolean => {
    return state.boxes().some(box => box.id === id);
  };

  const clearBoxes = (): void => {
    state.setBoxes([]);
    state.setSelectedBoxId(null);
  };

  return {
    addBox,
    updateBox,
    deleteBox,
    getBox,
    hasBox,
    clearBoxes,
  };
}
