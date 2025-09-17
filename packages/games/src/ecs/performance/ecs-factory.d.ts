/**
 * @fileoverview ECS Factory for Automatic Implementation Selection.
 *
 * This module provides a factory function that automatically selects the best
 * available ECS implementation (WASM SIMD or TypeScript) based on browser
 * capabilities and user preferences.
 *
 * @example
 * ```typescript
 * import { createECSSystem } from './ecs-factory';
 *
 * // Automatically selects the best available implementation
 * const ecs = await createECSSystem({
 *   maxEntities: 10000,
 *   enableWASM: true,
 *   fallbackBehavior: 'warn'
 * });
 *
 * console.log(`Using ${ecs.performanceMode} implementation`);
 * console.log(`WASM SIMD active: ${ecs.isWASMActive}`);
 * ```
 *
 * @performance
 * - Automatic WASM SIMD detection and fallback
 * - Zero configuration required for optimal performance
 * - Graceful degradation to TypeScript implementation
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { ECSConfig, ECSFactoryFunction, UnifiedECS } from "./ecs-interface";
/**
 * ECS Factory for automatic implementation selection.
 *
 * Automatically selects the best available ECS implementation based on
 * browser capabilities, user preferences, and fallback behavior.
 */
export declare class ECSFactory {
    private static instance;
    private detectionCache;
    /**
     * Get the singleton instance of the ECS factory.
     */
    static getInstance(): ECSFactory;
    /**
     * Create an ECS system with automatic implementation selection.
     *
     * @param config - Configuration options for the ECS system
     * @returns Promise that resolves to the best available ECS implementation
     *
     * @example
     * ```typescript
     * import { createECSSystem } from './ecs-factory';
     *
     * const ecs = await createECSSystem({
     *   maxEntities: 10000,
     *   enableWASM: true,
     *   preferredMode: 'auto',
     *   fallbackBehavior: 'warn'
     * });
     * ```
     */
    createECSSystem(config?: ECSConfig): Promise<UnifiedECS>;
    /**
     * Select the best available implementation based on configuration.
     */
    private selectBestImplementation;
    /**
     * Check if WASM SIMD is available.
     */
    isWASMAvailable(): Promise<boolean>;
    /**
     * Create a specific implementation.
     */
    private createImplementation;
    /**
     * Log successful implementation creation.
     */
    private logImplementationSuccess;
    /**
     * Log successful fallback.
     */
    private logFallbackSuccess;
    /**
     * Clear the detection cache.
     */
    clearCache(): void;
    /**
     * Get diagnostic information about the factory.
     */
    getDiagnostics(): {
        factory: {
            cacheSize: number;
            instanceCreated: boolean;
        };
        wasm: any;
    };
}
/**
 * Create an ECS system with automatic implementation selection.
 *
 * This is the main entry point for creating ECS systems. It automatically
 * selects the best available implementation (WASM SIMD or TypeScript) based
 * on browser capabilities and user preferences.
 *
 * @param config - Configuration options for the ECS system
 * @returns Promise that resolves to the best available ECS implementation
 *
 * @example
 * ```typescript
 * import { createECSSystem } from './ecs-factory';
 *
 * // Simple usage - automatically selects best implementation
 * const ecs = await createECSSystem();
 *
 * // Advanced usage with configuration
 * const ecs = await createECSSystem({
 *   maxEntities: 10000,
 *   enableWASM: true,
 *   preferredMode: 'auto',
 *   fallbackBehavior: 'warn',
 *   enableMetrics: true
 * });
 *
 * // Use the ECS system
 * const entity = ecs.spawn(new Position(0, 0), new Velocity(1, 1));
 * ecs.runSystems(0.016);
 * ```
 */
export declare const createECSSystem: ECSFactoryFunction;
/**
 * Create a TypeScript ECS system (explicit fallback).
 *
 * @param config - Configuration options for the ECS system
 * @returns Promise that resolves to a TypeScript ECS implementation
 *
 * @example
 * ```typescript
 * import { createTypeScriptECSSystem } from './ecs-factory';
 *
 * // Force TypeScript implementation
 * const ecs = await createTypeScriptECSSystem({
 *   maxEntities: 10000,
 *   enableMetrics: true
 * });
 * ```
 */
export declare const createTypeScriptECSSystem: (config?: ECSConfig) => Promise<UnifiedECS>;
/**
 * Create a WASM SIMD ECS system (explicit high-performance).
 *
 * @param config - Configuration options for the ECS system
 * @returns Promise that resolves to a WASM SIMD ECS implementation
 *
 * @example
 * ```typescript
 * import { createWASMSIMDECSSystem } from './ecs-factory';
 *
 * // Force WASM SIMD implementation
 * const ecs = await createWASMSIMDECSSystem({
 *   maxEntities: 10000,
 *   enableMetrics: true
 * });
 * ```
 */
export declare const createWASMSIMDECSSystem: (config?: ECSConfig) => Promise<UnifiedECS>;
/**
 * Check if WASM SIMD is available in the current environment.
 *
 * @returns Promise that resolves to true if WASM SIMD is available
 *
 * @example
 * ```typescript
 * import { isWASMSIMDAvailable } from './ecs-factory';
 *
 * if (await isWASMSIMDAvailable()) {
 *   console.log('WASM SIMD is available!');
 * } else {
 *   console.log('Using TypeScript fallback');
 * }
 * ```
 */
export declare const isWASMSIMDAvailable: () => Promise<boolean>;
/**
 * Get diagnostic information about the ECS factory and WASM capabilities.
 *
 * @returns Diagnostic information
 *
 * @example
 * ```typescript
 * import { getECSDiagnostics } from './ecs-factory';
 *
 * const diagnostics = getECSDiagnostics();
 * console.log('ECS Factory Diagnostics:', diagnostics);
 * ```
 */
export declare const getECSDiagnostics: () => any;
