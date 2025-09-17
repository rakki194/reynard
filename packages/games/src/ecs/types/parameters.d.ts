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
import { Component, Resource } from "./core";
import { ComponentType, ResourceType } from "./storage";
import { QueryFilter } from "./query";
/**
 * System parameter types for dependency injection.
 *
 * System parameters allow systems to declare their dependencies
 * in a type-safe way, enabling automatic dependency injection
 * and parallel execution analysis.
 *
 * @since 1.0.0
 */
export interface SystemParam {
    /** Type marker to distinguish system parameters from other objects */
    readonly __systemParam: true;
}
/**
 * Query parameter for systems that need to query components.
 *
 * @template T Tuple of component types to query
 *
 * @since 1.0.0
 */
export interface QueryParam<T extends Component[]> extends SystemParam {
    /** Types of components to query for */
    readonly componentTypes: ComponentType<T[number]>[];
    /** Optional filter for the query */
    readonly filter?: QueryFilter;
}
/**
 * Resource parameter for systems that need read-only access to a resource.
 *
 * @template T The resource type
 *
 * @since 1.0.0
 */
export interface ResParam<T extends Resource> extends SystemParam {
    /** The resource type to access */
    readonly resourceType: ResourceType<T>;
}
/**
 * Mutable resource parameter for systems that need to modify a resource.
 *
 * @template T The resource type
 *
 * @since 1.0.0
 */
export interface ResMutParam<T extends Resource> extends SystemParam {
    /** The resource type to access mutably */
    readonly resourceType: ResourceType<T>;
}
/**
 * Commands parameter for systems that need to modify the world.
 *
 * @since 1.0.0
 */
export interface CommandsParam extends SystemParam {
    /** Type marker for commands parameter */
    readonly __commands: true;
}
/**
 * Local parameter for systems that need local state.
 *
 * @template T The type of local state
 *
 * @since 1.0.0
 */
export interface LocalParam<T> extends SystemParam {
    /** The local state value */
    readonly value: T;
}
/**
 * Event reader parameter for systems that need to read events.
 *
 * @template T The event data type
 *
 * @since 1.0.0
 */
export interface EventReaderParam<T = unknown> extends SystemParam {
    /** The event type to read */
    readonly eventType: string;
    /** The event data type */
    readonly eventDataType: T;
}
/**
 * Event writer parameter for systems that need to send events.
 *
 * @template T The event data type
 *
 * @since 1.0.0
 */
export interface EventWriterParam<T = unknown> extends SystemParam {
    /** The event type to write */
    readonly eventType: string;
    /** The event data type */
    readonly eventDataType: T;
}
