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
export declare function applyResizeConstraints(dimensions: ResizeDimensions, constraints: TransformConstraints): ResizeDimensions;
/**
 * Calculates aspect ratio from dimensions
 *
 * @param dimensions - The dimensions to calculate aspect ratio from
 * @returns The aspect ratio (width / height)
 */
export declare function calculateAspectRatio(dimensions: ResizeDimensions): number;
/**
 * Validates if dimensions meet constraints
 *
 * @param dimensions - The dimensions to validate
 * @param constraints - The constraints to check against
 * @returns True if dimensions are valid
 */
export declare function validateResizeConstraints(dimensions: ResizeDimensions, constraints: TransformConstraints): boolean;
