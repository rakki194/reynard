/**
 * @fileoverview TypeScript ECS Implementation for Unified Interface.
 *
 * This module provides a TypeScript implementation of the unified ECS interface,
 * serving as the fallback when WASM SIMD is not available or preferred.
 *
 * @example
 * ```typescript
 * import { TypeScriptECS } from './typescript-ecs';
 *
 * const ecs = new TypeScriptECS({ maxEntities: 10000 });
 * const entity = ecs.spawn(new Position(0, 0), new Velocity(1, 1));
 * ecs.runSystems(0.016);
 * ```
 *
 * @performance
 * - Full TypeScript compatibility
 * - Optimized for JavaScript engines
 * - Graceful fallback from WASM SIMD
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { ECSConfig, ECSPerformanceMetrics, UnifiedECS } from "./ecs-interface";
import { Component, Entity, Resource, World } from "../types";
/**
 * TypeScript ECS Implementation.
 *
 * Provides a full TypeScript implementation of the unified ECS interface,
 * serving as the fallback when WASM SIMD is not available.
 */
export declare class TypeScriptECS implements UnifiedECS {
    readonly world: World;
    readonly metrics: ECSPerformanceMetrics;
    readonly isWASMActive: boolean;
    readonly performanceMode: "typescript";
    private systemFunctions;
    private performanceStartTime;
    private systemExecutionTimes;
    private entityCount;
    private componentCount;
    constructor(config?: ECSConfig);
    /**
     * Initialize performance metrics.
     */
    private initializeMetrics;
    /**
     * Start performance monitoring.
     */
    private startPerformanceMonitoring;
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
    remove<T extends Component[]>(entity: Entity, ...componentTypes: any[]): void;
    /**
     * Query entities with specific component combinations.
     */
    query<T extends Component[]>(...componentTypes: any[]): any;
    /**
     * Add a resource to the world.
     */
    addResource<T extends Resource>(resource: T): void;
    /**
     * Get a resource from the world.
     */
    getResource<T extends Resource>(resourceType: any): T | undefined;
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
    /**
     * Update performance metrics.
     */
    private updateMetrics;
}
/**
 * Create a TypeScript ECS instance.
 *
 * @param config - Configuration options for the ECS system
 * @returns Promise that resolves to a TypeScript ECS instance
 *
 * @example
 * ```typescript
 * import { createTypeScriptECS } from './typescript-ecs';
 *
 * const ecs = await createTypeScriptECS({
 *   maxEntities: 10000,
 *   enableMetrics: true
 * });
 * ```
 */
export declare function createTypeScriptECS(config?: ECSConfig): Promise<TypeScriptECS>;
