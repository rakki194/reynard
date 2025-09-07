/**
 * @fileoverview Bundle types for grouping related components.
 * 
 * Bundles allow you to group multiple components that are commonly
 * used together, making entity creation more convenient and ensuring
 * consistency.
 * 
 * @example
 * ```typescript
 * class PlayerBundle implements Bundle {
 *   readonly __bundle = true;
 *   readonly components = [
 *     new Position(0, 0),
 *     new Velocity(0, 0),
 *     new Health(100, 100),
 *     new Player('Player1')
 *   ];
 * }
 * 
 * const player = world.spawnBundle(new PlayerBundle());
 * ```
 * 
 * @performance Bundles enable efficient bulk component operations
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { Component } from './core';

/**
 * Bundle for grouping related components together.
 * 
 * Bundles allow you to group multiple components that are commonly
 * used together, making entity creation more convenient and ensuring
 * consistency.
 * 
 * @example
 * ```typescript
 * class PlayerBundle implements Bundle {
 *   readonly __bundle = true;
 *   readonly components = [
 *     new Position(0, 0),
 *     new Velocity(0, 0),
 *     new Health(100, 100),
 *     new Player('Player1')
 *   ];
 * }
 * 
 * const player = world.spawnBundle(new PlayerBundle());
 * ```
 * 
 * @since 1.0.0
 */
export interface Bundle {
  /** Type marker to distinguish bundles from other objects */
  readonly __bundle: true;
  /** Array of components in this bundle */
  readonly components: Component[];
}
