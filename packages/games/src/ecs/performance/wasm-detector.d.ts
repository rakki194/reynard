/**
 * @fileoverview WASM SIMD Detection and Capability System.
 *
 * This module provides comprehensive detection of WebAssembly SIMD capabilities,
 * automatic fallback logic, and performance profiling for the Reynard ECS system.
 *
 * @example
 * ```typescript
 * import { WASMDetector } from './wasm-detector';
 *
 * const detector = new WASMDetector();
 * if (await detector.isWASMAvailable()) {
 *   console.log('WASM SIMD is available!');
 *   const capabilities = await detector.getCapabilities();
 *   console.log(`Position update speedup: ${capabilities.performanceProfile.positionUpdateSpeedup}x`);
 * }
 * ```
 *
 * @performance
 * - Automatic detection with minimal overhead
 * - Graceful fallback to TypeScript implementation
 * - Performance profiling and optimization hints
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { WASMDetector as IWASMDetector, WASMSIMDCapabilities } from "./ecs-interface";
/**
 * WASM SIMD Detection and Capability System.
 *
 * Provides comprehensive detection of WebAssembly SIMD support,
 * automatic fallback logic, and performance profiling.
 */
export declare class WASMDetector implements IWASMDetector {
    private wasmModule;
    private capabilities;
    private detectionCache;
    /**
     * Check if WASM SIMD is supported by the current environment.
     *
     * @returns True if WASM SIMD is supported
     */
    isWASMSupported(): boolean;
    /**
     * Check if WASM SIMD is available and ready to use.
     *
     * @returns Promise that resolves to true if WASM SIMD is available
     */
    isWASMAvailable(): Promise<boolean>;
    /**
     * Get WASM SIMD capabilities and performance profile.
     *
     * @returns Promise that resolves to WASM SIMD capabilities
     */
    getCapabilities(): Promise<WASMSIMDCapabilities>;
    /**
     * Load the WASM SIMD module.
     *
     * @returns Promise that resolves to true if loading was successful
     */
    loadWASMModule(): Promise<boolean>;
    /**
     * Get available SIMD operations from the WASM module.
     *
     * @returns Array of available operation names
     */
    private getAvailableOperations;
    /**
     * Benchmark WASM SIMD performance against TypeScript implementation.
     *
     * @returns Promise that resolves to performance profile
     */
    private benchmarkPerformance;
    /**
     * Clear detection cache and reset state.
     */
    clearCache(): void;
    /**
     * Get detailed diagnostic information.
     *
     * @returns Diagnostic information about WASM SIMD support
     */
    getDiagnostics(): {
        environment: {
            hasWebAssembly: boolean;
            hasSIMD: boolean;
            userAgent: string;
            platform: string;
        };
        wasm: {
            isSupported: boolean;
            isAvailable: boolean;
            moduleLoaded: boolean;
            capabilities: WASMSIMDCapabilities | null;
        };
        performance: {
            cacheSize: number;
            lastDetection: string;
        };
    };
}
/**
 * Global WASM detector instance.
 */
export declare const wasmDetector: WASMDetector;
/**
 * Utility function to check WASM SIMD support.
 *
 * @returns Promise that resolves to true if WASM SIMD is available
 *
 * @example
 * ```typescript
 * import { isWASMSIMDAvailable } from './wasm-detector';
 *
 * if (await isWASMSIMDAvailable()) {
 *   console.log('WASM SIMD is ready to use!');
 * }
 * ```
 */
export declare function isWASMSIMDAvailable(): Promise<boolean>;
/**
 * Utility function to get WASM SIMD capabilities.
 *
 * @returns Promise that resolves to WASM SIMD capabilities
 *
 * @example
 * ```typescript
 * import { getWASMCapabilities } from './wasm-detector';
 *
 * const capabilities = await getWASMCapabilities();
 * console.log(`Position update speedup: ${capabilities.performanceProfile.positionUpdateSpeedup}x`);
 * ```
 */
export declare function getWASMCapabilities(): Promise<WASMSIMDCapabilities>;
