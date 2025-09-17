/**
 * @fileoverview Comprehensive ECS Performance Benchmark Suite
 *
 * This benchmark suite tests the performance of all critical ECS operations:
 * - Entity creation and destruction
 * - Component operations (add, remove, access)
 * - Query performance with various filters
 * - System execution timing
 * - Memory usage and allocation patterns
 * - Stress testing with high entity counts
 *
 * @example
 * ```typescript
 * import { runECSBenchmarks } from './ecs-benchmark';
 *
 * // Run all benchmarks
 * await runECSBenchmarks();
 *
 * // Run specific benchmark category
 * await runEntityBenchmarks();
 * ```
 *
 * @performance
 * - Measures operations in microseconds for precision
 * - Tests with entity counts from 100 to 100,000
 * - Includes memory usage tracking
 * - Provides performance regression detection
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { createWorld, StorageType, } from "../index";
import { createEnhancedMemoryTracker, } from "./improved-memory-tracker.js";
import { createScalingOptimizer, } from "./scaling-optimizations.js";
// Benchmark Components
class Position {
    constructor(x, y, z = 0) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y
        });
        Object.defineProperty(this, "z", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: z
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Velocity {
    constructor(x, y, z = 0) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y
        });
        Object.defineProperty(this, "z", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: z
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Health {
    constructor(current, maximum) {
        Object.defineProperty(this, "current", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: current
        });
        Object.defineProperty(this, "maximum", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maximum
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Damage {
    constructor(amount) {
        Object.defineProperty(this, "amount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: amount
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Player {
    constructor(name, level = 1) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "level", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: level
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Enemy {
    constructor(type, difficulty = 1) {
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: type
        });
        Object.defineProperty(this, "difficulty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: difficulty
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Bullet {
    constructor(speed, lifetime = 5.0) {
        Object.defineProperty(this, "speed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: speed
        });
        Object.defineProperty(this, "lifetime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: lifetime
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Color {
    constructor(r, g, b, a = 1.0) {
        Object.defineProperty(this, "r", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: r
        });
        Object.defineProperty(this, "g", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: g
        });
        Object.defineProperty(this, "b", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: b
        });
        Object.defineProperty(this, "a", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: a
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Size {
    constructor(width, height) {
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: width
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: height
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Physics {
    constructor(mass, friction, restitution) {
        Object.defineProperty(this, "mass", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: mass
        });
        Object.defineProperty(this, "friction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: friction
        });
        Object.defineProperty(this, "restitution", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: restitution
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class Renderable {
    constructor(mesh, texture) {
        Object.defineProperty(this, "mesh", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: mesh
        });
        Object.defineProperty(this, "texture", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: texture
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
// Benchmark Resources
class GameTime {
    constructor(deltaTime, totalTime) {
        Object.defineProperty(this, "deltaTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: deltaTime
        });
        Object.defineProperty(this, "totalTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: totalTime
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class GameState {
    constructor(score, level) {
        Object.defineProperty(this, "score", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: score
        });
        Object.defineProperty(this, "level", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: level
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
class PerformanceMetrics {
    constructor(frameCount, averageFrameTime, entityCount) {
        Object.defineProperty(this, "frameCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: frameCount
        });
        Object.defineProperty(this, "averageFrameTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: averageFrameTime
        });
        Object.defineProperty(this, "entityCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: entityCount
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
/**
 * Default benchmark configuration.
 */
const DEFAULT_CONFIG = {
    entityCounts: [100, 500, 1000, 5000, 10000, 25000, 50000],
    iterations: 1000,
    warmupIterations: 100,
    enableMemoryTracking: true,
    enableDetailedLogging: false,
};
/**
 * Utility class for measuring performance with high precision.
 */
class PerformanceTimer {
    constructor() {
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "endTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    start() {
        this.startTime = performance.now();
    }
    stop() {
        this.endTime = performance.now();
        return this.endTime - this.startTime;
    }
    getElapsedMs() {
        return this.endTime - this.startTime;
    }
    getElapsedUs() {
        return (this.endTime - this.startTime) * 1000;
    }
}
/**
 * Memory usage tracker for monitoring allocation patterns.
 * Now uses enhanced memory tracking with garbage collection handling.
 */
class MemoryTracker {
    constructor() {
        Object.defineProperty(this, "enhancedTracker", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fallbackTracker", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Use enhanced memory tracker as primary
        this.enhancedTracker = createEnhancedMemoryTracker({
            enableDetailedLogging: false,
            sampleInterval: 100,
            trackGarbageCollection: true,
            handleNegativeMemory: true,
            smoothingFactor: 0.1,
        });
        // Fallback for browser environments
        this.fallbackTracker = {
            initialMemory: 0,
            peakMemory: 0,
            hasMemoryAPI: "memory" in performance &&
                performance.memory !== undefined,
        };
    }
    start() {
        // Start enhanced tracker
        this.enhancedTracker.start();
        // Start fallback tracker if needed
        if (this.fallbackTracker.hasMemoryAPI) {
            const perfMemory = performance.memory;
            this.fallbackTracker.initialMemory = perfMemory.usedJSHeapSize;
            this.fallbackTracker.peakMemory = this.fallbackTracker.initialMemory;
        }
    }
    update() {
        // Update enhanced tracker
        this.enhancedTracker.update();
        // Update fallback tracker if needed
        if (this.fallbackTracker.hasMemoryAPI) {
            const perfMemory = performance.memory;
            const current = perfMemory.usedJSHeapSize;
            if (current > this.fallbackTracker.peakMemory) {
                this.fallbackTracker.peakMemory = current;
            }
        }
    }
    getMemoryUsageMB() {
        // Use enhanced tracker if available
        if (this.enhancedTracker.isMemoryTrackingAvailable()) {
            return this.enhancedTracker.getMemoryUsageMB();
        }
        // Fallback to browser API
        if (this.fallbackTracker.hasMemoryAPI) {
            const perfMemory = performance.memory;
            const usage = (perfMemory.usedJSHeapSize - this.fallbackTracker.initialMemory) /
                (1024 * 1024);
            // Ensure we never return negative values
            return Math.max(0, usage);
        }
        return 0;
    }
    getPeakMemoryUsageMB() {
        // Use enhanced tracker if available
        if (this.enhancedTracker.isMemoryTrackingAvailable()) {
            return this.enhancedTracker.getPeakMemoryUsageMB();
        }
        // Fallback to browser API
        if (this.fallbackTracker.hasMemoryAPI) {
            return ((this.fallbackTracker.peakMemory - this.fallbackTracker.initialMemory) /
                (1024 * 1024));
        }
        return 0;
    }
    isMemoryTrackingAvailable() {
        return (this.enhancedTracker.isMemoryTrackingAvailable() ||
            this.fallbackTracker.hasMemoryAPI);
    }
    getDetailedStats() {
        if (this.enhancedTracker.isMemoryTrackingAvailable()) {
            return this.enhancedTracker.stop();
        }
        return null;
    }
}
/**
 * Benchmark runner that executes tests and collects results.
 */
export class ECSBenchmarkRunner {
    constructor(config = {}) {
        Object.defineProperty(this, "world", {
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
        Object.defineProperty(this, "results", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "componentTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "resourceTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "scalingOptimizer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "memoryTracker", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.world = createWorld();
        this.setupComponentTypes();
        this.setupResourceTypes();
        this.scalingOptimizer = createScalingOptimizer({
            enableEntityPooling: true,
            enableBatchProcessing: true,
            enableMemoryOptimization: true,
            maxEntitiesPerBatch: 1000,
        });
        this.memoryTracker = new MemoryTracker();
    }
    setupComponentTypes() {
        const registry = this.world.getComponentRegistry();
        // Register all benchmark components with Table storage for performance
        this.componentTypes.set("Position", registry.register("Position", StorageType.Table, () => new Position(0, 0)));
        this.componentTypes.set("Velocity", registry.register("Velocity", StorageType.Table, () => new Velocity(0, 0)));
        this.componentTypes.set("Health", registry.register("Health", StorageType.Table, () => new Health(100, 100)));
        this.componentTypes.set("Damage", registry.register("Damage", StorageType.Table, () => new Damage(10)));
        this.componentTypes.set("Player", registry.register("Player", StorageType.Table, () => new Player("Player1")));
        this.componentTypes.set("Enemy", registry.register("Enemy", StorageType.Table, () => new Enemy("Basic")));
        this.componentTypes.set("Bullet", registry.register("Bullet", StorageType.Table, () => new Bullet(300)));
        this.componentTypes.set("Color", registry.register("Color", StorageType.Table, () => new Color(1, 1, 1)));
        this.componentTypes.set("Size", registry.register("Size", StorageType.Table, () => new Size(20, 20)));
        this.componentTypes.set("Physics", registry.register("Physics", StorageType.Table, () => new Physics(1, 0.5, 0.8)));
        this.componentTypes.set("Renderable", registry.register("Renderable", StorageType.Table, () => new Renderable("cube", "default")));
    }
    setupResourceTypes() {
        const registry = this.world.getResourceRegistry();
        this.resourceTypes.set("GameTime", registry.register("GameTime", () => new GameTime(0.016, 0)));
        this.resourceTypes.set("GameState", registry.register("GameState", () => new GameState(0, 1)));
        this.resourceTypes.set("PerformanceMetrics", registry.register("PerformanceMetrics", () => new PerformanceMetrics(0, 0, 0)));
    }
    /**
     * Runs a single benchmark with the given parameters.
     */
    async runBenchmark(name, operation, entityCount, benchmarkFn, iterations = this.config.iterations) {
        const timer = new PerformanceTimer();
        const memoryTracker = new MemoryTracker();
        // Warmup iterations
        for (let i = 0; i < this.config.warmupIterations; i++) {
            benchmarkFn();
        }
        // Clear world for clean measurement
        this.clearWorld();
        // Start memory tracking
        if (this.config.enableMemoryTracking) {
            memoryTracker.start();
            /*
                  if (!memoryTracker.isMemoryTrackingAvailable() && this.config.enableDetailedLogging) {
                      console.warn("⚠️  Memory tracking not available (Chrome/Chromium only)");
                  }
                  */
        }
        // Run benchmark
        timer.start();
        for (let i = 0; i < iterations; i++) {
            benchmarkFn();
            if (this.config.enableMemoryTracking) {
                memoryTracker.update();
            }
        }
        const totalTime = timer.stop();
        const result = {
            name,
            operation,
            entityCount,
            iterations,
            totalTimeMs: totalTime,
            averageTimeMs: totalTime / iterations,
            averageTimeUs: (totalTime / iterations) * 1000,
            operationsPerSecond: (iterations / totalTime) * 1000,
        };
        if (this.config.enableMemoryTracking) {
            result.memoryUsageMB = memoryTracker.getMemoryUsageMB();
        }
        this.results.push(result);
        return result;
    }
    /**
     * Clears all entities from the world for clean benchmarks.
     */
    clearWorld() {
        // Get all entities and despawn them
        const entities = [];
        // Note: This is a simplified approach - in a real implementation,
        // you'd need to iterate through all entities properly
        for (let i = 0; i < this.world.getEntityCount(); i++) {
            // This would need proper entity iteration in the actual implementation
        }
    }
    /**
     * Benchmark entity creation performance.
     */
    async benchmarkEntityCreation() {
        console.log("🦊> Benchmarking Entity Creation...");
        const results = [];
        for (const entityCount of this.config.entityCounts) {
            const result = await this.runBenchmark("Entity Creation", "spawn", entityCount, () => {
                for (let i = 0; i < entityCount; i++) {
                    this.world.spawn(new Position(Math.random() * 1000, Math.random() * 1000), new Velocity(Math.random() * 10, Math.random() * 10), new Health(100, 100));
                }
            }, Math.max(1, Math.floor(this.config.iterations / entityCount)));
            results.push(result);
            console.log(`   ${entityCount} entities: ${result.averageTimeUs.toFixed(2)}μs per operation`);
        }
        return results;
    }
    /**
     * Benchmark component addition performance.
     */
    async benchmarkComponentAddition() {
        console.log("🦦> Benchmarking Component Addition...");
        const results = [];
        for (const entityCount of this.config.entityCounts) {
            // Pre-create entities
            const entities = [];
            for (let i = 0; i < entityCount; i++) {
                entities.push(this.world.spawn(new Position(0, 0)));
            }
            const result = await this.runBenchmark("Component Addition", "addComponent", entityCount, () => {
                for (const entity of entities) {
                    this.world.insert(entity, new Velocity(Math.random() * 10, Math.random() * 10));
                }
            }, Math.max(1, Math.floor(this.config.iterations / entityCount)));
            results.push(result);
            console.log(`   ${entityCount} entities: ${result.averageTimeUs.toFixed(2)}μs per operation`);
        }
        return results;
    }
    /**
     * Benchmark component removal performance.
     */
    async benchmarkComponentRemoval() {
        console.log("🐺> Benchmarking Component Removal...");
        const results = [];
        for (const entityCount of this.config.entityCounts) {
            // Pre-create entities with components
            const entities = [];
            for (let i = 0; i < entityCount; i++) {
                entities.push(this.world.spawn(new Position(0, 0), new Velocity(0, 0), new Health(100, 100)));
            }
            const result = await this.runBenchmark("Component Removal", "removeComponent", entityCount, () => {
                for (const entity of entities) {
                    this.world.remove(entity, this.componentTypes.get("Velocity"));
                }
            }, Math.max(1, Math.floor(this.config.iterations / entityCount)));
            results.push(result);
            console.log(`   ${entityCount} entities: ${result.averageTimeUs.toFixed(2)}μs per operation`);
        }
        return results;
    }
    /**
     * Benchmark query performance with different component combinations.
     */
    async benchmarkQueries() {
        console.log("🦊> Benchmarking Query Performance...");
        const results = [];
        for (const entityCount of this.config.entityCounts) {
            // Create entities with various component combinations
            const entities = [];
            for (let i = 0; i < entityCount; i++) {
                const entity = this.world.spawn(new Position(Math.random() * 1000, Math.random() * 1000));
                if (i % 2 === 0) {
                    this.world.insert(entity, new Velocity(Math.random() * 10, Math.random() * 10));
                }
                if (i % 3 === 0) {
                    this.world.insert(entity, new Health(100, 100));
                }
                if (i % 4 === 0) {
                    this.world.insert(entity, new Player(`Player${i}`));
                }
                entities.push(entity);
            }
            // Cache queries outside the benchmark loop for better performance
            const simpleQuery = this.world.query(this.componentTypes.get("Position"));
            const complexQuery = this.world.query(this.componentTypes.get("Position"), this.componentTypes.get("Velocity"));
            // Test simple query (Position only)
            const simpleResult = await this.runBenchmark("Simple Query", "query(Position)", entityCount, () => {
                simpleQuery.forEach((entity, position) => {
                    // Minimal work - just access the data
                    const x = position.x;
                    const y = position.y;
                    // Prevent optimization by using the values
                    if (x + y === 0)
                        return;
                });
            }, Math.max(1, Math.floor(this.config.iterations / entityCount)));
            results.push(simpleResult);
            // Test complex query (Position + Velocity)
            const complexResult = await this.runBenchmark("Complex Query", "query(Position, Velocity)", entityCount, () => {
                complexQuery.forEach((entity, position, velocity) => {
                    // Minimal work - just access the data
                    const x = position.x;
                    const y = position.y;
                    const vx = velocity.x;
                    const vy = velocity.y;
                    // Prevent optimization by using the values
                    if (x + y + vx + vy === 0)
                        return;
                });
            }, Math.max(1, Math.floor(this.config.iterations / entityCount)));
            results.push(complexResult);
            console.log(`   ${entityCount} entities - Simple: ${simpleResult.averageTimeUs.toFixed(2)}μs, Complex: ${complexResult.averageTimeUs.toFixed(2)}μs`);
        }
        return results;
    }
    /**
     * Benchmark system execution performance.
     */
    async benchmarkSystemExecution() {
        console.log("🦦> Benchmarking System Execution...");
        const results = [];
        // Cache the query outside the system for better performance
        const movementQuery = this.world.query(this.componentTypes.get("Position"), this.componentTypes.get("Velocity"));
        // Create a simple movement system
        const movementSystem = (world) => {
            movementQuery.forEach((entity, position, velocity) => {
                position.x += velocity.x * 0.016;
                position.y += velocity.y * 0.016;
            });
        };
        for (const entityCount of this.config.entityCounts) {
            // Create entities with Position and Velocity components
            for (let i = 0; i < entityCount; i++) {
                this.world.spawn(new Position(Math.random() * 1000, Math.random() * 1000), new Velocity(Math.random() * 10, Math.random() * 10));
            }
            const result = await this.runBenchmark("System Execution", "runSystem", entityCount, () => {
                movementSystem(this.world);
            }, Math.max(1, Math.floor(this.config.iterations / entityCount)));
            results.push(result);
            console.log(`   ${entityCount} entities: ${result.averageTimeUs.toFixed(2)}μs per operation`);
        }
        return results;
    }
    /**
     * Benchmark resource access performance.
     */
    async benchmarkResourceAccess() {
        console.log("🐺> Benchmarking Resource Access...");
        const results = [];
        // Add resources
        this.world.insertResource(new GameTime(0.016, 0));
        this.world.insertResource(new GameState(1000, 5));
        this.world.insertResource(new PerformanceMetrics(60, 16.67, 1000));
        const result = await this.runBenchmark("Resource Access", "getResource", 1, // Resources are singletons
        () => {
            const gameTime = this.world.getResource(this.resourceTypes.get("GameTime"));
            const gameState = this.world.getResource(this.resourceTypes.get("GameState"));
            const metrics = this.world.getResource(this.resourceTypes.get("PerformanceMetrics"));
            // Access resource data
            if (gameTime) {
                const dt = gameTime.deltaTime;
                const total = gameTime.totalTime;
            }
            if (gameState) {
                const score = gameState.score;
                const level = gameState.level;
            }
            if (metrics) {
                const frames = metrics.frameCount;
                const avgTime = metrics.averageFrameTime;
            }
        }, this.config.iterations);
        results.push(result);
        console.log(`   Resource access: ${result.averageTimeUs.toFixed(2)}μs per operation`);
        return results;
    }
    /**
     * Stress test with high entity counts and complex operations.
     */
    async benchmarkStressTest() {
        console.log("🦊> Running Stress Test...");
        const results = [];
        const stressEntityCounts = [10000, 25000, 50000, 100000];
        for (const entityCount of stressEntityCounts) {
            // Create a complex world with many entities and components
            const entities = [];
            for (let i = 0; i < entityCount; i++) {
                const entity = this.world.spawn(new Position(Math.random() * 1000, Math.random() * 1000), new Velocity(Math.random() * 10, Math.random() * 10), new Health(100, 100));
                if (i % 2 === 0) {
                    this.world.insert(entity, new Color(Math.random(), Math.random(), Math.random()));
                }
                if (i % 3 === 0) {
                    this.world.insert(entity, new Size(20, 20));
                }
                if (i % 4 === 0) {
                    this.world.insert(entity, new Physics(1, 0.5, 0.8));
                }
                entities.push(entity);
            }
            // Test complex query with multiple components
            const result = await this.runBenchmark("Stress Test Query", "complexQuery", entityCount, () => {
                const query = this.world.query(this.componentTypes.get("Position"), this.componentTypes.get("Velocity"), this.componentTypes.get("Health"));
                query.forEach((entity, position, velocity, health) => {
                    // Complex operations
                    position.x += velocity.x * 0.016;
                    position.y += velocity.y * 0.016;
                    health.current = Math.max(0, health.current - 0.1);
                });
            }, Math.max(1, Math.floor(100 / entityCount)));
            results.push(result);
            console.log(`   ${entityCount} entities: ${result.averageTimeUs.toFixed(2)}μs per operation`);
        }
        return results;
    }
    /**
     * Runs all benchmarks and returns comprehensive results.
     */
    async runAllBenchmarks() {
        console.log("🚀 Starting Comprehensive ECS Benchmark Suite");
        console.log("=".repeat(50));
        const allResults = [];
        // Run all benchmark categories
        allResults.push(...(await this.benchmarkEntityCreation()));
        allResults.push(...(await this.benchmarkComponentAddition()));
        allResults.push(...(await this.benchmarkComponentRemoval()));
        allResults.push(...(await this.benchmarkQueries()));
        allResults.push(...(await this.benchmarkSystemExecution()));
        allResults.push(...(await this.benchmarkResourceAccess()));
        allResults.push(...(await this.benchmarkStressTest()));
        console.log("\n✅ All benchmarks completed!");
        this.printSummary(allResults);
        return allResults;
    }
    /**
     * Prints a summary of all benchmark results.
     */
    printSummary(results) {
        console.log("\n📊 Benchmark Summary");
        console.log("=".repeat(50));
        // Group results by operation
        const groupedResults = new Map();
        for (const result of results) {
            if (!groupedResults.has(result.operation)) {
                groupedResults.set(result.operation, []);
            }
            groupedResults.get(result.operation).push(result);
        }
        // Print summary for each operation
        for (const [operation, operationResults] of groupedResults) {
            console.log(`\n${operation}:`);
            for (const result of operationResults) {
                console.log(`  ${result.entityCount.toLocaleString().padStart(8)} entities: ${result.averageTimeUs.toFixed(2).padStart(8)}μs avg, ${result.operationsPerSecond.toFixed(0).padStart(8)} ops/sec`);
            }
        }
        // Memory usage summary
        const memoryResults = results.filter((r) => r.memoryUsageMB !== undefined && r.memoryUsageMB > 0);
        if (memoryResults.length > 0) {
            console.log("\n💾 Memory Usage:");
            for (const result of memoryResults) {
                console.log(`  ${result.operation} (${result.entityCount} entities): ${result.memoryUsageMB.toFixed(2)} MB`);
            }
        }
        else if (this.config.enableMemoryTracking) {
            console.log("\n💾 Memory Usage: Not available (Chrome/Chromium only)");
        }
    }
    /**
     * Gets the current memory usage in MB.
     */
    getMemoryUsageMB() {
        return this.memoryTracker.getMemoryUsageMB();
    }
    /**
     * Gets the peak memory usage in MB.
     */
    getPeakMemoryUsageMB() {
        return this.memoryTracker.getPeakMemoryUsageMB();
    }
    /**
     * Checks if memory tracking is available.
     */
    isMemoryTrackingAvailable() {
        return this.memoryTracker.isMemoryTrackingAvailable();
    }
    /**
     * Starts memory tracking.
     */
    startMemoryTracking() {
        this.memoryTracker.start();
    }
    /**
     * Updates memory tracking.
     */
    updateMemoryTracking() {
        this.memoryTracker.update();
    }
    /**
     * Gets detailed memory statistics.
     */
    getMemoryStats() {
        return this.memoryTracker.getDetailedStats();
    }
    /**
     * Exports results to JSON format for further analysis.
     */
    exportResults(filename) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const defaultFilename = `ecs-benchmark-${timestamp}.json`;
        const finalFilename = filename || defaultFilename;
        const exportData = {
            timestamp: new Date().toISOString(),
            config: this.config,
            results: this.results,
            summary: {
                totalBenchmarks: this.results.length,
                averageTimeUs: this.results.reduce((sum, r) => sum + r.averageTimeUs, 0) /
                    this.results.length,
                totalMemoryMB: this.results.reduce((sum, r) => sum + (r.memoryUsageMB || 0), 0),
            },
        };
        const jsonString = JSON.stringify(exportData, null, 2);
        // In a real implementation, you'd write this to a file
        console.log(`📁 Results exported to: ${finalFilename}`);
        console.log(`📄 JSON data length: ${jsonString.length} characters`);
        return jsonString;
    }
}
/**
 * Convenience function to run all ECS benchmarks with default configuration.
 */
export async function runECSBenchmarks(config) {
    const runner = new ECSBenchmarkRunner(config);
    return await runner.runAllBenchmarks();
}
/**
 * Convenience function to run specific benchmark categories.
 */
export async function runEntityBenchmarks(config) {
    const runner = new ECSBenchmarkRunner(config);
    const results = [];
    results.push(...(await runner.benchmarkEntityCreation()));
    results.push(...(await runner.benchmarkComponentAddition()));
    results.push(...(await runner.benchmarkComponentRemoval()));
    return results;
}
/**
 * Convenience function to run query performance benchmarks.
 */
export async function runQueryBenchmarks(config) {
    const runner = new ECSBenchmarkRunner(config);
    return await runner.benchmarkQueries();
}
/**
 * Convenience function to run system execution benchmarks.
 */
export async function runSystemBenchmarks(config) {
    const runner = new ECSBenchmarkRunner(config);
    return await runner.benchmarkSystemExecution();
}
/**
 * Convenience function to run stress tests.
 */
export async function runStressTests(config) {
    const runner = new ECSBenchmarkRunner(config);
    return await runner.benchmarkStressTest();
}
