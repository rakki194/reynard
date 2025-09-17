/**
 * @fileoverview WASM Manager for SIMD ECS Operations.
 *
 * Handles WASM module initialization, lifecycle management, and
 * entity synchronization between TypeScript and WASM systems.
 *
 * @example
 * ```typescript
 * import { WASMManager } from './wasm-manager';
 *
 * const manager = new WASMManager();
 * await manager.initialize();
 * manager.addEntityToWASM(entity, components);
 * ```
 *
 * @performance
 * - Manages WASM SIMD module lifecycle
 * - Handles entity synchronization
 * - Optimized for minimal overhead
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { Entity, Component } from "../types";
/**
 * WASM Manager for handling SIMD operations.
 *
 * Manages the lifecycle of WASM modules and provides methods
 * for synchronizing entities between TypeScript and WASM systems.
 */
export declare class WASMManager {
    private wasmLoader;
    private wasmModule;
    private wasmInitialized;
    /**
     * Initialize the WASM module.
     */
    initialize(): Promise<void>;
    /**
     * Check if WASM is initialized and ready.
     */
    get isInitialized(): boolean;
    /**
     * Get the WASM module instance.
     */
    get module(): Record<string, unknown> | null;
    /**
     * Add an entity to the WASM system.
     */
    addEntityToWASM(entity: Entity, components: Component[]): void;
    /**
     * Remove an entity from the WASM system.
     */
    removeEntityFromWASM(entity: Entity): void;
    /**
     * Update an entity in the WASM system.
     */
    updateEntityInWASM(entity: Entity, _components: Component[]): void;
    /**
     * Run WASM SIMD systems.
     */
    runWASMSystems(deltaTime?: number): void;
    /**
     * Clear all WASM entities.
     */
    clearWASMEntities(): void;
    /**
     * Dispose of WASM resources.
     */
    dispose(): void;
}
