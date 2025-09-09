/**
 * @fileoverview Change detection types for tracking component modifications.
 *
 * Change detection allows systems to react to component changes, additions,
 * and removals. This is essential for systems that need to respond to
 * specific events or maintain derived state.
 *
 * @example
 * ```typescript
 * const changeDetection = world.getChangeDetection();
 *
 * // Check if a component was added this frame
 * if (changeDetection.isAdded(entity, positionType)) {
 *   console.log('Position component was added to entity');
 * }
 *
 * // Check if a component was changed this frame
 * if (changeDetection.isChanged(entity, velocityType)) {
 *   console.log('Velocity component was modified');
 * }
 *
 * // Query for entities with changed components
 * const changedQuery = world.queryFiltered(
 *   [Position, Velocity],
 *   { changed: [Velocity] }
 * );
 * ```
 *
 * @performance Change tracking adds minimal overhead, tick-based system for efficient change detection
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { Entity, Component } from "./core";
import { ComponentType } from "./storage";

/**
 * Change detection for tracking component modifications over time.
 *
 * Change detection allows systems to react to component changes, additions,
 * and removals. This is essential for systems that need to respond to
 * specific events or maintain derived state.
 *
 * @example
 * ```typescript
 * const changeDetection = world.getChangeDetection();
 *
 * // Check if a component was added this frame
 * if (changeDetection.isAdded(entity, positionType)) {
 *   console.log('Position component was added to entity');
 * }
 *
 * // Check if a component was changed this frame
 * if (changeDetection.isChanged(entity, velocityType)) {
 *   console.log('Velocity component was modified');
 * }
 *
 * // Query for entities with changed components
 * const changedQuery = world.queryFiltered(
 *   [Position, Velocity],
 *   { changed: [Velocity] }
 * );
 * ```
 *
 * @performance
 * - Change tracking adds minimal overhead
 * - Tick-based system for efficient change detection
 * - Automatic cleanup of old change data
 *
 * @since 1.0.0
 */
export interface ChangeDetection {
  /**
   * Checks if a component was added to an entity this frame.
   * @param entity The entity to check
   * @param componentType The component type to check for
   * @returns true if the component was added this frame
   */
  isAdded<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean;

  /**
   * Checks if a component was changed on an entity this frame.
   * @param entity The entity to check
   * @param componentType The component type to check for
   * @returns true if the component was changed this frame
   */
  isChanged<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean;

  /**
   * Checks if a component was removed from an entity this frame.
   * @param entity The entity to check
   * @param componentType The component type to check for
   * @returns true if the component was removed this frame
   */
  isRemoved<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean;

  /**
   * Clears all change detection data.
   */
  clear(): void;
}
