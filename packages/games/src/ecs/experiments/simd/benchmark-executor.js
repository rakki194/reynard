// Benchmark execution utilities for individual system operations
export class BenchmarkExecutor {
    constructor(simdSystem, reynardWorld) {
        Object.defineProperty(this, "simdSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: simdSystem
        });
        Object.defineProperty(this, "reynardWorld", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: reynardWorld
        });
    }
    executeSIMDPositions(iterations, deltaTime) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            this.simdSystem.updatePositions(deltaTime);
        }
        return performance.now() - start;
    }
    executeReynardPositions(iterations) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            this.reynardWorld.runSystem("positionUpdateSystem");
        }
        return performance.now() - start;
    }
    executeSIMDCollisions(iterations, radius) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            this.simdSystem.detectCollisions(radius);
        }
        return performance.now() - start;
    }
    executeReynardCollisions(iterations) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            this.reynardWorld.runSystem("collisionSystem");
        }
        return performance.now() - start;
    }
    executeSIMDSpatial(iterations, queryX, queryY, radius) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            this.simdSystem.spatialQuery(queryX, queryY, radius);
        }
        return performance.now() - start;
    }
    executeReynardSpatial(iterations) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            this.reynardWorld.runSystem("spatialQuerySystem");
        }
        return performance.now() - start;
    }
}
export class BenchmarkResultFactory {
    static createPositionResult(name, iterations, totalTime, entityCount) {
        return {
            name,
            iterations,
            totalTime,
            averageTime: totalTime / iterations,
            operationsPerSecond: (iterations * entityCount) / (totalTime / 1000),
        };
    }
    static createCollisionResult(name, iterations, totalTime) {
        return {
            name,
            iterations,
            totalTime,
            averageTime: totalTime / iterations,
            operationsPerSecond: iterations / (totalTime / 1000),
        };
    }
    static createSpatialResult(name, iterations, totalTime) {
        return {
            name,
            iterations,
            totalTime,
            averageTime: totalTime / iterations,
            operationsPerSecond: iterations / (totalTime / 1000),
        };
    }
}
