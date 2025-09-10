/**
 * @fileoverview Unified ECS Interface for WASM SIMD and TypeScript implementations.
 *
 * This interface provides a common API that both WASM SIMD and TypeScript ECS
 * implementations must follow, enabling seamless switching between implementations
 * based on availability and performance requirements.
 *
 * @example
 * ```typescript
 * import { createECSSystem } from './ecs-factory';
 *
 * const ecs = await createECSSystem();
 * // Automatically uses WASM SIMD if available, falls back to TypeScript
 *
 * const entity = ecs.spawn(new Position(0, 0), new Velocity(1, 1));
 * ecs.runSystems();
 * ```
 *
 * @performance
 * - WASM SIMD: 4.2x speedup for position updates
 * - TypeScript: Full compatibility, no performance penalty for fallback
 * - Automatic detection and switching
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { Component, Entity, Resource, World } from "../types";
import { ComponentType } from "../types/storage";

/**
 * Performance metrics for ECS operations.
 */
export interface ECSPerformanceMetrics {
  /** Total entities in the world */
  entityCount: number;
  /** Total components across all entities */
  componentCount: number;
  /** Average time per system execution (ms) */
  averageSystemTime: number;
  /** Total memory usage (bytes) */
  memoryUsage: number;
  /** Performance mode currently active */
  performanceMode: "wasm-simd" | "typescript" | "hybrid";
}

/**
 * Configuration options for ECS system creation.
 */
export interface ECSConfig {
  /** Maximum number of entities to support */
  maxEntities?: number;
  /** Enable WASM SIMD acceleration if available */
  enableWASM?: boolean;
  /** Enable performance monitoring */
  enableMetrics?: boolean;
  /** Preferred performance mode */
  preferredMode?: "wasm-simd" | "typescript" | "auto";
  /** Fallback behavior when WASM fails */
  fallbackBehavior?: "silent" | "warn" | "error";
}

/**
 * Unified ECS interface that abstracts implementation details.
 *
 * This interface provides a common API for both WASM SIMD and TypeScript
 * implementations, allowing seamless switching based on availability.
 */
export interface UnifiedECS {
  /** The underlying world instance */
  readonly world: World;

  /** Performance metrics for the current session */
  readonly metrics: ECSPerformanceMetrics;

  /** Whether WASM SIMD acceleration is currently active */
  readonly isWASMActive: boolean;

  /** The current performance mode */
  readonly performanceMode: "wasm-simd" | "typescript" | "hybrid";

  /**
   * Spawn a new entity with the given components.
   *
   * @param components - Components to attach to the new entity
   * @returns The newly created entity
   *
   * @example
   * ```typescript
   * const entity = ecs.spawn(
   *   new Position(0, 0),
   *   new Velocity(1, 1),
   *   new Health(100)
   * );
   * ```
   */
  spawn<T extends Component[]>(...components: T): Entity;

  /**
   * Spawn an empty entity.
   *
   * @returns The newly created empty entity
   */
  spawnEmpty(): Entity;

  /**
   * Despawn an entity and all its components.
   *
   * @param entity - The entity to despawn
   */
  despawn(entity: Entity): void;

  /**
   * Insert components into an existing entity.
   *
   * @param entity - The entity to modify
   * @param components - Components to insert
   */
  insert<T extends Component[]>(entity: Entity, ...components: T): void;

  /**
   * Remove components from an entity.
   *
   * @param entity - The entity to modify
   * @param componentTypes - Types of components to remove
   */
  remove(entity: Entity, ...componentTypes: ComponentType<Component>[]): void;

  /**
   * Query entities with specific component combinations.
   *
   * @param componentTypes - Types of components to query for
   * @returns Query result with matching entities
   *
   * @example
   * ```typescript
   * const query = ecs.query(Position, Velocity);
   * for (const [entity, pos, vel] of query) {
   *   pos.x += vel.x * deltaTime;
   *   pos.y += vel.y * deltaTime;
   * }
   * ```
   */
  query<T extends Component[]>(
    ...componentTypes: ComponentType<Component>[]
  ): IterableIterator<[Entity, ...T]>;

  /**
   * Add a resource to the world.
   *
   * @param resource - The resource to add
   *
   * @example
   * ```typescript
   * ecs.addResource(new GameTime(0.016, 1000));
   * ```
   */
  addResource<T extends Resource>(resource: T): void;

  /**
   * Get a resource from the world.
   *
   * @param resourceType - The type of resource to get
   * @returns The resource instance
   *
   * @example
   * ```typescript
   * const gameTime = ecs.getResource(GameTime);
   * console.log(gameTime.deltaTime);
   * ```
   */
  getResource<T extends Resource>(resourceType: any): T | undefined;

  /**
   * Register a system function.
   *
   * @param system - The system function to register
   * @param name - Optional name for the system
   *
   * @example
   * ```typescript
   * ecs.addSystem((world) => {
   *   const query = world.query(Position, Velocity);
   *   for (const [entity, pos, vel] of query) {
   *     pos.x += vel.x * deltaTime;
   *     pos.y += vel.y * deltaTime;
   *   }
   * }, 'movement');
   * ```
   */
  addSystem(system: (world: World) => void, name?: string): void;

  /**
   * Run all registered systems.
   *
   * @param deltaTime - Time elapsed since last frame
   *
   * @example
   * ```typescript
   * function gameLoop(deltaTime: number) {
   *   ecs.addResource(new GameTime(deltaTime, performance.now()));
   *   ecs.runSystems(deltaTime);
   * }
   * ```
   */
  runSystems(deltaTime?: number): void;

  /**
   * Clear all entities and resources from the world.
   */
  clear(): void;

  /**
   * Get performance metrics for the current session.
   *
   * @returns Current performance metrics
   */
  getMetrics(): ECSPerformanceMetrics;

  /**
   * Force switch to a specific performance mode.
   *
   * @param mode - The performance mode to switch to
   * @returns Whether the switch was successful
   *
   * @example
   * ```typescript
   * // Force TypeScript mode (useful for debugging)
   * ecs.setPerformanceMode('typescript');
   *
   * // Try to enable WASM SIMD
   * const success = ecs.setPerformanceMode('wasm-simd');
   * if (!success) {
   *   console.log('WASM SIMD not available, using TypeScript fallback');
   * }
   * ```
   */
  setPerformanceMode(mode: "wasm-simd" | "typescript" | "auto"): boolean;

  /**
   * Dispose of the ECS system and clean up resources.
   */
  dispose(): void;
}

/**
 * WASM SIMD specific capabilities.
 */
export interface WASMSIMDCapabilities {
  /** Whether WASM SIMD is supported by the browser */
  readonly isSupported: boolean;
  /** Whether the WASM module is loaded and ready */
  readonly isLoaded: boolean;
  /** Available SIMD operations */
  readonly availableOperations: string[];
  /** Performance characteristics */
  readonly performanceProfile: {
    positionUpdateSpeedup: number;
    collisionDetectionSpeedup: number;
    spatialQuerySpeedup: number;
  };
}

/**
 * ECS system factory function type.
 */
export type ECSFactoryFunction = (config?: ECSConfig) => Promise<UnifiedECS>;

/**
 * WASM SIMD detection and capability checking.
 */
export interface WASMDetector {
  /** Check if WASM SIMD is supported */
  isWASMSupported(): boolean;

  /** Check if WASM SIMD is available and ready */
  isWASMAvailable(): Promise<boolean>;

  /** Get WASM SIMD capabilities */
  getCapabilities(): Promise<WASMSIMDCapabilities>;

  /** Load WASM SIMD module */
  loadWASMModule(): Promise<boolean>;
}
