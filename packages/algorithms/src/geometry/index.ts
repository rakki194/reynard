/**
 * Geometry Algorithm Module
 *
 * A comprehensive geometry toolkit for 2D geometric calculations,
 * transformations, and spatial operations used throughout the application.
 *
 * This module aggregates specialized geometry algorithms from focused modules:
 * - Collision detection algorithms
 * - Shape algorithms for points, lines, circles, rectangles, and polygons
 * - Vector algorithms for point and vector operations
 * - Transformation algorithms for geometric transformations
 *
 * @module algorithms/geometry
 */

// Export collision detection algorithms
export * from './collision';

// Export shape algorithms
export * from './shapes';

// Export vector algorithms
export * from './vectors';

// Export transformation algorithms
export * from './transformations';

// Re-export all types and classes from specialized modules
export type { Point } from './shapes/point-algorithms';
export type { Vector } from './vectors/vector-algorithms';
export type { Line } from './shapes/line-algorithms';
export type { Rectangle } from './shapes/rectangle-algorithms';
export type { Circle } from './shapes/circle-algorithms';
export type { Polygon } from './shapes/polygon-algorithms';
