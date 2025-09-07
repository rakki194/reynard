// Component system implementation

import { Component, ComponentType, StorageType } from './types';

export class ComponentRegistry {
  private componentTypes: Map<string, ComponentType<Component>> = new Map();
  private componentIds: Map<number, ComponentType<Component>> = new Map();
  private nextId: number = 0;

  register<T extends Component>(
    name: string,
    storage: StorageType = StorageType.Table,
    create: () => T
  ): ComponentType<T> {
    if (this.componentTypes.has(name)) {
      throw new Error(`Component type '${name}' is already registered`);
    }

    const id = this.nextId++;
    const componentType: ComponentType<T> = { name, id, storage, create };
    this.componentTypes.set(name, componentType as ComponentType<Component>);
    this.componentIds.set(id, componentType as ComponentType<Component>);
    return componentType;
  }

  getByName<T extends Component>(name: string): ComponentType<T> | undefined {
    return this.componentTypes.get(name) as ComponentType<T> | undefined;
  }

  getById<T extends Component>(id: number): ComponentType<T> | undefined {
    return this.componentIds.get(id) as ComponentType<T> | undefined;
  }

  getAllTypes(): ComponentType<Component>[] {
    return Array.from(this.componentTypes.values());
  }

  has(name: string): boolean {
    return this.componentTypes.has(name);
  }
}

export class TableStorage<T extends Component> {
  private components: T[] = [];
  private entityToIndex: Map<number, number> = new Map();
  private indexToEntity: Map<number, number> = new Map();

  insert(entityIndex: number, component: T): void {
    if (this.entityToIndex.has(entityIndex)) {
      const index = this.entityToIndex.get(entityIndex)!;
      this.components[index] = component;
    } else {
      const index = this.components.length;
      this.components.push(component);
      this.entityToIndex.set(entityIndex, index);
      this.indexToEntity.set(index, entityIndex);
    }
  }

  get(entityIndex: number): T | undefined {
    const index = this.entityToIndex.get(entityIndex);
    return index !== undefined ? this.components[index] : undefined;
  }

  remove(entityIndex: number): T | undefined {
    const index = this.entityToIndex.get(entityIndex);
    if (index === undefined) return undefined;

    const component = this.components[index];
    const lastIndex = this.components.length - 1;
    
    if (index !== lastIndex) {
      const lastEntity = this.indexToEntity.get(lastIndex)!;
      this.components[index] = this.components[lastIndex];
      this.entityToIndex.set(lastEntity, index);
      this.indexToEntity.set(index, lastEntity);
    }

    this.components.pop();
    this.entityToIndex.delete(entityIndex);
    this.indexToEntity.delete(lastIndex);
    return component;
  }

  has(entityIndex: number): boolean {
    return this.entityToIndex.has(entityIndex);
  }

  getEntities(): number[] {
    return Array.from(this.entityToIndex.keys());
  }

  getComponents(): T[] {
    return [...this.components];
  }

  getCount(): number {
    return this.components.length;
  }

  clear(): void {
    this.components.length = 0;
    this.entityToIndex.clear();
    this.indexToEntity.clear();
  }
}

export class SparseSetStorage<T extends Component> {
  private components: Map<number, T> = new Map();

  insert(entityIndex: number, component: T): void {
    this.components.set(entityIndex, component);
  }

  get(entityIndex: number): T | undefined {
    return this.components.get(entityIndex);
  }

  remove(entityIndex: number): T | undefined {
    const component = this.components.get(entityIndex);
    this.components.delete(entityIndex);
    return component;
  }

  has(entityIndex: number): boolean {
    return this.components.has(entityIndex);
  }

  getEntities(): number[] {
    return Array.from(this.components.keys());
  }

  getComponents(): T[] {
    return Array.from(this.components.values());
  }

  getCount(): number {
    return this.components.size;
  }

  clear(): void {
    this.components.clear();
  }
}

export class ComponentStorage {
  private tableStorages: Map<number, TableStorage<Component>> = new Map();
  private sparseSetStorages: Map<number, SparseSetStorage<Component>> = new Map();

  getStorage<T extends Component>(
    componentType: ComponentType<T>,
    storageType: StorageType
  ): TableStorage<T> | SparseSetStorage<T> {
    if (storageType === StorageType.Table) {
      if (!this.tableStorages.has(componentType.id)) {
        this.tableStorages.set(componentType.id, new TableStorage<T>());
      }
      return this.tableStorages.get(componentType.id)! as TableStorage<T>;
    } else {
      if (!this.sparseSetStorages.has(componentType.id)) {
        this.sparseSetStorages.set(componentType.id, new SparseSetStorage<T>());
      }
      return this.sparseSetStorages.get(componentType.id)! as SparseSetStorage<T>;
    }
  }

  getTableStorage<T extends Component>(componentType: ComponentType<T>): TableStorage<T> | undefined {
    return this.tableStorages.get(componentType.id) as TableStorage<T> | undefined;
  }

  getSparseSetStorage<T extends Component>(componentType: ComponentType<T>): SparseSetStorage<T> | undefined {
    return this.sparseSetStorages.get(componentType.id) as SparseSetStorage<T> | undefined;
  }

  clear(): void {
    this.tableStorages.clear();
    this.sparseSetStorages.clear();
  }
}

// Overloaded function signatures for createComponentType
export function createComponentType<T extends Component>(
  name: string
): ComponentType<T>;
export function createComponentType<T extends Component>(
  name: string,
  storage: StorageType,
  create: () => T
): ComponentType<T>;
export function createComponentType<T extends Component>(
  name: string,
  storage: StorageType = StorageType.Table,
  create?: () => T
): ComponentType<T> {
  // If no create function provided, create a default one that returns an empty object
  const createFn = create || (() => ({} as T));
  return { name, id: 0, storage, create: createFn };
}
