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

import { World, Resource } from "../types";
import { WASMManager } from "./wasm-manager";
import { PerformanceMonitor } from "./performance-monitor";

/**
 * System runner for ECS operations.
 *
 * Handles the execution of systems with proper timing,
 * resource management, and error handling.
 */
export class SystemRunner {
  constructor(
    private world: World,
    private wasmManager: WASMManager,
    private performanceMonitor: PerformanceMonitor,
  ) {}

  /**
   * Run all registered systems.
   */
  runSystems(
    systemFunctions: Array<{ fn: (world: World) => void; name: string }>,
    deltaTime?: number,
  ): void {
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
  private addDeltaTimeResource(deltaTime?: number): void {
    if (deltaTime !== undefined) {
      // Note: This is a simplified check - in a real implementation,
      // you'd properly check for the GameTime resource type
      const gameTime = null;
      if (!gameTime) {
        this.world.insertResource({
          __resource: true,
          deltaTime,
          totalTime: performance.now(),
        } as Resource);
      }
    }
  }

  /**
   * Run a single system with timing.
   */
  private runSingleSystem(fn: (world: World) => void, name: string): void {
    const systemStartTime = performance.now();

    try {
      fn(this.world);
    } catch (error) {
      console.error(`🦦> System '${name}' failed:`, error);
    }

    const systemEndTime = performance.now();
    const systemTime = systemEndTime - systemStartTime;
    this.performanceMonitor.recordSystemTime(systemTime);
  }
}
