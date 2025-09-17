import type { EmbeddingPoint, EmbeddingRenderingConfig } from "../types/rendering";
/**
 * Apply color mapping to points based on configuration
 */
export declare function applyColorMapping(points: EmbeddingPoint[], colorMapping: string): void;
/**
 * Apply size mapping to points based on configuration
 */
export declare function applySizeMapping(points: EmbeddingPoint[], sizeMapping: string, baseSize: number): void;
/**
 * Filter points based on configuration
 */
export declare function filterPoints(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): EmbeddingPoint[];
/**
 * Generate a cache key for materials
 */
export declare function generateMaterialCacheKey(config: EmbeddingRenderingConfig): string;
/**
 * Generate a cache key for geometries
 */
export declare function generateGeometryCacheKey(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): string;
/**
 * Calculate bounding box for points
 */
export declare function calculateBoundingBox(points: EmbeddingPoint[]): {
    min: [number, number, number];
    max: [number, number, number];
};
/**
 * Calculate center point for points
 */
export declare function calculateCenter(points: EmbeddingPoint[]): [number, number, number];
/**
 * Calculate distance between two points
 */
export declare function calculateDistance(point1: [number, number, number], point2: [number, number, number]): number;
/**
 * Normalize points to fit within a unit cube
 */
export declare function normalizePoints(points: EmbeddingPoint[]): EmbeddingPoint[];
