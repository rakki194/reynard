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

/**
 * A lightweight identifier for entities with generational indexing.
 *
 * Entities are the primary way to reference and group components in the ECS.
 * They use generational indexing to prevent use-after-free bugs when entity
 * IDs are reused. Each entity has both an index (for storage) and a generation
 * (for validation).
 *
 * @example
 * ```typescript
 * const entity = createEntity(0, 1);
 * console.log(entity.index);     // 0
 * console.log(entity.generation); // 1
 * console.log(entityToString(entity)); // "0v1"
 * ```
 *
 * @performance
 * - Size: 8 bytes (2 × 32-bit integers)
 * - Comparison: O(1) with generational validation
 * - Hash: O(1) with efficient hashing
 *
 * @since 1.0.0
 */
export interface Entity {
  /** The storage index of this entity (0-based) */
  readonly index: number;
  /** The generation of this entity (prevents use-after-free) */
  readonly generation: number;
}

/**
 * Base interface for all components in the ECS system.
 *
 * Components are pure data containers that can be attached to entities.
 * They contain no behavior - only data. All game state is represented
 * through components, enabling data-driven design and high performance.
 *
 * @example
 * ```typescript
 * class Position implements Component {
 *   readonly __component = true;
 *   constructor(public x: number, public y: number) {}
 * }
 *
 * class Velocity implements Component {
 *   readonly __component = true;
 *   constructor(public x: number, public y: number) {}
 * }
 *
 * class Health implements Component {
 *   readonly __component = true;
 *   constructor(public current: number, public maximum: number) {}
 * }
 * ```
 *
 * @performance
 * - Components are stored in contiguous arrays for cache efficiency
 * - No virtual function calls or inheritance overhead
 * - Optimized for bulk operations and parallel processing
 *
 * @since 1.0.0
 */
export interface Component {
  /** Type marker to distinguish components from other objects */
  readonly __component: true;
}

/**
 * Base interface for all resources in the ECS system.
 *
 * Resources are global singleton data accessible to all systems.
 * Unlike components, there is only one instance of each resource type
 * in the world. Resources are perfect for global state like time,
 * configuration, or shared services.
 *
 * @example
 * ```typescript
 * class GameTime implements Resource {
 *   readonly __resource = true;
 *   constructor(public deltaTime: number, public totalTime: number) {}
 * }
 *
 * class GameConfig implements Resource {
 *   readonly __resource = true;
 *   constructor(public width: number, public height: number) {}
 * }
 *
 * class InputState implements Resource {
 *   readonly __resource = true;
 *   public keys = new Set<string>();
 *   public mousePosition = { x: 0, y: 0 };
 * }
 * ```
 *
 * @performance
 * - Single instance per resource type
 * - Direct access without iteration
 * - Perfect for global state and configuration
 *
 * @since 1.0.0
 */
export interface Resource {
  /** Type marker to distinguish resources from other objects */
  readonly __resource: true;
}
