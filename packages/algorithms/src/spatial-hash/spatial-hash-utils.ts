/**
 * Utility functions for Spatial Hashing Algorithm
 *
 * @module algorithms/spatialHashUtils
 */

import { SpatialObject, SpatialHashConfig } from './spatial-hash-types';
import { SpatialHash } from './spatial-hash-core';

/**
 * Utility function to create a spatial hash optimized for a specific use case
 */
export function createOptimizedSpatialHash<T = any>(
  objects: Array<SpatialObject & { data: T }>,
  options: {
    targetCellSize?: number;
    maxObjectsPerCell?: number;
  } = {}
): SpatialHash<T> {
  const { targetCellSize, maxObjectsPerCell = 50 } = options;

  // Calculate optimal cell size based on object distribution
  let optimalCellSize = targetCellSize || 100;
  if (objects.length > 0) {
    const avgWidth = objects.reduce((sum, obj) => sum + (obj.width || 0), 0) / objects.length;
    const avgHeight = objects.reduce((sum, obj) => sum + (obj.height || 0), 0) / objects.length;
    optimalCellSize = Math.max(50, Math.min(200, Math.sqrt(avgWidth * avgHeight) * 2));
  }

  const hash = new SpatialHash<T>({
    cellSize: optimalCellSize,
    maxObjectsPerCell,
    enableAutoResize: true,
  });

  // Insert all objects
  for (const object of objects) {
    hash.insert(object);
  }

  return hash;
}

/**
 * Calculate optimal cell size based on object distribution
 */
export function calculateOptimalCellSize(objects: Array<SpatialObject>): number {
  if (objects.length === 0) return 100;
  
  const avgWidth = objects.reduce((sum, obj) => sum + (obj.width || 0), 0) / objects.length;
  const avgHeight = objects.reduce((sum, obj) => sum + (obj.height || 0), 0) / objects.length;
  
  return Math.max(50, Math.min(200, Math.sqrt(avgWidth * avgHeight) * 2));
}

/**
 * Estimate memory usage for spatial hash data structures
 */
export function estimateMemoryUsage(
  cellCount: number,
  objectCount: number,
  objectToCellCount: number
): number {
  let usage = 0;
  
  // Estimate Map overhead
  usage += cellCount * 50; // Rough estimate for Map entries
  usage += objectToCellCount * 30; // Rough estimate for object tracking
  
  // Estimate object storage
  usage += objectCount * 100; // Rough estimate per object
  
  return usage;
}
