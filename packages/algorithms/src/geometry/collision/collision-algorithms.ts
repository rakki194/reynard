/**
 * Collision Algorithms
 *
 * Specialized algorithms for collision detection, intersection testing,
 * and spatial relationship calculations between geometric shapes.
 *
 * @module algorithms/collision-algorithms
 */

// Re-export all shape interfaces
export type { Line, Rectangle, Circle, Polygon } from './shapes';

// Re-export all algorithm classes
export { LineOps } from './line-algorithms';
export { RectangleOps } from './rectangle-algorithms';
export { CircleOps } from './circle-algorithms';
export { PolygonOps } from './polygon-algorithms';
