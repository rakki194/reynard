import type { PerformanceStats, RenderStats } from "../types";
interface RenderInfo {
    drawCalls?: number;
    triangles?: number;
    memoryUsage?: number;
    gpuMemoryUsage?: number;
}
interface BoundingBox {
    min: {
        x: number;
        y: number;
        z: number;
    };
    max: {
        x: number;
        y: number;
        z: number;
    };
}
interface Camera {
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation?: {
        x: number;
        y: number;
        z: number;
    };
}
interface RenderObject {
    position: {
        x: number;
        y: number;
        z: number;
    };
    boundingBox: BoundingBox;
}
interface Frustum {
    intersectsBox(boundingBox: BoundingBox): boolean;
}
interface InstanceData {
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation?: {
        x: number;
        y: number;
        z: number;
    };
    scale?: {
        x: number;
        y: number;
        z: number;
    };
}
/**
 * Performance monitor class for tracking 3D rendering performance
 */
export declare class PerformanceMonitor {
    private frameCount;
    private lastTime;
    private fps;
    private frameTime;
    private drawCalls;
    private triangles;
    private memoryUsage;
    private gpuMemoryUsage;
    /**
     * Update performance metrics
     */
    update(currentTime: number, renderInfo?: RenderInfo): PerformanceStats;
    /**
     * Get current performance stats
     */
    getStats(): PerformanceStats;
    /**
     * Reset performance counters
     */
    reset(): void;
}
/**
 * Level of Detail (LOD) manager for optimizing rendering performance
 */
export declare class LODManager {
    private lodLevels;
    private distances;
    /**
     * Calculate LOD level based on distance
     */
    calculateLOD(distance: number): number;
    /**
     * Get LOD factor for a given level
     */
    getLODFactor(level: number): number;
    /**
     * Set custom LOD levels and distances
     */
    setLODLevels(levels: number[], distances: number[]): void;
}
/**
 * Frustum culling utility for optimizing rendering
 */
export declare class FrustumCuller {
    private frustum;
    /**
     * Set the camera frustum
     */
    setFrustum(frustum: Frustum): void;
    /**
     * Check if a bounding box is visible in the frustum
     */
    isVisible(boundingBox: BoundingBox): boolean;
    /**
     * Filter visible objects from a list
     */
    filterVisible(objects: RenderObject[]): RenderObject[];
}
/**
 * Occlusion culling utility (simplified implementation)
 */
export declare class OcclusionCuller {
    private occluders;
    /**
     * Add an occluder object
     */
    addOccluder(object: RenderObject): void;
    /**
     * Remove an occluder object
     */
    removeOccluder(object: RenderObject): void;
    /**
     * Check if an object is occluded
     */
    isOccluded(object: RenderObject, camera: Camera): boolean;
    /**
     * Check if object is behind occluder from camera perspective
     */
    private isObjectBehindOccluder;
    /**
     * Get distance from object to camera
     */
    private getDistanceToCamera;
}
/**
 * Instancing manager for rendering multiple similar objects efficiently
 */
export declare class InstancingManager {
    private instances;
    /**
     * Add instances for a geometry
     */
    addInstances(geometryId: string, instances: InstanceData[]): void;
    /**
     * Get instances for a geometry
     */
    getInstances(geometryId: string): InstanceData[];
    /**
     * Remove instances for a geometry
     */
    removeInstances(geometryId: string): void;
    /**
     * Clear all instances
     */
    clear(): void;
    /**
     * Get total instance count
     */
    getTotalInstances(): number;
}
/**
 * Memory manager for tracking and optimizing memory usage
 */
export declare class MemoryManager {
    private allocations;
    private totalAllocated;
    /**
     * Track memory allocation
     */
    allocate(key: string, size: number): void;
    /**
     * Track memory deallocation
     */
    deallocate(key: string): void;
    /**
     * Get total allocated memory
     */
    getTotalAllocated(): number;
    /**
     * Get memory usage by key
     */
    getMemoryUsage(key: string): number;
    /**
     * Get all memory allocations
     */
    getAllocations(): Map<string, number>;
    /**
     * Clear all allocations
     */
    clear(): void;
}
/**
 * Create render stats from performance data
 */
export declare function createRenderStats(totalPoints: number, visiblePoints: number, renderedPoints: number, fps: number, memoryUsage: number, lodLevel?: number, frustumCulled?: number, occlusionCulled?: number): RenderStats;
/**
 * Debounce function for performance optimization
 */
export declare function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function for performance optimization
 */
export declare function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): (...args: Parameters<T>) => void;
export {};
