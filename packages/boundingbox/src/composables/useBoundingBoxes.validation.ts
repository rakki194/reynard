/**
 * Bounding Box Validation Operations
 * 
 * Handles validation logic for bounding box operations
 */

import type { BoundingBox, ImageInfo } from '../types';
import { validateBoundingBox } from '../utils/validation';

export interface ValidationOperations {
  validateBox: (box: BoundingBox, imageInfo?: ImageInfo) => string[];
  canAddBox: (box: BoundingBox, existingBoxes: BoundingBox[], imageInfo?: ImageInfo) => boolean;
  canUpdateBox: (id: string, updates: Partial<BoundingBox>, existingBoxes: BoundingBox[], imageInfo?: ImageInfo) => boolean;
}

export function createValidationOperations(enableValidation = true): ValidationOperations {
  const validateBox = (box: BoundingBox, imageInfo?: ImageInfo): string[] => {
    if (!enableValidation) return [];
    return validateBoundingBox(box, imageInfo);
  };

  const canAddBox = (box: BoundingBox, existingBoxes: BoundingBox[], imageInfo?: ImageInfo): boolean => {
    if (!enableValidation) return true;
    
    const errors = validateBox(box, imageInfo);
    if (errors.length > 0) return false;
    
    return !existingBoxes.some(b => b.id === box.id);
  };

  const canUpdateBox = (id: string, updates: Partial<BoundingBox>, existingBoxes: BoundingBox[], imageInfo?: ImageInfo): boolean => {
    if (!enableValidation) return true;
    
    const existingBox = existingBoxes.find(b => b.id === id);
    if (!existingBox) return false;
    
    const updatedBox = { ...existingBox, ...updates };
    const errors = validateBox(updatedBox, imageInfo);
    
    return errors.length === 0;
  };

  return {
    validateBox,
    canAddBox,
    canUpdateBox,
  };
}
