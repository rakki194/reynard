/**
 * Type definitions for Spatial Hashing Algorithm
 *
 * @module algorithms/spatialHashTypes
 */

export interface SpatialHashConfig {
  cellSize: number;
  maxObjectsPerCell: number;
  enableAutoResize: boolean;
  resizeThreshold: number;
  cleanupInterval: number;
}

export interface SpatialHashStats {
  totalCells: number;
  totalObjects: number;
  averageObjectsPerCell: number;
  maxObjectsInCell: number;
  emptyCells: number;
  memoryUsage: number;
  queryCount: number;
  insertCount: number;
  removeCount: number;
}

export interface SpatialObject {
  id: string | number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  data?: any;
}

export interface QueryResult<T = any> {
  object: SpatialObject & { data: T };
  distance: number;
  cellKey: string;
}
