/**
 * Geometry Algorithm
 *
 * A comprehensive geometry toolkit for 2D geometric calculations,
 * transformations, and spatial operations used throughout the application.
 *
 * This module aggregates specialized geometry algorithms from focused modules:
 * - Vector algorithms for point and vector operations
 * - Collision algorithms for intersection detection and spatial relationships
 * - Transformation algorithms for geometric transformations
 *
 * @module algorithms/geometry
 */
// Re-export all operation classes
export { PointOps } from "./geometry/shapes/point-algorithms";
export { VectorOps } from "./geometry/vectors/vector-algorithms";
export { LineOps } from "./geometry/shapes/line-algorithms";
export { RectangleOps } from "./geometry/shapes/rectangle-algorithms";
export { CircleOps } from "./geometry/shapes/circle-algorithms";
export { PolygonOps } from "./geometry/shapes/polygon-algorithms";
export { TransformOps } from "./geometry/transformations/transformation-algorithms";
// Re-export collision detection functions (excluding SpatialHash to avoid conflicts)
export { checkCollision, batchCollisionDetection, pointInAABB, areAABBsTouching, expandAABB, unionAABB, intersectionAABB, containsAABB, SpatialCollisionOptimizer, } from "./geometry/collision";
