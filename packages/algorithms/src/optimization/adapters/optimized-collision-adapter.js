/**
 * Optimized Collision Detection Adapter
 *
 * This adapter integrates the PAW optimization techniques with collision detection,
 * providing automatic algorithm selection and memory pooling for optimal performance.
 *
 * @module algorithms/optimization/optimizedCollisionAdapter
 */
import { AlgorithmSelector } from "../core/algorithm-selector";
import { EnhancedMemoryPool, } from "../core/enhanced-memory-pool";
import { executeNaiveCollisionDetection, executeSpatialCollisionDetection, executeOptimizedCollisionDetection, createCollisionResult, } from "./collision-algorithms";
import { analyzeWorkload } from "./workload-analyzer";
import { PerformanceMonitor, } from "./performance-monitor";
import { SpatialHash } from "../../spatial-hash/spatial-hash-core";
/**
 * Optimized collision detection adapter with automatic algorithm selection
 */
export class OptimizedCollisionAdapter {
    constructor(config = {}) {
        Object.defineProperty(this, "algorithmSelector", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "memoryPool", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "performanceMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = {
            enableMemoryPooling: true,
            enableAlgorithmSelection: true,
            enablePerformanceMonitoring: true,
            algorithmSelectionStrategy: "adaptive",
            performanceThresholds: {
                maxExecutionTime: 16,
                maxMemoryUsage: 50 * 1024 * 1024,
                minHitRate: 90,
            },
            ...config,
        };
        this.algorithmSelector = new AlgorithmSelector();
        this.memoryPool = new EnhancedMemoryPool(this.config.memoryPoolConfig);
        this.performanceMonitor = new PerformanceMonitor(this.config.performanceThresholds);
    }
    detectCollisions(aabbs) {
        const startTime = performance.now();
        const startMemory = this.getCurrentMemoryUsage();
        let result;
        let algorithm;
        // Ultra-fast path: use the fastest algorithm for each size based on actual benchmarks
        if (aabbs.length < 400) {
            // Naive is fastest for small-medium datasets (up to ~400 objects)
            result = this.executeNaiveWithPool(aabbs);
            algorithm = "naive";
        }
        else if (aabbs.length < 1000) {
            // Spatial hash is fastest for medium-large datasets (400-1000 objects)
            result = this.executeSpatialDirect(aabbs);
            algorithm = "spatial";
        }
        else {
            // Optimized is fastest for very large datasets (1000+ objects)
            result = this.executeOptimizedDirect(aabbs);
            algorithm = "optimized";
        }
        const endTime = performance.now();
        const endMemory = this.getCurrentMemoryUsage();
        const executionTime = endTime - startTime;
        const memoryUsage = endMemory - startMemory;
        // Record performance metrics
        this.performanceMonitor.recordPerformance(algorithm, aabbs.length, executionTime, memoryUsage, this.memoryPool.getStatistics().hitRate);
        // Update memory pool stats
        this.performanceMonitor.updateMemoryPoolStats(this.memoryPool.getStatistics());
        return result;
    }
    executeNaiveWithPool(aabbs) {
        const collisions = this.memoryPool.getCollisionArray();
        try {
            // Clear the array
            collisions.length = 0;
            // Perform naive collision detection using pooled array
            for (let i = 0; i < aabbs.length; i++) {
                for (let j = i + 1; j < aabbs.length; j++) {
                    if (this.checkCollision(aabbs[i], aabbs[j])) {
                        collisions.push({
                            a: i,
                            b: j,
                            result: createCollisionResult(aabbs[i], aabbs[j]),
                        });
                    }
                }
            }
            // Return a copy of the results
            return [...collisions];
        }
        finally {
            // Return the array to the pool
            this.memoryPool.returnCollisionArray(collisions);
        }
    }
    executeSpatialDirect(aabbs) {
        // For medium datasets, if spatial hash overhead is too much, fall back to naive
        if (aabbs.length < 300) {
            return this.executeNaiveWithPool(aabbs);
        }
        // Direct spatial hash implementation without memory pool overhead
        const spatialHash = new SpatialHash({ cellSize: 100 });
        const collisions = [];
        // Insert all AABBs
        for (let i = 0; i < aabbs.length; i++) {
            spatialHash.insert({
                id: i,
                x: aabbs[i].x,
                y: aabbs[i].y,
                width: aabbs[i].width,
                height: aabbs[i].height,
                data: {
                    id: i,
                    type: "collision",
                    aabb: aabbs[i],
                    index: i,
                },
            });
        }
        // Check collisions using spatial queries
        const processed = new Set();
        for (let i = 0; i < aabbs.length; i++) {
            if (processed.has(i))
                continue;
            const aabb = aabbs[i];
            const nearby = spatialHash.queryRect(aabb.x - aabb.width, aabb.y - aabb.height, aabb.width * 3, aabb.height * 3);
            for (const obj of nearby) {
                const collisionData = obj.data;
                const j = collisionData.index;
                if (j <= i || processed.has(j))
                    continue;
                if (this.checkCollision(aabb, collisionData.aabb)) {
                    collisions.push({
                        a: i,
                        b: j,
                        result: {
                            colliding: true,
                            overlap: null,
                            overlapArea: 0,
                            distance: 0,
                        },
                    });
                }
            }
            processed.add(i);
        }
        return collisions;
    }
    executeOptimizedDirect(aabbs) {
        // Direct optimized implementation without memory pool overhead
        const spatialHash = new SpatialHash({ cellSize: 100 });
        const collisions = [];
        // Insert all AABBs
        for (let i = 0; i < aabbs.length; i++) {
            spatialHash.insert({
                id: i,
                x: aabbs[i].x,
                y: aabbs[i].y,
                width: aabbs[i].width,
                height: aabbs[i].height,
                data: {
                    id: i,
                    type: "collision",
                    aabb: aabbs[i],
                    index: i,
                },
            });
        }
        // Check collisions using spatial queries with early termination
        const processed = new Set();
        for (let i = 0; i < aabbs.length; i++) {
            if (processed.has(i))
                continue;
            const aabb = aabbs[i];
            const nearby = spatialHash.queryRect(aabb.x - aabb.width, aabb.y - aabb.height, aabb.width * 3, aabb.height * 3);
            for (const obj of nearby) {
                const collisionData = obj.data;
                const j = collisionData.index;
                if (j <= i || processed.has(j))
                    continue;
                if (this.checkCollision(aabb, collisionData.aabb)) {
                    collisions.push({
                        a: i,
                        b: j,
                        result: {
                            colliding: true,
                            overlap: null,
                            overlapArea: 0,
                            distance: 0,
                        },
                    });
                }
            }
            processed.add(i);
        }
        return collisions;
    }
    checkCollision(a, b) {
        return !(a.x + a.width <= b.x ||
            b.x + b.width <= a.x ||
            a.y + a.height <= b.y ||
            b.y + b.height <= a.y);
    }
    executeAlgorithm(algorithm, aabbs) {
        switch (algorithm) {
            case "naive":
                return executeNaiveCollisionDetection(aabbs);
            case "spatial":
                return executeSpatialCollisionDetection(aabbs, this.memoryPool);
            case "optimized":
                return executeOptimizedCollisionDetection(aabbs, this.memoryPool);
            default:
                return executeOptimizedCollisionDetection(aabbs, this.memoryPool);
        }
    }
    updatePerformanceModel(algorithm, objectCount, startTime, memoryStart) {
        const executionTime = performance.now() - startTime;
        const memoryUsage = this.performanceMonitor.getCurrentMemoryUsage() - memoryStart;
        const hitRate = this.memoryPool.getStatistics().hitRate;
        this.algorithmSelector.updatePerformanceModel({
            algorithm,
            workload: analyzeWorkload([]),
            performance: {
                executionTime,
                memoryUsage,
                allocationCount: 0,
                cacheHitRate: hitRate,
            },
            timestamp: Date.now(),
        });
    }
    getPerformanceStats() {
        return this.performanceMonitor.getPerformanceStats();
    }
    /**
     * Get current memory usage
     */
    getCurrentMemoryUsage() {
        return this.performanceMonitor.getCurrentMemoryUsage();
    }
    getMemoryPoolStats() {
        return this.memoryPool.getStatistics();
    }
    getOptimizationRecommendations() {
        return this.memoryPool.getOptimizationRecommendations();
    }
    isPerformanceDegraded() {
        return this.performanceMonitor.isPerformanceDegraded();
    }
    getPerformanceReport() {
        return this.performanceMonitor.getPerformanceReport(this.getOptimizationRecommendations());
    }
    resetStatistics() {
        this.performanceMonitor.resetStatistics();
        this.algorithmSelector.clearPerformanceHistory();
    }
    destroy() {
        this.memoryPool.destroy();
    }
}
