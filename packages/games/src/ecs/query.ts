// Query system implementation for component access

import { Entity, Component, ComponentType, QueryFilter, QueryResult } from './types';
import { ComponentStorage } from './component';

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
    private readonly entityComponents: Map<number, Component[]> = new Map()
  ) {}

  forEach(callback: (entity: Entity, ...components: T) => void): void {
    for (let i = 0; i < this.length; i++) {
      const entity = this.entities[i];
      const componentValues = this.getComponentValuesForEntity(i) as T;
      callback(entity, ...componentValues);
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

  filter(predicate: (entity: Entity, ...components: T) => boolean): QueryResult<T> {
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
      filteredEntityComponents
    );
  }

  private getComponentValuesForEntity(entityIndex: number): Component[] {
    const entity = this.entities[entityIndex];
    const components = this.entityComponents.get(entity.index);
    if (!components) {
      throw new Error(`No components found for entity ${entity.index}`);
    }
    return components;
  }

  private getComponentValues(): Component[] {
    return this.components.map((_, componentIndex) => this.components[componentIndex]);
  }
}

/**
 * Query builder for constructing component queries.
 */
export class QueryBuilder<T extends Component[]> {
  private componentTypes: ComponentType<Component>[] = [];
  private filters: QueryFilter = {};

  with<U extends Component>(componentType: ComponentType<U>): QueryBuilder<[...T, U]> {
    this.componentTypes.push(componentType as ComponentType<Component>);
    return this as unknown as QueryBuilder<[...T, U]>;
  }

  filter(filter: QueryFilter): this {
    this.filters = { ...this.filters, ...filter };
    return this;
  }

  build(): Query<T> {
    return new QueryImpl(this.componentTypes as ComponentType<T[number]>[], this.filters);
  }
}

/**
 * Query implementation.
 */
export class QueryImpl<T extends Component[]> {
  constructor(
    private componentTypes: ComponentType<T[number]>[],
    private filters: QueryFilter
  ) {}

  execute(
    entityManager: { getAllEntities(): Entity[] },
    componentStorage: ComponentStorage,
    changeDetection?: { isAdded(entity: Entity, type: ComponentType<Component>): boolean; isChanged(entity: Entity, type: ComponentType<Component>): boolean }
  ): QueryResult<T> {
    const matchingEntities: Entity[] = [];
    const entityComponents = new Map<number, Component[]>();
    const allEntities = entityManager.getAllEntities();
    
    for (const entity of allEntities) {
      if (this.hasAllComponents(entity, componentStorage) && this.passesFilters(entity, componentStorage, changeDetection)) {
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
      entityComponents
    );
  }

  private hasAllComponents(entity: Entity, storage: ComponentStorage): boolean {
    return this.componentTypes.every(type => {
      const tableStorage = storage.getTableStorage(type);
      const sparseStorage = storage.getSparseSetStorage(type);
      return (tableStorage?.has(entity.index) || sparseStorage?.has(entity.index)) ?? false;
    });
  }

  private getEntityComponents(entity: Entity, storage: ComponentStorage): Component[] {
    return this.componentTypes.map(type => {
      const tableStorage = storage.getTableStorage(type);
      const sparseStorage = storage.getSparseSetStorage(type);
      return (tableStorage?.get(entity.index) || sparseStorage?.get(entity.index)) as Component;
    });
  }

  private passesFilters(entity: Entity, storage: ComponentStorage, changeDetection?: { isAdded(entity: Entity, type: ComponentType<Component>): boolean; isChanged(entity: Entity, type: ComponentType<Component>): boolean }): boolean {
    if (this.filters.with && !this.checkWithFilter(entity, storage)) return false;
    if (this.filters.without && this.checkWithoutFilter(entity, storage)) return false;
    if (this.filters.added && changeDetection && !this.checkAddedFilter(entity, changeDetection)) return false;
    if (this.filters.changed && changeDetection && !this.checkChangedFilter(entity, changeDetection)) return false;
    return true;
  }

  private checkWithFilter(entity: Entity, storage: ComponentStorage): boolean {
    return this.filters.with!.every(type => {
      const tableStorage = storage.getTableStorage(type);
      const sparseStorage = storage.getSparseSetStorage(type);
      return (tableStorage?.has(entity.index) || sparseStorage?.has(entity.index)) ?? false;
    });
  }

  private checkWithoutFilter(entity: Entity, storage: ComponentStorage): boolean {
    return this.filters.without!.some(type => {
      const tableStorage = storage.getTableStorage(type);
      const sparseStorage = storage.getSparseSetStorage(type);
      return (tableStorage?.has(entity.index) || sparseStorage?.has(entity.index)) ?? false;
    });
  }

  private checkAddedFilter(entity: Entity, changeDetection: { isAdded(entity: Entity, type: ComponentType<Component>): boolean }): boolean {
    return this.filters.added!.every(type => changeDetection.isAdded(entity, type));
  }

  private checkChangedFilter(entity: Entity, changeDetection: { isChanged(entity: Entity, type: ComponentType<Component>): boolean }): boolean {
    return this.filters.changed!.every(type => changeDetection.isChanged(entity, type));
  }
}

export interface Query<T extends Component[]> {
  execute(
    entityManager: { getAllEntities(): Entity[] },
    componentStorage: ComponentStorage,
    changeDetection?: { isAdded(entity: Entity, type: ComponentType<Component>): boolean; isChanged(entity: Entity, type: ComponentType<Component>): boolean }
  ): QueryResult<T>;
}

export function query<T extends Component[] = []>(): QueryBuilder<T> {
  return new QueryBuilder<T>();
}

