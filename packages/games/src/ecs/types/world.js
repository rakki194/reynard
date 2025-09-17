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
export {};
