/**
 * @fileoverview World interface for ECS operations.
 *
 * The World is the main interface for interacting with the ECS system. It provides
 * methods for managing entities, components, resources, systems, and queries.
 * All ECS operations go through the World, making it the single source of truth
 * for your game's state.
 *
 * @example
 * ```typescript
 * const world = createWorld();
 *
 * // Register component types
 * const positionType = world.getComponentRegistry().register('Position', StorageType.Table, () => new Position(0, 0));
 * const velocityType = world.getComponentRegistry().register('Velocity', StorageType.Table, () => new Velocity(0, 0));
 *
 * // Spawn entities
 * const player = world.spawn(new Position(100, 200), new Velocity(0, 0));
 *
 * // Add resources
 * world.insertResource(new GameTime(0.016, 0));
 *
 * // Query entities
 * const query = world.query(positionType, velocityType);
 * query.forEach((entity, position, velocity) => {
 *   position.x += velocity.x * deltaTime;
 *   position.y += velocity.y * deltaTime;
 * });
 *
 * // Run systems
 * world.addSystem(system('movement', movementSystem).build());
 * world.runSystem('movement');
 * ```
 *
 * @performance
 * - Entity operations: O(1) allocation/deallocation
 * - Component access: O(1) with generational indexing
 * - Query operations: Optimized for cache-friendly iteration
 * - Resource access: O(1) direct access
 *
 * @since 1.0.0
 */

import { QueryBuilder } from "../query";
import { Commands } from "./commands";
import { Component, Entity, Resource } from "./core";
import { QueryFilter, QueryResult } from "./query";
import { ComponentType, ResourceType } from "./storage";
import { System } from "./system";

/**
 * World interface for ECS operations - the central container for all ECS data.
 *
 * The World is the main interface for interacting with the ECS system. It provides
 * methods for managing entities, components, resources, systems, and queries.
 * All ECS operations go through the World, making it the single source of truth
 * for your game's state.
 *
 * @example
 * ```typescript
 * const world = createWorld();
 *
 * // Register component types
 * const positionType = world.getComponentRegistry().register('Position', StorageType.Table, () => new Position(0, 0));
 * const velocityType = world.getComponentRegistry().register('Velocity', StorageType.Table, () => new Velocity(0, 0));
 *
 * // Spawn entities
 * const player = world.spawn(new Position(100, 200), new Velocity(0, 0));
 *
 * // Add resources
 * world.insertResource(new GameTime(0.016, 0));
 *
 * // Query entities
 * const query = world.query(positionType, velocityType);
 * query.forEach((entity, position, velocity) => {
 *   position.x += velocity.x * deltaTime;
 *   position.y += velocity.y * deltaTime;
 * });
 *
 * // Run systems
 * world.addSystem(system('movement', movementSystem).build());
 * world.runSystem('movement');
 * ```
 *
 * @performance
 * - Entity operations: O(1) allocation/deallocation
 * - Component access: O(1) with generational indexing
 * - Query operations: Optimized for cache-friendly iteration
 * - Resource access: O(1) direct access
 *
 * @since 1.0.0
 */
export interface World {
  // Entity operations
  /**
   * Spawns a new entity with the given components.
   * @param components Components to attach to the new entity
   * @returns The newly created entity
   */
  spawn<T extends Component[]>(...components: T): Entity;

  /**
   * Spawns a new empty entity with no components.
   * @returns The newly created entity
   */
  spawnEmpty(): Entity;

  /**
   * Despawns (removes) an entity from the world.
   * @param entity The entity to despawn
   * @returns true if the entity was successfully despawned
   */
  despawn(entity: Entity): boolean;

  /**
   * Checks if an entity exists and is valid in the world.
   * @param entity The entity to check
   * @returns true if the entity exists and is valid
   */
  contains(entity: Entity): boolean;

  // Component operations
  /**
   * Inserts components into an existing entity.
   * @param entity The entity to modify
   * @param components Components to insert
   * @throws Error if the entity doesn't exist
   */
  insert<T extends Component[]>(entity: Entity, ...components: T): void;

  /**
   * Removes components from an entity.
   * @param entity The entity to modify
   * @param componentTypes Types of components to remove
   * @throws Error if the entity doesn't exist
   */
  remove<T extends Component[]>(
    entity: Entity,
    ...componentTypes: ComponentType<T[number]>[]
  ): void;

  /**
   * Gets a component from an entity (read-only access).
   * @param entity The entity to query
   * @param componentType The type of component to get
   * @returns The component if it exists, undefined otherwise
   */
  get<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): T | undefined;

  /**
   * Gets a component from an entity (mutable access).
   * @param entity The entity to query
   * @param componentType The type of component to get
   * @returns The component if it exists, undefined otherwise
   */
  getMut<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): T | undefined;

  /**
   * Checks if an entity has a specific component.
   * @param entity The entity to check
   * @param componentType The type of component to check for
   * @returns true if the entity has the component
   */
  has<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean;

  // Resource operations
  /**
   * Inserts a resource into the world.
   * @param resource The resource to insert
   * @throws Error if the resource type is not registered
   */
  insertResource<T extends Resource>(resource: T): void;

  /**
   * Removes a resource from the world.
   * @param resourceType The type of resource to remove
   * @returns The removed resource if it existed
   */
  removeResource<T extends Resource>(
    resourceType: ResourceType<T>,
  ): T | undefined;

  /**
   * Gets a resource from the world (read-only access).
   * @param resourceType The type of resource to get
   * @returns The resource if it exists, undefined otherwise
   */
  getResource<T extends Resource>(resourceType: ResourceType<T>): T | undefined;

  /**
   * Gets a resource from the world (mutable access).
   * @param resourceType The type of resource to get
   * @returns The resource if it exists, undefined otherwise
   */
  getResourceMut<T extends Resource>(
    resourceType: ResourceType<T>,
  ): T | undefined;

  /**
   * Checks if a resource exists in the world.
   * @param resourceType The type of resource to check for
   * @returns true if the resource exists
   */
  hasResource<T extends Resource>(resourceType: ResourceType<T>): boolean;

  // Query operations
  /**
   * Queries entities that have all the specified components.
   * @param componentTypes Types of components to query for
   * @returns QueryBuilder with additional query methods
   */
  query<T extends Component[]>(
    ...componentTypes: ComponentType<T[number]>[]
  ): QueryBuilder<T> & {
    forEach: (
      callback: (entity: Entity, ...components: T) => void | false,
    ) => void;
    first: () => { entity: Entity; components: T } | undefined;
    added: (componentType: ComponentType<any>) => any;
    changed: (componentType: ComponentType<any>) => any;
    removed: (componentType: ComponentType<any>) => any;
  };

  /**
   * Queries entities with additional filtering options.
   * @param componentTypes Types of components to query for
   * @param filter Additional filtering criteria
   * @returns QueryResult containing matching entities and their components
   */
  queryFiltered<T extends Component[]>(
    componentTypes: ComponentType<T[number]>[],
    filter: QueryFilter,
  ): QueryResult<T>;

  // System operations
  /**
   * Adds a system to the world.
   * @param system The system to add
   */
  addSystem(system: System): void;

  /**
   * Removes a system from the world.
   * @param systemName The name of the system to remove
   */
  removeSystem(systemName: string): void;

  /**
   * Runs a specific system by name.
   * @param systemName The name of the system to run
   * @throws Error if the system doesn't exist
   */
  runSystem(systemName: string): void;

  /**
   * Runs a schedule (collection of systems) by name.
   * @param scheduleName The name of the schedule to run
   * @throws Error if the schedule doesn't exist
   */
  runSchedule(scheduleName: string): void;

  // Commands
  /**
   * Gets a Commands instance for deferred world modifications.
   * @returns Commands instance for queuing operations
   */
  commands(): Commands;

  // Statistics
  /**
   * Gets the total number of entities in the world.
   * @returns Number of active entities
   */
  getEntityCount(): number;

  /**
   * Gets the number of entities with a specific component type.
   * @param componentType The component type to count
   * @returns Number of entities with this component
   */
  getComponentCount<T extends Component>(
    componentType: ComponentType<T>,
  ): number;

  /**
   * Gets the component registry for registering component types.
   * @returns ComponentRegistry instance
   */
  getComponentRegistry(): any; // Will be properly typed later

  /**
   * Gets the resource registry for registering resource types.
   * @returns ResourceRegistry instance
   */
  getResourceRegistry(): any; // Will be properly typed later
}
