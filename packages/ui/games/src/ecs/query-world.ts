// Query operations for the ECS world

import {
  Component,
  ComponentType,
  Entity,
  QueryFilter,
  QueryResult,
} from "./types";

import { EntityManager } from "./entity";
import { ComponentStorage } from "./component";
import { ChangeDetectionImpl } from "./change-detection";
import { QueryBuilder, QueryImpl } from "./query";

/**
 * Query operations mixin for WorldImpl.
 * This provides the complex query functionality that was making world.ts too large.
 */
export class QueryWorldMixin {
  constructor(
    private entityManager: EntityManager,
    private componentStorage: ComponentStorage,
    private changeDetection: ChangeDetectionImpl
  ) {}

  /**
   * Creates a query builder with world context methods.
   */
  createQueryBuilder<T extends Component[]>(
    ...componentTypes: ComponentType<T[number]>[]
  ): QueryBuilder<T> & {
    forEach: (callback: (entity: Entity, ...components: T) => void | false) => void;
    first: () => { entity: Entity; components: T } | undefined;
    added: <U extends Component>(componentType: ComponentType<U>) => ReturnType<QueryWorldMixin['createFilteredQueryBuilder']>;
    changed: <U extends Component>(componentType: ComponentType<U>) => ReturnType<QueryWorldMixin['createFilteredQueryBuilder']>;
    removed: <U extends Component>(componentType: ComponentType<U>) => ReturnType<QueryWorldMixin['createFilteredQueryBuilder']>;
  } {
    const builder = new QueryBuilder<T>();
    for (const componentType of componentTypes) {
      builder.with(componentType);
    }

    return Object.assign(builder, {
      forEach: (callback: (entity: Entity, ...components: T) => void | false) => {
        const query = builder.build();
        const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
        result.forEach(callback);
      },
      first: () => {
        const query = builder.build();
        const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
        return result.first();
      },
      added: <U extends Component>(componentType: ComponentType<U>) => this.createFilteredQueryBuilder(builder, 'added', componentType),
      changed: <U extends Component>(componentType: ComponentType<U>) => this.createFilteredQueryBuilder(builder, 'changed', componentType),
      removed: <U extends Component>(componentType: ComponentType<U>) => this.createFilteredQueryBuilder(builder, 'removed', componentType),
    });
  }

  /**
   * Creates a filtered query builder with the specified filter type.
   */
  private createFilteredQueryBuilder<T extends Component[], U extends Component>(
    originalBuilder: QueryBuilder<T>,
    filterType: 'added' | 'changed' | 'removed',
    componentType: ComponentType<U>
  ) {
    const query = originalBuilder.build();
    const filteredQuery = query[filterType](componentType);
    
    const newBuilder = new QueryBuilder();
    newBuilder.componentTypes = [...originalBuilder.componentTypes];
    newBuilder.filters = {
      ...originalBuilder.filters,
      [filterType]: [...(originalBuilder.filters[filterType] || []), componentType],
    };

    return Object.assign(newBuilder, {
      forEach: (callback: (entity: Entity, ...components: T) => void | false) => {
        const result = filteredQuery.execute(this.entityManager, this.componentStorage, this.changeDetection);
        result.forEach(callback);
      },
      first: () => {
        const result = filteredQuery.execute(this.entityManager, this.componentStorage, this.changeDetection);
        return result.first();
      },
      with: <V extends Component>(newComponentType: ComponentType<V>) => {
        newBuilder.with(newComponentType);
        return this.createExtendedQueryBuilder(newBuilder);
      },
    });
  }

  /**
   * Creates an extended query builder with additional component types.
   */
  private createExtendedQueryBuilder<T extends Component[]>(builder: QueryBuilder<T>) {
    return Object.assign(builder, {
      forEach: (callback: (entity: Entity, ...components: T) => void | false) => {
        const query = builder.build();
        const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
        result.forEach(callback);
      },
      first: () => {
        const query = builder.build();
        const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
        return result.first();
      },
    });
  }

  /**
   * Executes a filtered query.
   */
  queryFiltered<T extends Component[]>(
    componentTypes: ComponentType<T[number]>[],
    filter: QueryFilter
  ): QueryResult<T> {
    const query = new QueryImpl(componentTypes, filter);
    return query.execute(this.entityManager, this.componentStorage, this.changeDetection);
  }
}
