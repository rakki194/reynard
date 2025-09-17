/**
 * @fileoverview System types for behavior and execution management.
 *
 * Defines how systems are structured, executed, and scheduled in the ECS.
 * Systems contain all game logic and operate on components and resources.
 *
 * @example
 * ```typescript
 * const movementSystem: SystemFunction = (world) => {
 *   const query = world.query(Position, Velocity);
 *   const gameTime = world.getResource(GameTime);
 *
 *   if (!gameTime) return;
 *
 *   query.forEach((entity, position, velocity) => {
 *     position.x += velocity.x * gameTime.deltaTime;
 *     position.y += velocity.y * gameTime.deltaTime;
 *   });
 * };
 *
 * const system = system('movement', movementSystem)
 *   .after('input')
 *   .runIf(Conditions.everyNFrames(1));
 * ```
 *
 * @performance Systems are cached and reused, dependencies enable parallel execution
 * @author Reynard ECS Team
 * @since 1.0.0
 */
export {};
