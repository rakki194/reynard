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
export {};
