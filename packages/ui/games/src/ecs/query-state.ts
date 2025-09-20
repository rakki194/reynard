// Query state management for caching and optimization

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
export class QueryStateManager {
  private queryStates: Map<string, QueryState<any>> = new Map();
  private lastWorldUpdate: number = 0;

  /**
   * Gets or creates a query state.
   */
  getOrCreateQueryState<T extends Component[]>(
    componentTypes: ComponentType<T[number]>[],
    filter: QueryFilter
  ): QueryState<T> {
    const key = this.getQueryKey(componentTypes, filter);

    let state = this.queryStates.get(key);
    if (!state) {
      state = {
        componentTypes,
        filter,
        lastUpdate: 0,
        cachedResults: [],
        isDirty: true,
      };
      this.queryStates.set(key, state);
    }

    return state as QueryState<T>;
  }

  /**
   * Updates a query state with new results.
   */
  updateQueryState<T extends Component[]>(state: QueryState<T>, results: Entity[]): void {
    state.cachedResults.length = 0;
    state.cachedResults.push(...results);
    state.lastUpdate = Date.now();
    state.isDirty = false;
  }

  /**
   * Marks a query state as dirty.
   */
  markDirty<T extends Component[]>(state: QueryState<T>): void {
    state.isDirty = true;
  }

  /**
   * Marks all query states as dirty.
   */
  markAllDirty(): void {
    for (const state of this.queryStates.values()) {
      state.isDirty = true;
    }
    this.lastWorldUpdate = Date.now();
  }

  /**
   * Checks if a query state needs updating.
   */
  needsUpdate<T extends Component[]>(state: QueryState<T>): boolean {
    return state.isDirty || state.lastUpdate < this.lastWorldUpdate;
  }

  /**
   * Gets cached results for a query state.
   */
  getCachedResults<T extends Component[]>(state: QueryState<T>): Entity[] {
    return state.cachedResults;
  }

  /**
   * Clears all query states.
   */
  clear(): void {
    this.queryStates.clear();
    this.lastWorldUpdate = 0;
  }

  /**
   * Gets the number of cached query states.
   */
  getStateCount(): number {
    return this.queryStates.size;
  }

  /**
   * Creates a query key for caching.
   */
  private getQueryKey<T extends Component[]>(componentTypes: ComponentType<T[number]>[], filter: QueryFilter): string {
    const componentIds = componentTypes
      .map(ct => ct.id)
      .sort()
      .join(",");
    const filterKey = this.getFilterKey(filter);
    return `${componentIds}:${filterKey}`;
  }

  /**
   * Creates a filter key for caching.
   */
  private getFilterKey(filter: QueryFilter): string {
    const parts: string[] = [];

    if (filter.with) {
      parts.push(
        `with:${filter.with
          .map(ct => ct.id)
          .sort()
          .join(",")}`
      );
    }

    if (filter.without) {
      parts.push(
        `without:${filter.without
          .map(ct => ct.id)
          .sort()
          .join(",")}`
      );
    }

    if (filter.added) {
      parts.push(
        `added:${filter.added
          .map(ct => ct.id)
          .sort()
          .join(",")}`
      );
    }

    if (filter.changed) {
      parts.push(
        `changed:${filter.changed
          .map(ct => ct.id)
          .sort()
          .join(",")}`
      );
    }

    return parts.join("|");
  }
}

/**
 * Query state builder for creating optimized queries.
 */
export class QueryStateBuilder<T extends Component[]> {
  private componentTypes: ComponentType<T[number]>[] = [];
  private filter: QueryFilter = {};

  /**
   * Adds a component type to the query.
   */
  with<U extends Component>(componentType: ComponentType<U>): QueryStateBuilder<[...T, U]> {
    this.componentTypes.push(componentType as ComponentType<T[number]>);
    return this as unknown as QueryStateBuilder<[...T, U]>;
  }

  /**
   * Adds a filter to the query.
   */
  withFilter(filter: QueryFilter): this {
    this.filter = { ...this.filter, ...filter };
    return this;
  }

  /**
   * Builds the query state.
   */
  build(manager: QueryStateManager): QueryState<T> {
    return manager.getOrCreateQueryState(this.componentTypes as ComponentType<T[number]>[], this.filter);
  }
}

/**
 * Helper function to create a query state builder.
 */
export function queryState<T extends Component[] = []>(): QueryStateBuilder<T> {
  return new QueryStateBuilder<T>();
}
