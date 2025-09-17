/**
 * AABB (Axis-Aligned Bounding Box) Utilities
 *
 * Utility functions for AABB calculations and measurements.
 * Provides simple mathematical operations on AABB objects.
 *
 * @module algorithms/aabbUtils
 */
/**
 * Calculate the area of an AABB
 */
export function getAABBArea(aabb) {
    return aabb.width * aabb.height;
}
/**
 * Calculate the perimeter of an AABB
 */
export function getAABBPerimeter(aabb) {
    return 2 * (aabb.width + aabb.height);
}
