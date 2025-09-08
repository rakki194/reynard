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

import { WASMDetector as IWASMDetector, WASMSIMDCapabilities } from './ecs-interface';

/**
 * WASM SIMD Detection and Capability System.
 * 
 * Provides comprehensive detection of WebAssembly SIMD support,
 * automatic fallback logic, and performance profiling.
 */
export class WASMDetector implements IWASMDetector {
  private wasmModule: any = null;
  private capabilities: WASMSIMDCapabilities | null = null;
  private detectionCache: Map<string, boolean> = new Map();
  
  /**
   * Check if WASM SIMD is supported by the current environment.
   * 
   * @returns True if WASM SIMD is supported
   */
  isWASMSupported(): boolean {
    const cacheKey = 'wasm-supported';
    if (this.detectionCache.has(cacheKey)) {
      return this.detectionCache.get(cacheKey)!;
    }
    
    try {
      // Check for WebAssembly support
      if (typeof WebAssembly === 'undefined') {
        this.detectionCache.set(cacheKey, false);
        return false;
      }
      
      // Check for SIMD support
      if (typeof WebAssembly.validate === 'function') {
        // Test SIMD instruction validation
        const simdTest = new Uint8Array([
          0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // WASM header
          0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b, // function type returning v128
          0x03, 0x02, 0x01, 0x00, // function section
          0x0a, 0x09, 0x01, 0x07, 0x00, 0xfd, 0x0c, 0x00, 0x00, 0x0b // SIMD instruction
        ]);
        
        const isSupported = WebAssembly.validate(simdTest);
        this.detectionCache.set(cacheKey, isSupported);
        return isSupported;
      }
      
      // Fallback: assume SIMD is supported if WebAssembly is available
      const isSupported = true;
      this.detectionCache.set(cacheKey, isSupported);
      return isSupported;
      
    } catch (error) {
      console.warn('🦦> WASM SIMD detection failed:', error);
      this.detectionCache.set(cacheKey, false);
      return false;
    }
  }
  
  /**
   * Check if WASM SIMD is available and ready to use.
   * 
   * @returns Promise that resolves to true if WASM SIMD is available
   */
  async isWASMAvailable(): Promise<boolean> {
    const cacheKey = 'wasm-available';
    if (this.detectionCache.has(cacheKey)) {
      return this.detectionCache.get(cacheKey)!;
    }
    
    try {
      // First check if WASM is supported
      if (!this.isWASMSupported()) {
        this.detectionCache.set(cacheKey, false);
        return false;
      }
      
      // Try to load the WASM module
      const loaded = await this.loadWASMModule();
      this.detectionCache.set(cacheKey, loaded);
      return loaded;
      
    } catch (error) {
      console.warn('🦦> WASM SIMD availability check failed:', error);
      this.detectionCache.set(cacheKey, false);
      return false;
    }
  }
  
  /**
   * Get WASM SIMD capabilities and performance profile.
   * 
   * @returns Promise that resolves to WASM SIMD capabilities
   */
  async getCapabilities(): Promise<WASMSIMDCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }
    
    const isSupported = this.isWASMSupported();
    const isLoaded = await this.isWASMAvailable();
    
    // Default capabilities
    let capabilities: WASMSIMDCapabilities = {
      isSupported,
      isLoaded,
      availableOperations: [],
      performanceProfile: {
        positionUpdateSpeedup: 1.0,
        collisionDetectionSpeedup: 1.0,
        spatialQuerySpeedup: 1.0
      }
    };
    
    if (isLoaded && this.wasmModule) {
      try {
        // Get available operations from the WASM module
        const operations = this.getAvailableOperations();
        
        // Run performance benchmarks
        const performanceProfile = await this.benchmarkPerformance();
        
        capabilities = {
          isSupported,
          isLoaded,
          availableOperations: operations,
          performanceProfile
        };
        
      } catch (error) {
        console.warn('🦦> Failed to get WASM capabilities:', error);
      }
    }
    
    this.capabilities = capabilities;
    return capabilities;
  }
  
  /**
   * Load the WASM SIMD module.
   * 
   * @returns Promise that resolves to true if loading was successful
   */
  async loadWASMModule(): Promise<boolean> {
    try {
      // Try to import the WASM module
      const wasmModule = await import('../experiments/simd/wasm-loader.js');
      
      if (wasmModule && wasmModule.WASMLoader) {
        const loader = new wasmModule.WASMLoader();
        await loader.initialize();
        
        this.wasmModule = loader;
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.warn('🦦> Failed to load WASM module:', error);
      return false;
    }
  }
  
  /**
   * Get available SIMD operations from the WASM module.
   * 
   * @returns Array of available operation names
   */
  private getAvailableOperations(): string[] {
    if (!this.wasmModule) {
      return [];
    }
    
    const operations: string[] = [];
    
    try {
      // Check for specific SIMD operations
      if (this.wasmModule.simd_vector_add) {
        operations.push('vector_add');
      }
      if (this.wasmModule.simd_vector_sub) {
        operations.push('vector_sub');
      }
      if (this.wasmModule.simd_vector_mul) {
        operations.push('vector_mul');
      }
      if (this.wasmModule.simd_vector_div) {
        operations.push('vector_div');
      }
      if (this.wasmModule.PositionSystemSIMD) {
        operations.push('position_system');
      }
      
    } catch (error) {
      console.warn('🦦> Failed to get available operations:', error);
    }
    
    return operations;
  }
  
  /**
   * Benchmark WASM SIMD performance against TypeScript implementation.
   * 
   * @returns Promise that resolves to performance profile
   */
  private async benchmarkPerformance(): Promise<{
    positionUpdateSpeedup: number;
    collisionDetectionSpeedup: number;
    spatialQuerySpeedup: number;
  }> {
    try {
      // Import the benchmark system
      const benchmarkModule = await import('../experiments/simd/position-benchmark.js');
      const { PositionBenchmark } = benchmarkModule;
      
      // Run a quick benchmark
      const benchmark = new PositionBenchmark(1000);
      await benchmark.initialize();
      
      const results = await benchmark.benchmarkPositionUpdates(100, 100);
      const positionUpdateSpeedup = results.nonSimd.totalTime / results.simd.totalTime;
      
      // For now, assume similar speedups for other operations
      // In a full implementation, you'd benchmark each operation separately
      const collisionDetectionSpeedup = positionUpdateSpeedup * 0.8; // Slightly less for collision detection
      const spatialQuerySpeedup = positionUpdateSpeedup * 0.9; // Slightly less for spatial queries
      
      return {
        positionUpdateSpeedup,
        collisionDetectionSpeedup,
        spatialQuerySpeedup
      };
      
    } catch (error) {
      console.warn('🦦> Performance benchmarking failed:', error);
      return {
        positionUpdateSpeedup: 1.0,
        collisionDetectionSpeedup: 1.0,
        spatialQuerySpeedup: 1.0
      };
    }
  }
  
  /**
   * Clear detection cache and reset state.
   */
  clearCache(): void {
    this.detectionCache.clear();
    this.capabilities = null;
    this.wasmModule = null;
  }
  
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
  } {
    return {
      environment: {
        hasWebAssembly: typeof WebAssembly !== 'undefined',
        hasSIMD: this.isWASMSupported(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown'
      },
      wasm: {
        isSupported: this.isWASMSupported(),
        isAvailable: this.detectionCache.get('wasm-available') || false,
        moduleLoaded: this.wasmModule !== null,
        capabilities: this.capabilities
      },
      performance: {
        cacheSize: this.detectionCache.size,
        lastDetection: new Date().toISOString()
      }
    };
  }
}

/**
 * Global WASM detector instance.
 */
export const wasmDetector = new WASMDetector();

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
export async function isWASMSIMDAvailable(): Promise<boolean> {
  return await wasmDetector.isWASMAvailable();
}

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
export async function getWASMCapabilities(): Promise<WASMSIMDCapabilities> {
  return await wasmDetector.getCapabilities();
}
