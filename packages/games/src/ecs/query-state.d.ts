import { Component, ComponentType, Entity, QueryFilter } from "./types";
/**
 * Query state for caching query results and optimizing performance.
 */
export interface QueryState<T extends Component[]> {
    readonly componentTypes: ComponentType<T[number]>[];
    readonly filter: QueryFilter;
    lastUpdate: number;
    readonly cachedResults: Entity[];
    isDirty: boolean;
}
/**
 * Query state manager for caching and optimization.
 */
export declare class QueryStateManager {
    private queryStates;
    private lastWorldUpdate;
    /**
     * Gets or creates a query state.
     */
    getOrCreateQueryState<T extends Component[]>(componentTypes: ComponentType<T[number]>[], filter: QueryFilter): QueryState<T>;
    /**
     * Updates a query state with new results.
     */
    updateQueryState<T extends Component[]>(state: QueryState<T>, results: Entity[]): void;
    /**
     * Marks a query state as dirty.
     */
    markDirty<T extends Component[]>(state: QueryState<T>): void;
    /**
     * Marks all query states as dirty.
     */
    markAllDirty(): void;
    /**
     * Checks if a query state needs updating.
     */
    needsUpdate<T extends Component[]>(state: QueryState<T>): boolean;
    /**
     * Gets cached results for a query state.
     */
    getCachedResults<T extends Component[]>(state: QueryState<T>): Entity[];
    /**
     * Clears all query states.
     */
    clear(): void;
    /**
     * Gets the number of cached query states.
     */
    getStateCount(): number;
    /**
     * Creates a query key for caching.
     */
    private getQueryKey;
    /**
     * Creates a filter key for caching.
     */
    private getFilterKey;
}
/**
 * Query state builder for creating optimized queries.
 */
export declare class QueryStateBuilder<T extends Component[]> {
    private componentTypes;
    private filter;
    /**
     * Adds a component type to the query.
     */
    with<U extends Component>(componentType: ComponentType<U>): QueryStateBuilder<[...T, U]>;
    /**
     * Adds a filter to the query.
     */
    withFilter(filter: QueryFilter): this;
    /**
     * Builds the query state.
     */
    build(manager: QueryStateManager): QueryState<T>;
}
/**
 * Helper function to create a query state builder.
 */
export declare function queryState<T extends Component[] = []>(): QueryStateBuilder<T>;
