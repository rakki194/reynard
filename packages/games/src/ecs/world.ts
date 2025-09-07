// World implementation - the central ECS container

import { 
  Entity, 
  Component, 
  Resource, 
  ComponentType, 
  ResourceType, 
  System, 
  SystemFunction, 
  Schedule,
  Commands,
  QueryResult,
  QueryFilter,
  World as IWorld
} from './types';

import { EntityManager } from './entity';
import { ComponentRegistry, ComponentStorage } from './component';
import { ResourceRegistry, ResourceStorage } from './resource';
import { QueryImpl } from './query';

/**
 * Commands implementation for deferred world modifications.
 */
export class CommandsImpl implements Commands {
  private commands: (() => void)[] = [];

  constructor(private world: WorldImpl) {}

  spawn<T extends Component[]>(...components: T): Entity {
    const entity = this.world.spawnEmpty();
    this.world.insert(entity, ...components);
    return entity;
  }

  spawnEmpty(): Entity {
    return this.world.spawnEmpty();
  }

  despawn(entity: Entity): void {
    this.commands.push(() => this.world.despawn(entity));
  }

  insert<T extends Component[]>(entity: Entity, ...components: T): void {
    this.commands.push(() => this.world.insert(entity, ...components));
  }

  remove<T extends Component[]>(entity: Entity, ...componentTypes: ComponentType<T[number]>[]): void {
    this.commands.push(() => this.world.remove(entity, ...componentTypes));
  }

  insertResource<T extends Resource>(resource: T): void {
    this.commands.push(() => this.world.insertResource(resource));
  }

  removeResource<T extends Resource>(resourceType: ResourceType<T>): void {
    this.commands.push(() => this.world.removeResource(resourceType));
  }

  /**
   * Applies all queued commands.
   */
  apply(): void {
    for (const command of this.commands) {
      command();
    }
    this.commands.length = 0;
  }

  /**
   * Clears all queued commands.
   */
  clear(): void {
    this.commands.length = 0;
  }
}

/**
 * World implementation.
 */
export class WorldImpl implements IWorld {
  private entityManager: EntityManager;
  private componentRegistry: ComponentRegistry;
  private componentStorage: ComponentStorage;
  private resourceRegistry: ResourceRegistry;
  private resourceStorage: ResourceStorage;
  private systems: Map<string, System> = new Map();
  private schedules: Map<string, Schedule> = new Map();
  private changeDetection: any; // Will be implemented later

  constructor() {
    this.entityManager = new EntityManager();
    this.componentRegistry = new ComponentRegistry();
    this.componentStorage = new ComponentStorage();
    this.resourceRegistry = new ResourceRegistry();
    this.resourceStorage = new ResourceStorage();
  }

  // Entity operations
  spawn<T extends Component[]>(...components: T): Entity {
    const entity = this.entityManager.allocate();
    this.insert(entity, ...components);
    return entity;
  }

  spawnEmpty(): Entity {
    return this.entityManager.allocate();
  }

  despawn(entity: Entity): boolean {
    // Remove all components from the entity
    const componentTypes = this.componentRegistry.getAllTypes();
    for (const componentType of componentTypes) {
      const storage = this.componentStorage.getTableStorage(componentType) || 
                     this.componentStorage.getSparseSetStorage(componentType);
      if (storage?.has(entity.index)) {
        storage.remove(entity.index);
      }
    }
    
    return this.entityManager.free(entity);
  }

  contains(entity: Entity): boolean {
    return this.entityManager.contains(entity);
  }

  // Component operations
  insert<T extends Component[]>(entity: Entity, ...components: T): void {
    if (!this.entityManager.contains(entity)) {
      throw new Error(`Entity ${entity.index}v${entity.generation} does not exist`);
    }

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const componentType = this.findComponentType(component);
      if (!componentType) {
        throw new Error(`Component type not registered: ${component.constructor.name}`);
      }

      const storage = this.componentStorage.getStorage(componentType, componentType.storage);
      storage.insert(entity.index, component);
    }
  }

  remove<T extends Component[]>(entity: Entity, ...componentTypes: ComponentType<T[number]>[]): void {
    if (!this.entityManager.contains(entity)) {
      throw new Error(`Entity ${entity.index}v${entity.generation} does not exist`);
    }

    for (const componentType of componentTypes) {
      const storage = this.componentStorage.getTableStorage(componentType) || 
                     this.componentStorage.getSparseSetStorage(componentType);
      if (storage) {
        storage.remove(entity.index);
      }
    }
  }

  get<T extends Component>(entity: Entity, componentType: ComponentType<T>): T | undefined {
    if (!this.entityManager.contains(entity)) {
      return undefined;
    }

    const storage = this.componentStorage.getTableStorage(componentType) || 
                   this.componentStorage.getSparseSetStorage(componentType);
    return storage?.get(entity.index);
  }

  getMut<T extends Component>(entity: Entity, componentType: ComponentType<T>): T | undefined {
    // For now, same as get - in a real implementation, this would track mutability
    return this.get(entity, componentType);
  }

  has<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean {
    if (!this.entityManager.contains(entity)) {
      return false;
    }

    const storage = this.componentStorage.getTableStorage(componentType) || 
                   this.componentStorage.getSparseSetStorage(componentType);
    return storage?.has(entity.index) ?? false;
  }

  // Resource operations
  insertResource<T extends Resource>(resource: T): void {
    const resourceType = this.findResourceType(resource);
    if (!resourceType) {
      throw new Error(`Resource type not registered: ${resource.constructor.name}`);
    }
    this.resourceStorage.insert(resourceType, resource);
  }

  removeResource<T extends Resource>(resourceType: ResourceType<T>): T | undefined {
    return this.resourceStorage.remove(resourceType);
  }

  getResource<T extends Resource>(resourceType: ResourceType<T>): T | undefined {
    return this.resourceStorage.get(resourceType);
  }

  getResourceMut<T extends Resource>(resourceType: ResourceType<T>): T | undefined {
    // For now, same as get - in a real implementation, this would track mutability
    return this.resourceStorage.get(resourceType);
  }

  hasResource<T extends Resource>(resourceType: ResourceType<T>): boolean {
    return this.resourceStorage.has(resourceType);
  }

  // Query operations
  query<T extends Component[]>(...componentTypes: ComponentType<T[number]>[]): QueryResult<T> {
    const query = new QueryImpl(componentTypes, {});
    return query.execute(this.entityManager, this.componentStorage, this.changeDetection);
  }

  queryFiltered<T extends Component[]>(
    componentTypes: ComponentType<T[number]>[],
    filter: QueryFilter
  ): QueryResult<T> {
    const query = new QueryImpl(componentTypes, filter);
    return query.execute(this.entityManager, this.componentStorage, this.changeDetection);
  }

  // System operations
  addSystem(system: System): void {
    this.systems.set(system.name, system);
  }

  removeSystem(systemName: string): void {
    this.systems.delete(systemName);
  }

  runSystem(systemName: string): void {
    const system = this.systems.get(systemName);
    if (!system) {
      throw new Error(`System '${systemName}' not found`);
    }
    system.run(this);
  }

  runSchedule(scheduleName: string): void {
    const schedule = this.schedules.get(scheduleName);
    if (!schedule) {
      throw new Error(`Schedule '${scheduleName}' not found`);
    }
    schedule.run(this);
  }

  // Commands
  commands(): Commands {
    return new CommandsImpl(this);
  }

  // Statistics
  getEntityCount(): number {
    return this.entityManager.getEntityCount();
  }

  getComponentCount<T extends Component>(componentType: ComponentType<T>): number {
    const storage = this.componentStorage.getTableStorage(componentType) || 
                   this.componentStorage.getSparseSetStorage(componentType);
    return storage?.getCount() ?? 0;
  }

  // Registry access
  getComponentRegistry(): ComponentRegistry {
    return this.componentRegistry;
  }

  getResourceRegistry(): ResourceRegistry {
    return this.resourceRegistry;
  }

  // Helper methods
  private findComponentType(component: Component): ComponentType<any> | undefined {
    const componentName = component.constructor.name;
    return this.componentRegistry.getByName(componentName);
  }

  private findResourceType(resource: Resource): ResourceType<any> | undefined {
    const resourceName = resource.constructor.name;
    return this.resourceRegistry.getByName(resourceName);
  }
}

/**
 * Creates a new world instance.
 */
export function createWorld(): IWorld {
  return new WorldImpl();
}
