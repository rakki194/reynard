/**
 * Resize Constraints Module
 *
 * Pure functions for applying resize constraints including:
 * - Size constraints (min/max width/height)
 * - Aspect ratio maintenance
 * - Position constraints
 */

import type { TransformConstraints } from "../types";

export interface ResizeDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Applies resize constraints to dimensions
 *
 * @param dimensions - The dimensions to constrain
 * @param constraints - The constraints to apply
 * @returns Constrained dimensions
 *
 * @example
 * ```typescript
 * const constrained = applyResizeConstraints(
 *   { width: 50, height: 30, x: 10, y: 20 },
 *   { minWidth: 20, minHeight: 15, maintainAspectRatio: true, aspectRatio: 1.5 }
 * );
 * ```
 */
export function applyResizeConstraints(
  dimensions: ResizeDimensions,
  constraints: TransformConstraints
): ResizeDimensions {
  let { width, height } = dimensions;
  const { x, y } = dimensions;

  // Apply size constraints
  if (constraints.minWidth !== undefined) {
    width = Math.max(width, constraints.minWidth);
  }
  if (constraints.minHeight !== undefined) {
    height = Math.max(height, constraints.minHeight);
  }
  if (constraints.maxWidth !== undefined) {
    width = Math.min(width, constraints.maxWidth);
  }
  if (constraints.maxHeight !== undefined) {
    height = Math.min(height, constraints.maxHeight);
  }

  // Apply aspect ratio constraint
  if (constraints.maintainAspectRatio && constraints.aspectRatio) {
    const currentAspectRatio = width / height;
    if (Math.abs(currentAspectRatio - constraints.aspectRatio) > 0.01) {
      // Adjust height to maintain aspect ratio
      height = width / constraints.aspectRatio;
    }
  }

  return { width, height, x, y };
}

/**
 * Calculates aspect ratio from dimensions
 *
 * @param dimensions - The dimensions to calculate aspect ratio from
 * @returns The aspect ratio (width / height)
 */
export function calculateAspectRatio(dimensions: ResizeDimensions): number {
  return dimensions.width / dimensions.height;
}

/**
 * Validates if dimensions meet constraints
 *
 * @param dimensions - The dimensions to validate
 * @param constraints - The constraints to check against
 * @returns True if dimensions are valid
 */
export function validateResizeConstraints(dimensions: ResizeDimensions, constraints: TransformConstraints): boolean {
  if (constraints.minWidth !== undefined && dimensions.width < constraints.minWidth) {
    return false;
  }
  if (constraints.minHeight !== undefined && dimensions.height < constraints.minHeight) {
    return false;
  }
  if (constraints.maxWidth !== undefined && dimensions.width > constraints.maxWidth) {
    return false;
  }
  if (constraints.maxHeight !== undefined && dimensions.height > constraints.maxHeight) {
    return false;
  }
  return true;
}
