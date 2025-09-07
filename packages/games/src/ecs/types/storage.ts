/**
 * @fileoverview Storage types and strategies for component management.
 * 
 * Defines how components are stored and accessed in the ECS system.
 * Different storage strategies optimize for different access patterns.
 * 
 * @example
 * ```typescript
 * // Table storage for frequently accessed components
 * const positionType = registry.register('Position', StorageType.Table, () => new Position(0, 0));
 * 
 * // SparseSet storage for optional components
 * const powerUpType = registry.register('PowerUp', StorageType.SparseSet, () => new PowerUp());
 * ```
 * 
 * @performance Table: O(1) iteration, O(n) insertion/removal | SparseSet: O(1) insertion/removal, O(n) iteration
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { Component } from './core';

/**
 * Storage strategy for components in the ECS system.
 * 
 * Different storage strategies optimize for different access patterns.
 * Choose the right strategy based on how your components are used.
 * 
 * @example
 * ```typescript
 * // Table storage for frequently accessed components
 * const positionType = registry.register('Position', StorageType.Table, () => new Position(0, 0));
 * 
 * // SparseSet storage for optional components
 * const powerUpType = registry.register('PowerUp', StorageType.SparseSet, () => new PowerUp());
 * ```
 * 
 * @performance
 * - Table: O(1) iteration, O(n) insertion/removal
 * - SparseSet: O(1) insertion/removal, O(n) iteration
 * 
 * @since 1.0.0
 */
export enum StorageType {
  /** Dense storage optimized for iteration and frequent access */
  Table = 'table',
  /** Sparse storage optimized for insertion/removal and optional components */
  SparseSet = 'sparse'
}

/**
 * Component type metadata for runtime type checking and storage management.
 * 
 * ComponentType provides metadata about a component type, including its
 * name, unique ID, storage strategy, and factory function. This metadata
 * is used by the ECS system to manage component storage and provide
 * type-safe access.
 * 
 * @template T The component type this metadata describes
 * 
 * @example
 * ```typescript
 * const positionType: ComponentType<Position> = {
 *   name: 'Position',
 *   id: 0,
 *   storage: StorageType.Table,
 *   create: () => new Position(0, 0)
 * };
 * ```
 * 
 * @performance
 * - Component types are registered once and cached
 * - IDs enable O(1) component type lookups
 * - Storage type determines memory layout and access patterns
 * 
 * @since 1.0.0
 */
export interface ComponentType<T extends Component> {
  /** Human-readable name of the component type */
  readonly name: string;
  /** Unique numeric identifier for this component type */
  readonly id: number;
  /** Storage strategy for this component type */
  readonly storage: StorageType;
  /** Factory function to create new instances of this component */
  readonly create: () => T;
}

/**
 * Resource type metadata for runtime type checking and resource management.
 * 
 * ResourceType provides metadata about a resource type, including its
 * name, unique ID, and factory function. This metadata is used by the
 * ECS system to manage resource storage and provide type-safe access.
 * 
 * @template T The resource type this metadata describes
 * 
 * @example
 * ```typescript
 * const gameTimeType: ResourceType<GameTime> = {
 *   name: 'GameTime',
 *   id: 0,
 *   create: () => new GameTime(0, 0)
 * };
 * ```
 * 
 * @performance
 * - Resource types are registered once and cached
 * - IDs enable O(1) resource type lookups
 * - Single instance per resource type
 * 
 * @since 1.0.0
 */
export interface ResourceType<T extends Resource> {
  /** Human-readable name of the resource type */
  readonly name: string;
  /** Unique numeric identifier for this resource type */
  readonly id: number;
  /** Factory function to create new instances of this resource */
  readonly create: () => T;
}

// Re-export Resource from core for convenience
import { Resource } from './core';
