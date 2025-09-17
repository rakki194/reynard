// Vector operation benchmark
import { PositionSystemSIMD } from "./position-system-simd.js";
import { TestDataGenerator } from "./test-data-generator.js";
export class VectorBenchmark {
    constructor(maxEntities = 100000) {
        Object.defineProperty(this, "maxEntities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maxEntities
        });
        Object.defineProperty(this, "simdSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.simdSystem = new PositionSystemSIMD(maxEntities);
    }
    async initialize() {
        await this.simdSystem.initialize();
    }
    async benchmarkVectorOperations(arraySize, iterations = 1000) {
        console.log(`Benchmarking vector operations with ${arraySize} elements, ${iterations} iterations...`);
        // Generate test data
        const { a, b } = TestDataGenerator.generateVectorArrays(arraySize);
        // Benchmark SIMD vector operations
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            this.simdSystem.simdVectorAdd(a, b);
        }
        const end = performance.now();
        const totalTime = end - start;
        return {
            name: "Vector Operations (SIMD)",
            iterations,
            totalTime,
            averageTime: totalTime / iterations,
            operationsPerSecond: (iterations * arraySize) / (totalTime / 1000),
        };
    }
    destroy() {
        this.simdSystem.destroy();
    }
}
