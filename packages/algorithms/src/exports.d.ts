/**
 * Clean exports for core algorithm classes
 * This file provides organized exports from the modular directory structure
 */
export { UnionFind } from "./union-find/union-find-core";
export type { UnionFindStats, UnionFindNode, } from "./union-find/union-find-types";
export { SpatialHash } from "./spatial-hash/spatial-hash-core";
export type { SpatialHashConfig, SpatialHashStats, SpatialObject, QueryResult, } from "./spatial-hash/spatial-hash-types";
export type { Point } from "./geometry/shapes/point-algorithms";
export type { Vector } from "./geometry/vectors/vector-algorithms";
export type { Line, Rectangle, Circle, Polygon, } from "./geometry/shapes/shapes";
export type { Transform } from "./geometry/transformations/transformation-algorithms";
export { PointOps } from "./geometry/shapes/point-algorithms";
export { VectorOps } from "./geometry/vectors/vector-algorithms";
export { LineOps } from "./geometry/shapes/line-algorithms";
export { RectangleOps } from "./geometry/shapes/rectangle-algorithms";
export { CircleOps } from "./geometry/shapes/circle-algorithms";
export { PolygonOps } from "./geometry/shapes/polygon-algorithms";
export { TransformOps } from "./geometry/transformations/transformation-algorithms";
export { PerformanceTimer } from "./performance/timer";
export { MemoryMonitor, MemoryLeakDetector } from "./performance/memory";
export { PerformanceBenchmark, measureAsync, measureSync, } from "./performance/benchmark";
export { FrameRateMonitor } from "./performance/framerate";
export { throttle, debounce } from "./performance/throttle";
export { PerformanceBudgetChecker } from "./performance/budget";
export type { AABB, CollisionPair, CollisionResult, } from "./geometry/collision/aabb-types";
export { checkCollision, batchCollisionDetection, batchCollisionWithSpatialHash, pointInAABB, areAABBsTouching, expandAABB, unionAABB, intersectionAABB, containsAABB, SpatialCollisionOptimizer, } from "./geometry/collision";
export { detectCollisions, performSpatialQuery, PerformanceMonitor, OptimizationConfig, configureOptimization, cleanup, } from "./optimized";
