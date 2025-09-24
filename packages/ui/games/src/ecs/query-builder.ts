// Query builder for constructing component queries

import { ComponentStorage } from "./component";
import { Component, ComponentType, Entity, QueryFilter, QueryResult } from "./types";
import { QueryImpl } from "./query-impl";

/**
 * Query builder for constructing component queries.
 */
export class QueryBuilder<T extends Component[]> {
  public componentTypes: ComponentType<Component>[] = [];
  public filters: QueryFilter = {};

  with<U extends Component>(componentType: ComponentType<U>): QueryBuilder<[...T, U]> {
    this.componentTypes.push(componentType as ComponentType<Component>);
    return this as unknown as QueryBuilder<[...T, U]>;
  }

  without<U extends Component>(componentType: ComponentType<U>): this {
    this.filters = {
      ...this.filters,
      without: [...(this.filters.without || []), componentType as ComponentType<Component>],
    };
    return this;
  }

  filter(filter: QueryFilter): this {
    this.filters = { ...this.filters, ...filter };
    return this;
  }

  build(): Query<T> {
    return new QueryImpl(this.componentTypes as ComponentType<T[number]>[], this.filters);
  }

  // Make QueryBuilder executable like QueryResult
  execute(
    entityManager: { getAllEntities(): Entity[] },
    componentStorage: ComponentStorage,
    changeDetection?: {
      isAdded(entity: Entity, type: ComponentType<Component>): boolean;
      isChanged(entity: Entity, type: ComponentType<Component>): boolean;
      isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    }
  ): QueryResult<T> {
    return this.build().execute(entityManager, componentStorage, changeDetection);
  }

  forEach(_callback: (entity: Entity, ...components: T) => void | false): void {
    // This will be called by the test, but we need the world context
    throw new Error("QueryBuilder.forEach() requires world context - use world.query() instead");
  }
}

export interface Query<T extends Component[]> {
  execute(
    entityManager: { getAllEntities(): Entity[] },
    componentStorage: ComponentStorage,
    changeDetection?: {
      isAdded(entity: Entity, type: ComponentType<Component>): boolean;
      isChanged(entity: Entity, type: ComponentType<Component>): boolean;
      isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    }
  ): QueryResult<T>;

  // Add change detection methods for tests
  added<U extends Component>(componentType: ComponentType<U>): Query<T>;
  changed<U extends Component>(componentType: ComponentType<U>): Query<T>;
  removed<U extends Component>(componentType: ComponentType<U>): Query<T>;
}
