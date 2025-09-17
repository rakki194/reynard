/**
 * @fileoverview System parameter types for dependency injection.
 *
 * System parameters allow systems to declare their dependencies
 * in a type-safe way, enabling automatic dependency injection
 * and parallel execution analysis.
 *
 * @example
 * ```typescript
 * function movementSystem(
 *   query: QueryParam<[Position, Velocity]>,
 *   time: ResParam<GameTime>,
 *   commands: CommandsParam
 * ): void {
 *   // System implementation
 * }
 * ```
 *
 * @performance Parameters enable automatic dependency resolution and parallel execution
 * @author Reynard ECS Team
 * @since 1.0.0
 */
export {};
