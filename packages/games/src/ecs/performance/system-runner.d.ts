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
import { World } from "../types";
import { WASMManager } from "./wasm-manager";
import { PerformanceMonitor } from "./performance-monitor";
/**
 * System runner for ECS operations.
 *
 * Handles the execution of systems with proper timing,
 * resource management, and error handling.
 */
export declare class SystemRunner {
    private world;
    private wasmManager;
    private performanceMonitor;
    constructor(world: World, wasmManager: WASMManager, performanceMonitor: PerformanceMonitor);
    /**
     * Run all registered systems.
     */
    runSystems(systemFunctions: Array<{
        fn: (world: World) => void;
        name: string;
    }>, deltaTime?: number): void;
    /**
     * Add deltaTime as a resource if needed.
     */
    private addDeltaTimeResource;
    /**
     * Run a single system with timing.
     */
    private runSingleSystem;
}
