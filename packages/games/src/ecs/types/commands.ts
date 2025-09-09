/**
 * @fileoverview Commands types for deferred world modifications.
 *
 * Commands allow systems to queue world modifications that will be applied
 * at the end of the system execution phase, preventing conflicts during
 * parallel system execution.
 *
 * @example
 * ```typescript
 * function spawnBulletSystem(world: World): void {
 *   const commands = world.commands();
 *
 *   // These operations are deferred until the end of the system
 *   const bullet = commands.spawn(
 *     new Position(100, 100),
 *     new Velocity(0, -300),
 *     new Bullet(300)
 *   );
 *
 *   // Commands are automatically applied when the system completes
 * }
 * ```
 *
 * @performance Commands are batched and applied efficiently, prevents conflicts during parallel execution
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { Entity, Component, Resource } from "./core";
import { ComponentType, ResourceType } from "./storage";

/**
 * Commands for deferred world modifications during system execution.
 *
 * Commands allow systems to queue world modifications that will be applied
 * at the end of the system execution phase. This prevents conflicts during
 * parallel system execution and ensures consistent world state.
 *
 * @example
 * ```typescript
 * function spawnBulletSystem(world: World): void {
 *   const commands = world.commands();
 *
 *   // These operations are deferred until the end of the system
 *   const bullet = commands.spawn(
 *     new Position(100, 100),
 *     new Velocity(0, -300),
 *     new Bullet(300)
 *   );
 *
 *   // Commands are automatically applied when the system completes
 * }
 * ```
 *
 * @performance
 * - Commands are batched and applied efficiently
 * - Prevents conflicts during parallel system execution
 * - Reduces world locking and contention
 *
 * @since 1.0.0
 */
export interface Commands {
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
   * Marks an entity for despawning (removal from the world).
   * @param entity The entity to despawn
   */
  despawn(entity: Entity): void;

  /**
   * Inserts components into an existing entity.
   * @param entity The entity to modify
   * @param components Components to insert
   */
  insert<T extends Component[]>(entity: Entity, ...components: T): void;

  /**
   * Removes components from an entity.
   * @param entity The entity to modify
   * @param componentTypes Types of components to remove
   */
  remove<T extends Component[]>(
    entity: Entity,
    ...componentTypes: ComponentType<T[number]>[]
  ): void;

  /**
   * Inserts a resource into the world.
   * @param resource The resource to insert
   */
  insertResource<T extends Resource>(resource: T): void;

  /**
   * Removes a resource from the world.
   * @param resourceType The type of resource to remove
   */
  removeResource<T extends Resource>(resourceType: ResourceType<T>): void;
}
