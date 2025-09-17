import type { Point3D } from "../types";
/**
 * Size mapping strategies for point clouds
 */
export type SizeMappingStrategy = "importance" | "confidence" | "uniform";
/**
 * Calculate point sizes based on different strategies
 */
export declare function calculatePointSizes(points: Point3D[], strategy?: SizeMappingStrategy, baseSize?: number): Point3D[];
