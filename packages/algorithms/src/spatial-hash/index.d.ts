/**
 * Spatial Hashing Algorithm Module
 *
 * A highly optimized spatial partitioning system for efficient spatial queries,
 * nearest neighbor searches, and collision detection optimization.
 *
 * Features:
 * - Dynamic cell size adjustment
 * - Efficient spatial queries
 * - Memory-optimized storage
 * - Type-safe operations
 * - Performance monitoring
 * - Automatic cleanup
 *
 * @module algorithms/spatialHash
 */
export * from "./spatial-hash-types";
export { SpatialHash } from "./spatial-hash-core";
export * from "./spatial-hash-utils";
export { SpatialHash as default } from "./spatial-hash";
