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

import { createTypeScriptECS } from "./typescript-ecs";
import { wasmDetector } from "./wasm-detector";
import { createWASMSIMDECS } from "./wasm-simd-ecs";

/**
 * ECS Factory for automatic implementation selection.
 *
 * Automatically selects the best available ECS implementation based on
 * browser capabilities, user preferences, and fallback behavior.
 */
export class ECSFactory {
  private static instance: ECSFactory | null = null;
  private detectionCache: Map<string, boolean> = new Map();

  /**
   * Get the singleton instance of the ECS factory.
   */
  static getInstance(): ECSFactory {
    if (!ECSFactory.instance) {
      ECSFactory.instance = new ECSFactory();
    }
    return ECSFactory.instance;
  }

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
  async createECSSystem(config: ECSConfig = {}): Promise<UnifiedECS> {
    const { enableWASM = true, preferredMode = "auto", fallbackBehavior = "warn", ...restConfig } = config;

    console.log("🦊> Creating ECS system with automatic implementation selection...");

    // Determine the best implementation to use
    const implementation = await this.selectBestImplementation({
      enableWASM,
      preferredMode,
      fallbackBehavior,
    });

    console.log(`🦦> Selected implementation: ${implementation}`);

    try {
      // Create the selected implementation
      const ecs = await this.createImplementation(implementation, restConfig);

      // Log success
      this.logImplementationSuccess(ecs, implementation);

      return ecs;
    } catch (error) {
      console.error(`🦦> Failed to create ${implementation} implementation:`, error);

      // Try fallback if the preferred implementation failed
      if (implementation !== "typescript") {
        console.log("🦦> Attempting fallback to TypeScript implementation...");

        try {
          const fallbackECS = await this.createImplementation("typescript", restConfig);
          this.logFallbackSuccess(fallbackECS, implementation);
          return fallbackECS;
        } catch (fallbackError) {
          console.error("🦦> Fallback to TypeScript also failed:", fallbackError);
          throw new Error("All ECS implementations failed to initialize");
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Select the best available implementation based on configuration.
   */
  private async selectBestImplementation(config: {
    enableWASM: boolean;
    preferredMode: "wasm-simd" | "typescript" | "auto";
    fallbackBehavior: "silent" | "warn" | "error";
  }): Promise<"wasm-simd" | "typescript"> {
    // If WASM is disabled, use TypeScript
    if (!config.enableWASM) {
      console.log("🦦> WASM disabled, using TypeScript implementation");
      return "typescript";
    }

    // If TypeScript is preferred, use TypeScript
    if (config.preferredMode === "typescript") {
      console.log("🦦> TypeScript preferred, using TypeScript implementation");
      return "typescript";
    }

    // If WASM SIMD is preferred, check availability
    if (config.preferredMode === "wasm-simd") {
      const isAvailable = await this.isWASMAvailable();
      if (isAvailable) {
        console.log("🦦> WASM SIMD preferred and available, using WASM SIMD implementation");
        return "wasm-simd";
      } else {
        console.log("🦦> WASM SIMD preferred but not available, using TypeScript implementation");
        return "typescript";
      }
    }

    // Auto mode: select the best available implementation
    if (config.preferredMode === "auto") {
      const isAvailable = await this.isWASMAvailable();
      if (isAvailable) {
        console.log("🦦> Auto mode: WASM SIMD available, using WASM SIMD implementation");
        return "wasm-simd";
      } else {
        console.log("🦦> Auto mode: WASM SIMD not available, using TypeScript implementation");
        return "typescript";
      }
    }

    // Default to TypeScript
    console.log("🦦> Defaulting to TypeScript implementation");
    return "typescript";
  }

  /**
   * Check if WASM SIMD is available.
   */
  async isWASMAvailable(): Promise<boolean> {
    const cacheKey = "wasm-available";
    if (this.detectionCache.has(cacheKey)) {
      return this.detectionCache.get(cacheKey)!;
    }

    try {
      const isAvailable = await wasmDetector.isWASMAvailable();
      this.detectionCache.set(cacheKey, isAvailable);
      return isAvailable;
    } catch (error) {
      console.warn("🦦> WASM availability check failed:", error);
      this.detectionCache.set(cacheKey, false);
      return false;
    }
  }

  /**
   * Create a specific implementation.
   */
  private async createImplementation(
    implementation: "wasm-simd" | "typescript",
    config: Omit<ECSConfig, "enableWASM" | "preferredMode" | "fallbackBehavior">
  ): Promise<UnifiedECS> {
    switch (implementation) {
      case "wasm-simd":
        return await createWASMSIMDECS(config);

      case "typescript":
        return await createTypeScriptECS(config);

      default:
        throw new Error(`Unknown implementation: ${implementation}`);
    }
  }

  /**
   * Log successful implementation creation.
   */
  private logImplementationSuccess(ecs: UnifiedECS, implementation: string): void {
    console.log(`✅ Successfully created ${implementation} ECS system`);
    console.log(`   Performance mode: ${ecs.performanceMode}`);
    console.log(`   WASM SIMD active: ${ecs.isWASMActive}`);
    console.log(`   Max entities: ${ecs.metrics.entityCount}`);
  }

  /**
   * Log successful fallback.
   */
  private logFallbackSuccess(ecs: UnifiedECS, failedImplementation: string): void {
    console.log(`✅ Fallback successful: ${failedImplementation} → ${ecs.performanceMode}`);
    console.log(`   Performance mode: ${ecs.performanceMode}`);
    console.log(`   WASM SIMD active: ${ecs.isWASMActive}`);
  }

  /**
   * Clear the detection cache.
   */
  clearCache(): void {
    this.detectionCache.clear();
    wasmDetector.clearCache();
  }

  /**
   * Get diagnostic information about the factory.
   */
  getDiagnostics(): {
    factory: {
      cacheSize: number;
      instanceCreated: boolean;
    };
    wasm: any;
  } {
    return {
      factory: {
        cacheSize: this.detectionCache.size,
        instanceCreated: ECSFactory.instance !== null,
      },
      wasm: wasmDetector.getDiagnostics(),
    };
  }
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
export const createECSSystem: ECSFactoryFunction = async (config?: ECSConfig): Promise<UnifiedECS> => {
  const factory = ECSFactory.getInstance();
  return await factory.createECSSystem(config);
};

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
export const createTypeScriptECSSystem = async (config?: ECSConfig): Promise<UnifiedECS> => {
  return await createTypeScriptECS({
    ...config,
    enableWASM: false,
    preferredMode: "typescript",
  });
};

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
export const createWASMSIMDECSSystem = async (config?: ECSConfig): Promise<UnifiedECS> => {
  return await createWASMSIMDECS({
    ...config,
    enableWASM: true,
    preferredMode: "wasm-simd",
  });
};

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
export const isWASMSIMDAvailable = async (): Promise<boolean> => {
  const factory = ECSFactory.getInstance();
  return await factory.isWASMAvailable();
};

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
export const getECSDiagnostics = (): any => {
  const factory = ECSFactory.getInstance();
  return factory.getDiagnostics();
};
