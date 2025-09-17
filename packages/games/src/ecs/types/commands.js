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
export {};
