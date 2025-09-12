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
import { createWorld } from "../world";

/**
 * TypeScript ECS Implementation.
 *
 * Provides a full TypeScript implementation of the unified ECS interface,
 * serving as the fallback when WASM SIMD is not available.
 */
export class TypeScriptECS implements UnifiedECS {
  public readonly world: World;
  public readonly metrics: ECSPerformanceMetrics;
  public readonly isWASMActive: boolean = false;
  public readonly performanceMode: "typescript" = "typescript";

  private systemFunctions: Array<{ fn: (world: World) => void; name: string }> =
    [];
  private performanceStartTime: number = 0;
  private systemExecutionTimes: number[] = [];
  private entityCount: number = 0;
  private componentCount: number = 0;

  constructor(config: ECSConfig = {}) {
    this.world = createWorld();
    this.metrics = this.initializeMetrics();

    // Configure the world based on config
    if (config.maxEntities) {
      // Note: The actual world implementation would need to support maxEntities
      // This is a placeholder for the configuration
      console.log(
        `🦦> TypeScript ECS configured for max ${config.maxEntities} entities`,
      );
    }

    if (config.enableMetrics) {
      this.startPerformanceMonitoring();
    }
  }

  /**
   * Initialize performance metrics.
   */
  private initializeMetrics(): ECSPerformanceMetrics {
    return {
      entityCount: 0,
      componentCount: 0,
      averageSystemTime: 0,
      memoryUsage: 0,
      performanceMode: "typescript",
    };
  }

  /**
   * Start performance monitoring.
   */
  private startPerformanceMonitoring(): void {
    // Monitor memory usage (if available in browser)
    if (typeof performance !== "undefined" && (performance as any).memory) {
      setInterval(() => {
        this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
      }, 1000);
    }
  }

  /**
   * Spawn a new entity with the given components.
   */
  spawn<T extends Component[]>(...components: T): Entity {
    const entity = this.world.spawnEmpty();
    this.world.insert(entity, ...components);

    this.entityCount++;
    this.componentCount += components.length;
    this.updateMetrics();

    return entity;
  }

  /**
   * Spawn an empty entity.
   */
  spawnEmpty(): Entity {
    const entity = this.world.spawnEmpty();
    this.entityCount++;
    this.updateMetrics();
    return entity;
  }

  /**
   * Despawn an entity and all its components.
   */
  despawn(entity: Entity): void {
    this.world.despawn(entity);
    this.entityCount--;
    // Note: Component count tracking would require additional world methods
    this.updateMetrics();
  }

  /**
   * Insert components into an existing entity.
   */
  insert<T extends Component[]>(entity: Entity, ...components: T): void {
    this.world.insert(entity, ...components);
    this.componentCount += components.length;
    this.updateMetrics();
  }

  /**
   * Remove components from an entity.
   */
  remove<T extends Component[]>(
    entity: Entity,
    ...componentTypes: any[]
  ): void {
    this.world.remove(entity, ...componentTypes);
    // Note: Component count tracking would require additional world methods
    this.updateMetrics();
  }

  /**
   * Query entities with specific component combinations.
   */
  query<T extends Component[]>(...componentTypes: any[]): any {
    return this.world.query(...componentTypes);
  }

  /**
   * Add a resource to the world.
   */
  addResource<T extends Resource>(resource: T): void {
    this.world.insertResource(resource);
  }

  /**
   * Get a resource from the world.
   */
  getResource<T extends Resource>(resourceType: any): T | undefined {
    return this.world.getResource(resourceType);
  }

  /**
   * Register a system function.
   */
  addSystem(system: (world: World) => void, name: string = "unnamed"): void {
    this.systemFunctions.push({ fn: system, name });
  }

  /**
   * Run all registered systems.
   */
  runSystems(deltaTime?: number): void {
    if (deltaTime !== undefined) {
      // Add deltaTime as a resource if not already present
      const gameTime = this.world.getResource("GameTime" as any);
      if (!gameTime) {
        this.addResource({
          __resource: true,
          deltaTime,
          totalTime: performance.now(),
        } as any);
      }
    }

    this.performanceStartTime = performance.now();

    for (const { fn, name } of this.systemFunctions) {
      const systemStartTime = performance.now();

      try {
        fn(this.world);
      } catch (error) {
        console.error(`🦦> System '${name}' failed:`, error);
      }

      const systemEndTime = performance.now();
      const systemTime = systemEndTime - systemStartTime;
      this.systemExecutionTimes.push(systemTime);

      // Keep only the last 100 execution times for averaging
      if (this.systemExecutionTimes.length > 100) {
        this.systemExecutionTimes.shift();
      }
    }

    this.updateMetrics();
  }

  /**
   * Clear all entities and resources from the world.
   */
  clear(): void {
    // Clear all entities
    const entitiesToDespawn: any[] = [];
    const entityQuery = this.world.query("Entity" as any);
    if (entityQuery && typeof entityQuery.forEach === "function") {
      entityQuery.forEach((entity: any) => {
        entitiesToDespawn.push(entity);
      });
    }
    for (const entity of entitiesToDespawn) {
      this.world.despawn(entity);
    }

    this.entityCount = 0;
    this.componentCount = 0;
    this.systemExecutionTimes = [];
    this.updateMetrics();
  }

  /**
   * Get performance metrics for the current session.
   */
  getMetrics(): ECSPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Force switch to a specific performance mode.
   */
  setPerformanceMode(mode: "wasm-simd" | "typescript" | "auto"): boolean {
    // TypeScript ECS can only run in TypeScript mode
    if (mode === "typescript" || mode === "auto") {
      return true;
    }

    console.warn("🦦> TypeScript ECS cannot switch to WASM SIMD mode");
    return false;
  }

  /**
   * Dispose of the ECS system and clean up resources.
   */
  dispose(): void {
    this.clear();
    this.systemFunctions = [];
    this.systemExecutionTimes = [];
  }

  /**
   * Update performance metrics.
   */
  private updateMetrics(): void {
    this.metrics.entityCount = this.entityCount;
    this.metrics.componentCount = this.componentCount;

    if (this.systemExecutionTimes.length > 0) {
      const totalTime = this.systemExecutionTimes.reduce(
        (sum, time) => sum + time,
        0,
      );
      this.metrics.averageSystemTime =
        totalTime / this.systemExecutionTimes.length;
    }

    // Update memory usage if available (browser-specific)
    if (typeof performance !== "undefined" && (performance as any).memory) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
  }
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
export async function createTypeScriptECS(
  config: ECSConfig = {},
): Promise<TypeScriptECS> {
  return new TypeScriptECS(config);
}
