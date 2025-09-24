// Query implementation for component access

import { ComponentStorage } from "./component";
import { Component, ComponentType, Entity, QueryFilter, QueryResult } from "./types";
import { QueryResultImpl } from "./query-result";
import { Query } from "./query-builder";

/**
 * Query implementation.
 */
export class QueryImpl<T extends Component[]> implements Query<T> {
  constructor(
    private componentTypes: ComponentType<T[number]>[],
    private filters: QueryFilter
  ) {}

  // Add change detection methods for tests
  added<U extends Component>(componentType: ComponentType<U>): Query<T> {
    const newFilters = {
      ...this.filters,
      added: [...(this.filters.added || []), componentType],
    };
    return new QueryImpl(this.componentTypes, newFilters);
  }

  changed<U extends Component>(componentType: ComponentType<U>): Query<T> {
    const newFilters = {
      ...this.filters,
      changed: [...(this.filters.changed || []), componentType],
    };
    return new QueryImpl(this.componentTypes, newFilters);
  }

  removed<U extends Component>(componentType: ComponentType<U>): Query<T> {
    const newFilters = {
      ...this.filters,
      removed: [...(this.filters.removed || []), componentType],
    };
    return new QueryImpl(this.componentTypes, newFilters);
  }

  execute(
    entityManager: { getAllEntities(): Entity[] },
    componentStorage: ComponentStorage,
    changeDetection?: {
      isAdded(entity: Entity, type: ComponentType<Component>): boolean;
      isChanged(entity: Entity, type: ComponentType<Component>): boolean;
      isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    }
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
    Array.from(entityComponents.values()).forEach(components => {
      allComponents.push(...components);
    });

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

  private passesFilters(
    entity: Entity,
    storage: ComponentStorage,
    changeDetection?: {
      isAdded(entity: Entity, type: ComponentType<Component>): boolean;
      isChanged(entity: Entity, type: ComponentType<Component>): boolean;
      isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    }
  ): boolean {
    if (this.filters.with && !this.checkWithFilter(entity, storage)) return false;
    if (this.filters.without && this.checkWithoutFilter(entity, storage)) return false;
    if (this.filters.added && changeDetection && !this.checkAddedFilter(entity, changeDetection)) return false;
    if (this.filters.changed && changeDetection && !this.checkChangedFilter(entity, changeDetection)) return false;
    if (this.filters.removed && changeDetection && !this.checkRemovedFilter(entity, changeDetection)) return false;
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

  private checkAddedFilter(
    entity: Entity,
    changeDetection: {
      isAdded(entity: Entity, type: ComponentType<Component>): boolean;
    }
  ): boolean {
    return this.filters.added!.every(type => changeDetection.isAdded(entity, type));
  }

  private checkChangedFilter(
    entity: Entity,
    changeDetection: {
      isChanged(entity: Entity, type: ComponentType<Component>): boolean;
    }
  ): boolean {
    return this.filters.changed!.every(type => changeDetection.isChanged(entity, type));
  }

  private checkRemovedFilter(
    entity: Entity,
    changeDetection: {
      isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    }
  ): boolean {
    return this.filters.removed!.every(type => changeDetection.isRemoved(entity, type));
  }
}
