/**
 * @fileoverview Core ECS types - Entity, Component, and Resource interfaces.
 *
 * These are the fundamental building blocks of the ECS architecture.
 *
 * @example
 * ```typescript
 * class Position implements Component {
 *   readonly __component = true;
 *   constructor(public x: number, public y: number) {}
 * }
 *
 * class GameTime implements Resource {
 *   readonly __resource = true;
 *   constructor(public deltaTime: number, public totalTime: number) {}
 * }
 * ```
 *
 * @performance Entity operations: O(1), Component access: O(1)
 * @author Reynard ECS Team
 * @since 1.0.0
 */
export {};
