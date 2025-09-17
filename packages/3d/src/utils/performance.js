// Performance monitoring and optimization utilities
/**
 * Performance monitor class for tracking 3D rendering performance
 */
export class PerformanceMonitor {
    constructor() {
        Object.defineProperty(this, "frameCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "fps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "frameTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "drawCalls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "triangles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "memoryUsage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "gpuMemoryUsage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    /**
     * Update performance metrics
     */
    update(currentTime, renderInfo) {
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
        if (performance.memory) {
            this.memoryUsage =
                performance
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
    getStats() {
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
    reset() {
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
    constructor() {
        Object.defineProperty(this, "lodLevels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [1, 0.5, 0.25, 0.1]
        });
        Object.defineProperty(this, "distances", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [10, 50, 100, 200]
        });
    }
    /**
     * Calculate LOD level based on distance
     */
    calculateLOD(distance) {
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
    getLODFactor(level) {
        return this.lodLevels[Math.min(level, this.lodLevels.length - 1)] || 1;
    }
    /**
     * Set custom LOD levels and distances
     */
    setLODLevels(levels, distances) {
        this.lodLevels = levels;
        this.distances = distances;
    }
}
/**
 * Frustum culling utility for optimizing rendering
 */
export class FrustumCuller {
    constructor() {
        Object.defineProperty(this, "frustum", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * Set the camera frustum
     */
    setFrustum(frustum) {
        this.frustum = frustum;
    }
    /**
     * Check if a bounding box is visible in the frustum
     */
    isVisible(boundingBox) {
        if (!this.frustum)
            return true;
        return this.frustum.intersectsBox(boundingBox);
    }
    /**
     * Filter visible objects from a list
     */
    filterVisible(objects) {
        if (!this.frustum)
            return objects;
        return objects.filter((obj) => this.isVisible(obj.boundingBox));
    }
}
/**
 * Occlusion culling utility (simplified implementation)
 */
export class OcclusionCuller {
    constructor() {
        Object.defineProperty(this, "occluders", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    /**
     * Add an occluder object
     */
    addOccluder(object) {
        this.occluders.push(object);
    }
    /**
     * Remove an occluder object
     */
    removeOccluder(object) {
        const index = this.occluders.indexOf(object);
        if (index > -1) {
            this.occluders.splice(index, 1);
        }
    }
    /**
     * Check if an object is occluded
     */
    isOccluded(object, camera) {
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
    isObjectBehindOccluder(object, occluder, camera) {
        // This is a simplified implementation
        // In practice, you'd use proper depth testing and ray casting
        const objectDistance = this.getDistanceToCamera(object, camera);
        const occluderDistance = this.getDistanceToCamera(occluder, camera);
        return objectDistance > occluderDistance;
    }
    /**
     * Get distance from object to camera
     */
    getDistanceToCamera(object, camera) {
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
    constructor() {
        Object.defineProperty(this, "instances", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Add instances for a geometry
     */
    addInstances(geometryId, instances) {
        this.instances.set(geometryId, instances);
    }
    /**
     * Get instances for a geometry
     */
    getInstances(geometryId) {
        return this.instances.get(geometryId) || [];
    }
    /**
     * Remove instances for a geometry
     */
    removeInstances(geometryId) {
        this.instances.delete(geometryId);
    }
    /**
     * Clear all instances
     */
    clear() {
        this.instances.clear();
    }
    /**
     * Get total instance count
     */
    getTotalInstances() {
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
    constructor() {
        Object.defineProperty(this, "allocations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "totalAllocated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    /**
     * Track memory allocation
     */
    allocate(key, size) {
        this.allocations.set(key, size);
        this.totalAllocated += size;
    }
    /**
     * Track memory deallocation
     */
    deallocate(key) {
        const size = this.allocations.get(key);
        if (size) {
            this.allocations.delete(key);
            this.totalAllocated -= size;
        }
    }
    /**
     * Get total allocated memory
     */
    getTotalAllocated() {
        return this.totalAllocated;
    }
    /**
     * Get memory usage by key
     */
    getMemoryUsage(key) {
        return this.allocations.get(key) || 0;
    }
    /**
     * Get all memory allocations
     */
    getAllocations() {
        return new Map(this.allocations);
    }
    /**
     * Clear all allocations
     */
    clear() {
        this.allocations.clear();
        this.totalAllocated = 0;
    }
}
/**
 * Create render stats from performance data
 */
export function createRenderStats(totalPoints, visiblePoints, renderedPoints, fps, memoryUsage, lodLevel = 0, frustumCulled = 0, occlusionCulled = 0) {
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
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
/**
 * Throttle function for performance optimization
 */
export function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
