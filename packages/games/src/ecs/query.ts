// Query system implementation for component access

import { Entity, Component, ComponentType, QueryFilter, QueryResult } from './types';
import { ComponentStorage } from './component';

/**
 * Query result implementation.
 */
export class QueryResultImpl<T extends Component[]> implements QueryResult<T> {
  constructor(
    public readonly entities: Entity[],
    public readonly components: T,
    public readonly length: number
  ) {}

  forEach(callback: (entity: Entity, ...components: T) => void): void {
    for (let i = 0; i < this.length; i++) {
      const entity = this.entities[i];
      const componentValues = this.getComponentValues() as T;
      callback(entity, ...componentValues);
    }
  }

  map<U>(callback: (entity: Entity, ...components: T) => U): U[] {
    const results: U[] = [];
    for (let i = 0; i < this.length; i++) {
      const entity = this.entities[i];
      const componentValues = this.getComponentValues() as T;
      results.push(callback(entity, ...componentValues));
    }
    return results;
  }

  filter(predicate: (entity: Entity, ...components: T) => boolean): QueryResult<T> {
    const filteredEntities: Entity[] = [];
    const filteredComponents: Component[] = [];
    
    for (let i = 0; i < this.length; i++) {
      const entity = this.entities[i];
      const componentValues = this.getComponentValues() as T;
      
      if (predicate(entity, ...componentValues)) {
        filteredEntities.push(entity);
        filteredComponents.push(...componentValues);
      }
    }
    
    return new QueryResultImpl(filteredEntities, filteredComponents as T, filteredEntities.length);
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
    const componentValues: Component[] = [];
    const allEntities = entityManager.getAllEntities();
    
    for (const entity of allEntities) {
      if (this.hasAllComponents(entity, componentStorage) && this.passesFilters(entity, componentStorage, changeDetection)) {
        matchingEntities.push(entity);
        componentValues.push(...this.getEntityComponents(entity, componentStorage));
      }
    }

    return new QueryResultImpl(matchingEntities, componentValues as T, matchingEntities.length);
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
