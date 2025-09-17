/**
 * @fileoverview System Runner for WASM SIMD ECS.
 *
 * Handles system execution, timing, and resource management
 * for the ECS system.
 *
 * @example
 * ```typescript
 * import { SystemRunner } from './system-runner';
 *
 * const runner = new SystemRunner(world, wasmManager, performanceMonitor);
 * runner.runSystems(systemFunctions, deltaTime);
 * ```
 *
 * @performance
 * - Efficient system execution
 * - Performance timing
 * - Resource management
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
/**
 * System runner for ECS operations.
 *
 * Handles the execution of systems with proper timing,
 * resource management, and error handling.
 */
export class SystemRunner {
    constructor(world, wasmManager, performanceMonitor) {
        Object.defineProperty(this, "world", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: world
        });
        Object.defineProperty(this, "wasmManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: wasmManager
        });
        Object.defineProperty(this, "performanceMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: performanceMonitor
        });
    }
    /**
     * Run all registered systems.
     */
    runSystems(systemFunctions, deltaTime) {
        this.addDeltaTimeResource(deltaTime);
        // Run WASM SIMD systems first for performance-critical operations
        if (this.wasmManager.isInitialized) {
            this.wasmManager.runWASMSystems(deltaTime);
        }
        // Run TypeScript systems
        for (const { fn, name } of systemFunctions) {
            this.runSingleSystem(fn, name);
        }
    }
    /**
     * Add deltaTime as a resource if needed.
     */
    addDeltaTimeResource(deltaTime) {
        if (deltaTime !== undefined) {
            // Note: This is a simplified check - in a real implementation,
            // you'd properly check for the GameTime resource type
            const gameTime = null;
            if (!gameTime) {
                this.world.insertResource({
                    __resource: true,
                    deltaTime,
                    totalTime: performance.now(),
                });
            }
        }
    }
    /**
     * Run a single system with timing.
     */
    runSingleSystem(fn, name) {
        const systemStartTime = performance.now();
        try {
            fn(this.world);
        }
        catch (error) {
            console.error(`🦦> System '${name}' failed:`, error);
        }
        const systemEndTime = performance.now();
        const systemTime = systemEndTime - systemStartTime;
        this.performanceMonitor.recordSystemTime(systemTime);
    }
}
