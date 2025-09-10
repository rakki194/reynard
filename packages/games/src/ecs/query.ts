// Query system implementation for component access

import { ComponentStorage } from "./component";
import {
  Component,
  ComponentType,
  Entity,
  QueryFilter,
  QueryResult,
} from "./types";

/**
 * Helper type to extract component types from ComponentType array.
 * This maps ComponentType<T>[] to T[] for proper type inference.
 */
export type ExtractComponentTypes<T extends ComponentType<Component>[]> = {
  [K in keyof T]: T[K] extends ComponentType<infer U> ? U : never;
};

/**
 * Query result implementation.
 */
export class QueryResultImpl<T extends Component[]> implements QueryResult<T> {
  constructor(
    public readonly entities: Entity[],
    public readonly components: T,
    public readonly length: number,
    private readonly componentTypes: ComponentType<Component>[] = [],
    private readonly entityComponents: Map<number, Component[]> = new Map(),
  ) { }

  forEach(callback: (entity: Entity, ...components: T) => void | false): void {
    for (let i = 0; i < this.length; i++) {
      const entity = this.entities[i];
      const componentValues = this.getComponentValuesForEntity(i) as T;
      const result = callback(entity, ...componentValues);
      if (result === false) {
        break; // Early termination
      }
    }
  }

  map<U>(callback: (entity: Entity, ...components: T) => U): U[] {
    const results: U[] = [];
    for (let i = 0; i < this.length; i++) {
      const entity = this.entities[i];
      const componentValues = this.getComponentValuesForEntity(i) as T;
      results.push(callback(entity, ...componentValues));
    }
    return results;
  }

  filter(
    predicate: (entity: Entity, ...components: T) => boolean,
  ): QueryResult<T> {
    const filteredEntities: Entity[] = [];
    const filteredEntityComponents = new Map<number, Component[]>();

    for (let i = 0; i < this.length; i++) {
      const entity = this.entities[i];
      const componentValues = this.getComponentValuesForEntity(i) as T;

      if (predicate(entity, ...componentValues)) {
        filteredEntities.push(entity);
        filteredEntityComponents.set(entity.index, componentValues);
      }
    }

    // Create a flat array of all components for backward compatibility
    const allComponents: Component[] = [];
    for (const components of filteredEntityComponents.values()) {
      allComponents.push(...components);
    }

    return new QueryResultImpl(
      filteredEntities,
      allComponents as T,
      filteredEntities.length,
      this.componentTypes,
      filteredEntityComponents,
    );
  }

  first(): { entity: Entity; components: T } | undefined {
    if (this.length === 0) {
      return undefined;
    }

    const entity = this.entities[0];
    const components = this.getComponentValuesForEntity(0) as T;
    return { entity, components };
  }

  private getComponentValuesForEntity(entityIndex: number): Component[] {
    const entity = this.entities[entityIndex];
    const components = this.entityComponents.get(entity.index);
    if (!components) {
      throw new Error(`No components found for entity ${entity.index}`);
    }
    return components;
  }

}

/**
 * Query builder for constructing component queries.
 */
export class QueryBuilder<T extends Component[]> {
  public componentTypes: ComponentType<Component>[] = [];
  public filters: QueryFilter = {};

  with<U extends Component>(
    componentType: ComponentType<U>,
  ): QueryBuilder<[...T, U]> {
    this.componentTypes.push(componentType as ComponentType<Component>);
    return this as unknown as QueryBuilder<[...T, U]>;
  }

  without<U extends Component>(
    componentType: ComponentType<U>,
  ): this {
    this.filters = {
      ...this.filters,
      without: [...(this.filters.without || []), componentType as ComponentType<Component>]
    };
    return this;
  }

  filter(filter: QueryFilter): this {
    this.filters = { ...this.filters, ...filter };
    return this;
  }

  build(): Query<T> {
    return new QueryImpl(
      this.componentTypes as ComponentType<T[number]>[],
      this.filters,
    );
  }

  // Make QueryBuilder executable like QueryResult
  execute(
    entityManager: { getAllEntities(): Entity[] },
    componentStorage: ComponentStorage,
    changeDetection?: {
      isAdded(entity: Entity, type: ComponentType<Component>): boolean;
      isChanged(entity: Entity, type: ComponentType<Component>): boolean;
      isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    },
  ): QueryResult<T> {
    return this.build().execute(entityManager, componentStorage, changeDetection);
  }

  forEach(_callback: (entity: Entity, ...components: T) => void | false): void {
    // This will be called by the test, but we need the world context
    throw new Error("QueryBuilder.forEach() requires world context - use world.query() instead");
  }
}

/**
 * Query implementation.
 */
export class QueryImpl<T extends Component[]> {
  constructor(
    private componentTypes: ComponentType<T[number]>[],
    private filters: QueryFilter,
  ) { }

  // Add change detection methods for tests
  added<U extends Component>(componentType: ComponentType<U>): Query<T> {
    const newFilters = { ...this.filters, added: [...(this.filters.added || []), componentType] };
    return new QueryImpl(this.componentTypes, newFilters);
  }

  changed<U extends Component>(componentType: ComponentType<U>): Query<T> {
    const newFilters = { ...this.filters, changed: [...(this.filters.changed || []), componentType] };
    return new QueryImpl(this.componentTypes, newFilters);
  }

  removed<U extends Component>(componentType: ComponentType<U>): Query<T> {
    const newFilters = { ...this.filters, removed: [...(this.filters.removed || []), componentType] };
    return new QueryImpl(this.componentTypes, newFilters);
  }

  execute(
    entityManager: { getAllEntities(): Entity[] },
    componentStorage: ComponentStorage,
    changeDetection?: {
      isAdded(entity: Entity, type: ComponentType<Component>): boolean;
      isChanged(entity: Entity, type: ComponentType<Component>): boolean;
      isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    },
  ): QueryResult<T> {
    const matchingEntities: Entity[] = [];
    const entityComponents = new Map<number, Component[]>();
    const allEntities = entityManager.getAllEntities();

    for (const entity of allEntities) {
      if (
        this.hasAllComponents(entity, componentStorage) &&
        this.passesFilters(entity, componentStorage, changeDetection)
      ) {
        matchingEntities.push(entity);
        const components = this.getEntityComponents(entity, componentStorage);
        entityComponents.set(entity.index, components);
      }
    }

    // Create a flat array of all components for backward compatibility
    const allComponents: Component[] = [];
    for (const components of entityComponents.values()) {
      allComponents.push(...components);
    }

    return new QueryResultImpl(
      matchingEntities,
      allComponents as T,
      matchingEntities.length,
      this.componentTypes,
      entityComponents,
    );
  }

  private hasAllComponents(entity: Entity, storage: ComponentStorage): boolean {
    return this.componentTypes.every((type) => {
      const tableStorage = storage.getTableStorage(type);
      const sparseStorage = storage.getSparseSetStorage(type);
      return (
        (tableStorage?.has(entity.index) || sparseStorage?.has(entity.index)) ??
        false
      );
    });
  }

  private getEntityComponents(
    entity: Entity,
    storage: ComponentStorage,
  ): Component[] {
    return this.componentTypes.map((type) => {
      const tableStorage = storage.getTableStorage(type);
      const sparseStorage = storage.getSparseSetStorage(type);
      return (tableStorage?.get(entity.index) ||
        sparseStorage?.get(entity.index)) as Component;
    });
  }

  private passesFilters(
    entity: Entity,
    storage: ComponentStorage,
    changeDetection?: {
      isAdded(entity: Entity, type: ComponentType<Component>): boolean;
      isChanged(entity: Entity, type: ComponentType<Component>): boolean;
      isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    },
  ): boolean {
    if (this.filters.with && !this.checkWithFilter(entity, storage))
      return false;
    if (this.filters.without && this.checkWithoutFilter(entity, storage))
      return false;
    if (
      this.filters.added &&
      changeDetection &&
      !this.checkAddedFilter(entity, changeDetection)
    )
      return false;
    if (
      this.filters.changed &&
      changeDetection &&
      !this.checkChangedFilter(entity, changeDetection)
    )
      return false;
    if (
      this.filters.removed &&
      changeDetection &&
      !this.checkRemovedFilter(entity, changeDetection)
    )
      return false;
    return true;
  }

  private checkWithFilter(entity: Entity, storage: ComponentStorage): boolean {
    return this.filters.with!.every((type) => {
      const tableStorage = storage.getTableStorage(type);
      const sparseStorage = storage.getSparseSetStorage(type);
      return (
        (tableStorage?.has(entity.index) || sparseStorage?.has(entity.index)) ??
        false
      );
    });
  }

  private checkWithoutFilter(
    entity: Entity,
    storage: ComponentStorage,
  ): boolean {
    return this.filters.without!.some((type) => {
      const tableStorage = storage.getTableStorage(type);
      const sparseStorage = storage.getSparseSetStorage(type);
      return (
        (tableStorage?.has(entity.index) || sparseStorage?.has(entity.index)) ??
        false
      );
    });
  }

  private checkAddedFilter(
    entity: Entity,
    changeDetection: {
      isAdded(entity: Entity, type: ComponentType<Component>): boolean;
    },
  ): boolean {
    return this.filters.added!.every((type) =>
      changeDetection.isAdded(entity, type),
    );
  }

  private checkChangedFilter(
    entity: Entity,
    changeDetection: {
      isChanged(entity: Entity, type: ComponentType<Component>): boolean;
    },
  ): boolean {
    return this.filters.changed!.every((type) =>
      changeDetection.isChanged(entity, type),
    );
  }

  private checkRemovedFilter(
    entity: Entity,
    changeDetection: {
      isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    },
  ): boolean {
    return this.filters.removed!.every((type) =>
      changeDetection.isRemoved(entity, type),
    );
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
    },
  ): QueryResult<T>;

  // Add change detection methods for tests
  added<U extends Component>(componentType: ComponentType<U>): Query<T>;
  changed<U extends Component>(componentType: ComponentType<U>): Query<T>;
  removed<U extends Component>(componentType: ComponentType<U>): Query<T>;
}

export function query<T extends Component[] = []>(): QueryBuilder<T> {
  return new QueryBuilder<T>();
}
