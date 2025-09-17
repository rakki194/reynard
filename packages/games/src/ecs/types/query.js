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
export {};
