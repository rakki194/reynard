// Performance monitoring and optimization utilities

import type { PerformanceStats, RenderStats } from "../types";

// Type definitions for performance utilities
interface RenderInfo {
  drawCalls?: number;
  triangles?: number;
  memoryUsage?: number;
  gpuMemoryUsage?: number;
}

interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

interface Camera {
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

interface RenderObject {
  position: { x: number; y: number; z: number };
  boundingBox: BoundingBox;
}

interface Frustum {
  intersectsBox(boundingBox: BoundingBox): boolean;
}

interface InstanceData {
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

/**
 * Performance monitor class for tracking 3D rendering performance
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private frameTime = 0;
  private drawCalls = 0;
  private triangles = 0;
  private memoryUsage = 0;
  private gpuMemoryUsage = 0;

  /**
   * Update performance metrics
   */
  update(currentTime: number, renderInfo?: RenderInfo): PerformanceStats {
    this.frameCount++;

    if (this.lastTime === 0) {
      this.lastTime = currentTime;
      return this.getStats();
    }

    const deltaTime = currentTime - this.lastTime;
    this.frameTime = deltaTime;
    this.fps = 1000 / deltaTime;

    // Update render info if provided
    if (renderInfo) {
      this.drawCalls = renderInfo.drawCalls || 0;
      this.triangles = renderInfo.triangles || 0;
      this.memoryUsage = renderInfo.memoryUsage || 0;
      this.gpuMemoryUsage = renderInfo.gpuMemoryUsage || 0;
    }

    // Update memory usage if available (Chrome only)
    if (
      (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
    ) {
      this.memoryUsage =
        (performance as unknown as { memory: { usedJSHeapSize: number } })
          .memory.usedJSHeapSize /
        1024 /
        1024; // MB
    }

    this.lastTime = currentTime;
    return this.getStats();
  }

  /**
   * Get current performance stats
   */
  getStats(): PerformanceStats {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      drawCalls: this.drawCalls,
      triangles: this.triangles,
      memoryUsage: this.memoryUsage,
      gpuMemoryUsage: this.gpuMemoryUsage,
    };
  }

  /**
   * Reset performance counters
   */
  reset(): void {
    this.frameCount = 0;
    this.lastTime = 0;
    this.fps = 0;
    this.frameTime = 0;
    this.drawCalls = 0;
    this.triangles = 0;
    this.memoryUsage = 0;
    this.gpuMemoryUsage = 0;
  }
}

/**
 * Level of Detail (LOD) manager for optimizing rendering performance
 */
export class LODManager {
  private lodLevels: number[] = [1, 0.5, 0.25, 0.1];
  private distances: number[] = [10, 50, 100, 200];

  /**
   * Calculate LOD level based on distance
   */
  calculateLOD(distance: number): number {
    for (let i = 0; i < this.distances.length; i++) {
      const threshold = this.distances[i];
      if (threshold !== undefined && distance <= threshold) {
        return i;
      }
    }
    return this.lodLevels.length - 1;
  }

  /**
   * Get LOD factor for a given level
   */
  getLODFactor(level: number): number {
    return this.lodLevels[Math.min(level, this.lodLevels.length - 1)] || 1;
  }

  /**
   * Set custom LOD levels and distances
   */
  setLODLevels(levels: number[], distances: number[]): void {
    this.lodLevels = levels;
    this.distances = distances;
  }
}

/**
 * Frustum culling utility for optimizing rendering
 */
export class FrustumCuller {
  private frustum: Frustum | null = null;

  /**
   * Set the camera frustum
   */
  setFrustum(frustum: Frustum): void {
    this.frustum = frustum;
  }

  /**
   * Check if a bounding box is visible in the frustum
   */
  isVisible(boundingBox: BoundingBox): boolean {
    if (!this.frustum) return true;
    return this.frustum.intersectsBox(boundingBox);
  }

  /**
   * Filter visible objects from a list
   */
  filterVisible(objects: RenderObject[]): RenderObject[] {
    if (!this.frustum) return objects;
    return objects.filter((obj) => this.isVisible(obj.boundingBox));
  }
}

/**
 * Occlusion culling utility (simplified implementation)
 */
export class OcclusionCuller {
  private occluders: RenderObject[] = [];

  /**
   * Add an occluder object
   */
  addOccluder(object: RenderObject): void {
    this.occluders.push(object);
  }

  /**
   * Remove an occluder object
   */
  removeOccluder(object: RenderObject): void {
    const index = this.occluders.indexOf(object);
    if (index > -1) {
      this.occluders.splice(index, 1);
    }
  }

  /**
   * Check if an object is occluded
   */
  isOccluded(object: RenderObject, camera: Camera): boolean {
    // Simplified occlusion test - in a real implementation,
    // this would use more sophisticated algorithms
    for (const occluder of this.occluders) {
      if (this.isObjectBehindOccluder(object, occluder, camera)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if object is behind occluder from camera perspective
   */
  private isObjectBehindOccluder(
    object: RenderObject,
    occluder: RenderObject,
    camera: Camera,
  ): boolean {
    // This is a simplified implementation
    // In practice, you'd use proper depth testing and ray casting
    const objectDistance = this.getDistanceToCamera(object, camera);
    const occluderDistance = this.getDistanceToCamera(occluder, camera);
    return objectDistance > occluderDistance;
  }

  /**
   * Get distance from object to camera
   */
  private getDistanceToCamera(object: RenderObject, camera: Camera): number {
    const dx = object.position.x - camera.position.x;
    const dy = object.position.y - camera.position.y;
    const dz = object.position.z - camera.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

/**
 * Instancing manager for rendering multiple similar objects efficiently
 */
export class InstancingManager {
  private instances: Map<string, InstanceData[]> = new Map();

  /**
   * Add instances for a geometry
   */
  addInstances(geometryId: string, instances: InstanceData[]): void {
    this.instances.set(geometryId, instances);
  }

  /**
   * Get instances for a geometry
   */
  getInstances(geometryId: string): InstanceData[] {
    return this.instances.get(geometryId) || [];
  }

  /**
   * Remove instances for a geometry
   */
  removeInstances(geometryId: string): void {
    this.instances.delete(geometryId);
  }

  /**
   * Clear all instances
   */
  clear(): void {
    this.instances.clear();
  }

  /**
   * Get total instance count
   */
  getTotalInstances(): number {
    let total = 0;
    for (const instances of this.instances.values()) {
      total += instances.length;
    }
    return total;
  }
}

/**
 * Memory manager for tracking and optimizing memory usage
 */
export class MemoryManager {
  private allocations: Map<string, number> = new Map();
  private totalAllocated = 0;

  /**
   * Track memory allocation
   */
  allocate(key: string, size: number): void {
    this.allocations.set(key, size);
    this.totalAllocated += size;
  }

  /**
   * Track memory deallocation
   */
  deallocate(key: string): void {
    const size = this.allocations.get(key);
    if (size) {
      this.allocations.delete(key);
      this.totalAllocated -= size;
    }
  }

  /**
   * Get total allocated memory
   */
  getTotalAllocated(): number {
    return this.totalAllocated;
  }

  /**
   * Get memory usage by key
   */
  getMemoryUsage(key: string): number {
    return this.allocations.get(key) || 0;
  }

  /**
   * Get all memory allocations
   */
  getAllocations(): Map<string, number> {
    return new Map(this.allocations);
  }

  /**
   * Clear all allocations
   */
  clear(): void {
    this.allocations.clear();
    this.totalAllocated = 0;
  }
}

/**
 * Create render stats from performance data
 */
export function createRenderStats(
  totalPoints: number,
  visiblePoints: number,
  renderedPoints: number,
  fps: number,
  memoryUsage: number,
  lodLevel: number = 0,
  frustumCulled: number = 0,
  occlusionCulled: number = 0,
): RenderStats {
  return {
    totalPoints,
    visiblePoints,
    renderedPoints,
    fps,
    memoryUsage,
    lodLevel,
    frustumCulled,
    occlusionCulled,
  };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
