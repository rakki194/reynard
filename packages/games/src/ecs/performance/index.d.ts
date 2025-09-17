/**
 * @fileoverview Reynard ECS Performance Package - Main Entry Point.
 *
 * This package provides high-performance ECS implementations with automatic
 * WASM SIMD acceleration and graceful TypeScript fallback.
 *
 * @example
 * ```typescript
 * import { createECSSystem } from './performance';
 *
 * // Automatically selects the best available implementation
 * const ecs = await createECSSystem({
 *   maxEntities: 10000,
 *   enableWASM: true,
 *   enableMetrics: true
 * });
 *
 * // Use the ECS system
 * const entity = ecs.spawn(new Position(0, 0), new Velocity(1, 1));
 * ecs.runSystems(0.016);
 *
 * console.log(`Performance mode: ${ecs.performanceMode}`);
 * console.log(`WASM SIMD active: ${ecs.isWASMActive}`);
 * ```
 *
 * @performance
 * - Automatic WASM SIMD detection and acceleration
 * - 4.2x speedup for position updates with WASM SIMD
 * - Graceful fallback to TypeScript implementation
 * - Zero configuration required for optimal performance
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { createECSSystem } from "./ecs-factory";
import type { UnifiedECS } from "./ecs-interface";
export { createECSSystem, createTypeScriptECSSystem, createWASMSIMDECSSystem, getECSDiagnostics, isWASMSIMDAvailable, } from "./ecs-factory";
export type { ECSConfig, ECSFactoryFunction, ECSPerformanceMetrics, UnifiedECS, WASMSIMDCapabilities, } from "./ecs-interface";
export { TypeScriptECS } from "./typescript-ecs";
export { WASMDetector } from "./wasm-detector";
export { WASMSIMDECS } from "./wasm-simd-ecs";
export type { Component, Entity, Resource, World } from "../types";
/**
 * Quick start function for common ECS usage patterns.
 *
 * @param maxEntities - Maximum number of entities to support
 * @returns Promise that resolves to a configured ECS system
 *
 * @example
 * ```typescript
 * import { quickStartECS } from './performance';
 *
 * // Quick start with default configuration
 * const ecs = await quickStartECS(10000);
 *
 * // Use the ECS system
 * const entity = ecs.spawn(new Position(0, 0), new Velocity(1, 1));
 * ecs.runSystems(0.016);
 * ```
 */
export declare function quickStartECS(maxEntities?: number): Promise<UnifiedECS>;
/**
 * Performance benchmark function for comparing implementations.
 *
 * @param entityCount - Number of entities to benchmark
 * @param iterations - Number of iterations to run
 * @returns Promise that resolves to benchmark results
 *
 * @example
 * ```typescript
 * import { benchmarkECS } from './performance';
 *
 * const results = await benchmarkECS(1000, 100);
 * console.log(`WASM SIMD speedup: ${results.wasmSpeedup}x`);
 * ```
 */
export declare function benchmarkECS(entityCount?: number, iterations?: number): Promise<{
    wasmSpeedup: number;
    typescriptTime: number;
    wasmTime: number;
    implementation: string;
}>;
/**
 * Diagnostic function for troubleshooting ECS performance issues.
 *
 * @returns Comprehensive diagnostic information
 *
 * @example
 * ```typescript
 * import { diagnoseECS } from './performance';
 *
 * const diagnostics = await diagnoseECS();
 * console.log('ECS Diagnostics:', diagnostics);
 * ```
 */
export declare function diagnoseECS(): Promise<{
    environment: Record<string, unknown>;
    wasm: Record<string, unknown>;
    performance: Record<string, unknown>;
    recommendations: string[];
}>;
export default createECSSystem;
