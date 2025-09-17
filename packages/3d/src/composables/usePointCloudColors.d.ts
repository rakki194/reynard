import type { Point3D } from "../types";
/**
 * Color mapping strategies for point clouds
 */
export type ColorMappingStrategy = "similarity" | "cluster" | "importance" | "confidence" | "custom";
/**
 * Calculate point colors based on different strategies
 */
export declare function calculatePointColors(points: Point3D[], strategy?: ColorMappingStrategy): Point3D[];
