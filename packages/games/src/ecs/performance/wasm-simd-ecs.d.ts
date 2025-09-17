/**
 * @fileoverview WASM SIMD ECS Implementation - Refactored.
 *
 * Orchestrates WASM SIMD operations using focused modules for
 * initialization, component extraction, performance monitoring,
 * and query conversion.
 *
 * @example
 * ```typescript
 * import { WASMSIMDECS } from './wasm-simd-ecs';
 *
 * const ecs = new WASMSIMDECS({ maxEntities: 10000 });
 * const entity = ecs.spawn(new Position(0, 0), new Velocity(1, 1));
 * ecs.runSystems(0.016); // 4.2x faster than TypeScript!
 * ```
 *
 * @performance
 * - 4.2x speedup for position updates
 * - Modular architecture for maintainability
 * - Efficient resource management
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { UnifiedECS, ECSConfig, ECSPerformanceMetrics } from "./ecs-interface";
import { Entity, Component, Resource, World } from "../types";
import { ComponentType, ResourceType } from "../types/storage";
/**
 * WASM SIMD ECS Implementation - Refactored.
 *
 * Orchestrates focused modules to provide a WASM SIMD implementation
 * of the unified ECS interface with high performance and maintainability.
 */
export declare class WASMSIMDECS implements UnifiedECS {
    readonly world: World;
    readonly metrics: ECSPerformanceMetrics;
    readonly isWASMActive: boolean;
    readonly performanceMode: "wasm-simd";
    private wasmManager;
    private componentExtractor;
    private performanceMonitor;
    private queryConverter;
    private systemRunner;
    private systemFunctions;
    constructor(config?: ECSConfig);
    /**
     * Initialize WASM module.
     */
    private initializeWASM;
    /**
     * Spawn a new entity with the given components.
     */
    spawn<T extends Component[]>(...components: T): Entity;
    /**
     * Spawn an empty entity.
     */
    spawnEmpty(): Entity;
    /**
     * Despawn an entity and all its components.
     */
    despawn(entity: Entity): void;
    /**
     * Insert components into an existing entity.
     */
    insert<T extends Component[]>(entity: Entity, ...components: T): void;
    /**
     * Remove components from an entity.
     */
    remove(entity: Entity, ...componentTypes: ComponentType<Component>[]): void;
    /**
     * Query entities with specific component combinations.
     */
    query<T extends Component[]>(...componentTypes: ComponentType<Component>[]): IterableIterator<[Entity, ...T]>;
    /**
     * Add a resource to the world.
     */
    addResource<T extends Resource>(resource: T): void;
    /**
     * Get a resource from the world.
     */
    getResource<T extends Resource>(resourceType: ResourceType<T>): T | undefined;
    /**
     * Register a system function.
     */
    addSystem(system: (world: World) => void, name?: string): void;
    /**
     * Run all registered systems.
     */
    runSystems(deltaTime?: number): void;
    /**
     * Clear all entities and resources from the world.
     */
    clear(): void;
    /**
     * Get performance metrics for the current session.
     */
    getMetrics(): ECSPerformanceMetrics;
    /**
     * Force switch to a specific performance mode.
     */
    setPerformanceMode(mode: "wasm-simd" | "typescript" | "auto"): boolean;
    /**
     * Dispose of the ECS system and clean up resources.
     */
    dispose(): void;
}
/**
 * Create a WASM SIMD ECS instance.
 *
 * @param config - Configuration options for the ECS system
 * @returns Promise that resolves to a WASM SIMD ECS instance
 *
 * @example
 * ```typescript
 * import { createWASMSIMDECS } from './wasm-simd-ecs';
 *
 * const ecs = await createWASMSIMDECS({
 *   maxEntities: 10000,
 *   enableMetrics: true
 * });
 * ```
 */
export declare function createWASMSIMDECS(config?: ECSConfig): Promise<WASMSIMDECS>;
