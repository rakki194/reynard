// Collision detection benchmarks for ECS SIMD performance testing
import { PositionSystem } from "./position-system.js";
import { PositionSystemSIMD } from "./position-system-simd.js";
import { TestDataGenerator } from "./test-data-generator.js";
export class CollisionBenchmark {
    constructor(maxEntities = 100000) {
        Object.defineProperty(this, "nonSimdSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "simdSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.nonSimdSystem = new PositionSystem(maxEntities);
        this.simdSystem = new PositionSystemSIMD(maxEntities);
    }
    /**
     * Initialize the benchmark systems
     */
    async initialize() {
        if (this.isInitialized)
            return;
        await this.simdSystem.initialize();
        this.isInitialized = true;
    }
    /**
     * Benchmark collision detection
     */
    async benchmarkCollisionDetection(entityCount, iterations = 100) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        console.log(`Benchmarking collision detection with ${entityCount} entities, ${iterations} iterations...`);
        // Generate test data
        const testData = TestDataGenerator.generateTestData(entityCount);
        // Setup non-SIMD system
        this.nonSimdSystem.clear();
        for (const data of testData) {
            this.nonSimdSystem.addEntity(data.position, data.velocity, data.acceleration, data.mass);
        }
        // Setup SIMD system
        this.simdSystem.clear();
        for (const data of testData) {
            this.simdSystem.addEntity(data.position, data.velocity, data.acceleration, data.mass);
        }
        const radius = 10.0;
        // Benchmark non-SIMD
        const nonSimdStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            this.nonSimdSystem.detectCollisions(radius);
        }
        const nonSimdEnd = performance.now();
        const nonSimdTime = nonSimdEnd - nonSimdStart;
        // Benchmark SIMD
        const simdStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            this.simdSystem.detectCollisions(radius);
        }
        const simdEnd = performance.now();
        const simdTime = simdEnd - simdStart;
        const nonSimdResult = {
            name: "Collision Detection (Non-SIMD)",
            iterations,
            totalTime: nonSimdTime,
            averageTime: nonSimdTime / iterations,
            operationsPerSecond: iterations / (nonSimdTime / 1000),
        };
        const simdResult = {
            name: "Collision Detection (SIMD)",
            iterations,
            totalTime: simdTime,
            averageTime: simdTime / iterations,
            operationsPerSecond: iterations / (simdTime / 1000),
        };
        return { nonSimd: nonSimdResult, simd: simdResult };
    }
}
