/**
 * @fileoverview Query types for component access and filtering.
 * 
 * Defines how to query entities and their components with type-safe
 * filtering and iteration capabilities.
 * 
 * @example
 * ```typescript
 * const query = world.query(Position, Velocity);
 * query.forEach((entity, position, velocity) => {
 *   position.x += velocity.x * deltaTime;
 *   position.y += velocity.y * deltaTime;
 * });
 * 
 * const filteredQuery = world.queryFiltered(
 *   [Position, Velocity],
 *   { without: [Health], changed: [Velocity] }
 * );
 * ```
 * 
 * @performance Iteration is cache-friendly and sequential, optimized for bulk operations
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { Entity, Component } from './core';
import { ComponentType } from './storage';

/**
 * Query filter types for component access patterns.
 * 
 * Query filters allow you to specify which entities should be included
 * or excluded from query results based on their component composition
 * and change status.
 * 
 * @example
 * ```typescript
 * // Find entities with Position and Velocity, but without Health
 * const query = world.queryFiltered(
 *   [Position, Velocity],
 *   {
 *     with: [Position, Velocity],
 *     without: [Health],
 *     added: [Position], // Only entities that had Position added this frame
 *     changed: [Velocity] // Only entities with Velocity changed this frame
 *   }
 * );
 * ```
 * 
 * @performance
 * - Filters are applied during query execution
 * - Change detection filters require additional tracking
 * - Multiple filters are combined with AND logic
 * 
 * @since 1.0.0
 */
export interface QueryFilter {
  /** Entities must have ALL of these components */
  readonly with?: ComponentType<Component>[];
  /** Entities must NOT have ANY of these components */
  readonly without?: ComponentType<Component>[];
  /** Entities that had these components added this frame */
  readonly added?: ComponentType<Component>[];
  /** Entities that had these components changed this frame */
  readonly changed?: ComponentType<Component>[];
}

/**
 * Query result iterator for component access with type-safe iteration methods.
 * 
 * QueryResult provides a type-safe way to iterate over entities and their
 * components. It includes common array-like methods optimized for ECS
 * operations and maintains type safety throughout the iteration.
 * 
 * @template T Tuple of component types returned by the query
 * 
 * @example
 * ```typescript
 * const query = world.query(Position, Velocity);
 * 
 * // Iterate over all entities with Position and Velocity
 * query.forEach((entity, position, velocity) => {
 *   position.x += velocity.x * deltaTime;
 *   position.y += velocity.y * deltaTime;
 * });
 * 
 * // Map to new values
 * const positions = query.map((entity, position, velocity) => ({
 *   entity,
 *   speed: Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
 * }));
 * 
 * // Filter results
 * const fastEntities = query.filter((entity, position, velocity) => {
 *   const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
 *   return speed > 100;
 * });
 * ```
 * 
 * @performance
 * - Iteration is cache-friendly and sequential
 * - No virtual function calls during iteration
 * - Optimized for bulk operations
 * 
 * @since 1.0.0
 */
export interface QueryResult<T extends Component[]> {
  /** Array of entities in this query result */
  readonly entities: Entity[];
  /** Array of component tuples corresponding to each entity */
  readonly components: T;
  /** Number of entities in this query result */
  readonly length: number;
  
  /**
   * Iterates over all entities and their components, calling the callback for each.
   * @param callback Function called for each entity with its components
   */
  forEach(callback: (entity: Entity, ...components: T) => void): void;
  
  /**
   * Maps each entity and its components to a new value.
   * @param callback Function that transforms entity and components to a new value
   * @returns Array of transformed values
   */
  map<U>(callback: (entity: Entity, ...components: T) => U): U[];
  
  /**
   * Filters entities based on a predicate function.
   * @param predicate Function that determines if an entity should be included
   * @returns New QueryResult containing only matching entities
   */
  filter(predicate: (entity: Entity, ...components: T) => boolean): QueryResult<T>;
}
