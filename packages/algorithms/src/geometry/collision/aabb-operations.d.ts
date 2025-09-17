/**
 * AABB (Axis-Aligned Bounding Box) Operations
 *
 * Basic geometric operations for AABB manipulation and analysis.
 * Provides utility functions for AABB transformations and calculations.
 *
 * @module algorithms/aabbOperations
 */
import type { AABB } from "./aabb-types";
/**
 * Check if a point is inside an AABB
 */
export declare function pointInAABB(point: {
    x: number;
    y: number;
}, aabb: AABB): boolean;
/**
 * Get the union of two AABBs
 */
export declare function unionAABB(a: AABB, b: AABB): AABB;
/**
 * Get the intersection of two AABBs
 */
export declare function intersectionAABB(a: AABB, b: AABB): AABB | null;
/**
 * Expand an AABB by a given amount
 */
export declare function expandAABB(aabb: AABB, amount: number): AABB;
/**
 * Check if an AABB is completely contained within another
 */
export declare function containsAABB(container: AABB, contained: AABB): boolean;
/**
 * Check if two AABBs are touching (edge contact)
 */
export declare function areAABBsTouching(a: AABB, b: AABB): boolean;
