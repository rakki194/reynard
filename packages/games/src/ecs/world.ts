// World implementation - the central ECS container

import {
  Commands,
  Component,
  ComponentType,
  Entity,
  World as IWorld,
  QueryFilter,
  QueryResult,
  Resource,
  ResourceType,
  Schedule,
  StorageType,
  System,
} from "./types";

import { ArchetypeId, Archetypes } from "./archetype";
import { ChangeDetectionImpl } from "./change-detection";
import { ComponentRegistry, ComponentStorage } from "./component";
import { EntityManager } from "./entity";
import { QueryBuilder, QueryImpl } from "./query";
import { ResourceRegistry, ResourceStorage } from "./resource";

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
    this.world.insert(entity, ...components);
  }

  remove<T extends Component[]>(
    entity: Entity,
    ...componentTypes: ComponentType<T[number]>[]
  ): void {
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
  private changeDetection: ChangeDetectionImpl;
  private archetypes: Archetypes;
  private entityToArchetype: Map<number, ArchetypeId> = new Map(); // entity index -> archetype id

  constructor() {
    this.entityManager = new EntityManager();
    this.componentRegistry = new ComponentRegistry();
    this.componentStorage = new ComponentStorage();
    this.resourceRegistry = new ResourceRegistry();
    this.resourceStorage = new ResourceStorage();
    this.changeDetection = new ChangeDetectionImpl();
    this.archetypes = new Archetypes();
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
      const storage =
        this.componentStorage.getTableStorage(componentType) ||
        this.componentStorage.getSparseSetStorage(componentType);
      if (storage?.has(entity.index)) {
        storage.remove(entity.index);
        // Mark component as removed in change detection
        this.changeDetection.markRemoved(entity, componentType);
      }
    }

    // Remove entity from archetype
    const archetypeId = this.entityToArchetype.get(entity.index);
    if (archetypeId !== undefined) {
      const archetype = this.archetypes.getArchetype(archetypeId);
      if (archetype) {
        archetype.removeEntity(entity);
      }
      this.entityToArchetype.delete(entity.index);
    }

    return this.entityManager.free(entity);
  }

  contains(entity: Entity): boolean {
    return this.entityManager.contains(entity);
  }

  isAlive(entity: Entity): boolean {
    return this.entityManager.contains(entity);
  }

  // Component operations
  insert<T extends Component[]>(entity: Entity, ...components: T): void {
    if (!this.entityManager.contains(entity)) {
      return; // Safe to ignore operations on non-existent entities
    }

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const componentType = this.findComponentType(component);
      if (!componentType) {
        throw new Error(
          `Component type not registered: ${component.constructor.name}`,
        );
      }

      const storage = this.componentStorage.getStorage(
        componentType,
        componentType.storage,
      );
      storage.insert(entity.index, component);

      // Mark component as added in change detection
      this.changeDetection.markAdded(entity, componentType);
    }

    // Update entity's archetype after adding components
    this.updateEntityArchetype(entity);
  }

  // Alias for insert to match test expectations
  add<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
    component: T,
  ): void {
    if (!this.entityManager.contains(entity)) {
      return; // Safe to ignore operations on non-existent entities
    }

    // Use the provided component type instead of finding it
    const storage = this.componentStorage.getStorage(
      componentType,
      componentType.storage,
    );
    storage.insert(entity.index, component);

    // Mark component as added in change detection
    this.changeDetection.markAdded(entity, componentType);

    // Update entity's archetype after adding components
    this.updateEntityArchetype(entity);
  }

  remove<T extends Component[]>(
    entity: Entity,
    ...componentTypes: ComponentType<T[number]>[]
  ): void {
    if (!this.entityManager.contains(entity)) {
      return; // Safe to ignore operations on non-existent entities
    }

    for (const componentType of componentTypes) {
      const storage =
        this.componentStorage.getTableStorage(componentType) ||
        this.componentStorage.getSparseSetStorage(componentType);
      if (storage) {
        storage.remove(entity.index);
        // Mark component as removed in change detection
        this.changeDetection.markRemoved(entity, componentType);
      }
    }

    // Update entity's archetype after removing components
    this.updateEntityArchetype(entity);
  }

  get<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): T | undefined {
    if (!this.entityManager.contains(entity)) {
      return undefined;
    }

    const storage =
      this.componentStorage.getTableStorage(componentType) ||
      this.componentStorage.getSparseSetStorage(componentType);
    return storage?.get(entity.index);
  }

  getMut<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): T | undefined {
    // For now, same as get - in a real implementation, this would track mutability
    return this.get(entity, componentType);
  }

  has<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean {
    if (!this.entityManager.contains(entity)) {
      return false;
    }

    const storage =
      this.componentStorage.getTableStorage(componentType) ||
      this.componentStorage.getSparseSetStorage(componentType);
    return storage?.has(entity.index) ?? false;
  }

  // Resource operations
  insertResource<T extends Resource>(resource: T): void {
    const resourceType = this.findResourceType(resource);
    if (!resourceType) {
      throw new Error(
        `Resource type not registered: ${resource.constructor.name}`,
      );
    }
    this.resourceStorage.insert(resourceType, resource);
  }

  // Alias for insertResource to match test expectations
  addResource<T extends Resource>(
    resourceType: ResourceType<T>,
    resource: T,
  ): void {
    this.resourceStorage.insert(resourceType, resource);
  }

  removeResource<T extends Resource>(
    resourceType: ResourceType<T>,
  ): T | undefined {
    return this.resourceStorage.remove(resourceType);
  }

  getResource<T extends Resource>(
    resourceType: ResourceType<T>,
  ): T | undefined {
    return this.resourceStorage.get(resourceType);
  }

  getResourceMut<T extends Resource>(
    resourceType: ResourceType<T>,
  ): T | undefined {
    // For now, same as get - in a real implementation, this would track mutability
    return this.resourceStorage.get(resourceType);
  }

  hasResource<T extends Resource>(resourceType: ResourceType<T>): boolean {
    return this.resourceStorage.has(resourceType);
  }

  // Query operations
  query<T extends Component[]>(
    ...componentTypes: ComponentType<T[number]>[]
  ): QueryBuilder<T> & {
    forEach: (
      callback: (entity: Entity, ...components: T) => void | false,
    ) => void;
    first: () => { entity: Entity; components: T } | undefined;
    added: (componentType: ComponentType<any>) => any;
    changed: (componentType: ComponentType<any>) => any;
    removed: (componentType: ComponentType<any>) => any;
  } {
    const builder = new QueryBuilder<T>();
    for (const componentType of componentTypes) {
      builder.with(componentType);
    }

    // Add methods that have access to world context
    return Object.assign(builder, {
      forEach: (
        callback: (entity: Entity, ...components: T) => void | false,
      ) => {
        const query = builder.build();
        const result = query.execute(
          this.entityManager,
          this.componentStorage,
          this.changeDetection,
        );
        result.forEach(callback);
      },
      first: () => {
        const query = builder.build();
        const result = query.execute(
          this.entityManager,
          this.componentStorage,
          this.changeDetection,
        );
        return result.first();
      },
      added: (componentType: ComponentType<any>) => {
        const query = builder.build();
        const addedQuery = query.added(componentType);
        // Return a new query builder with the added filter
        const newBuilder = new QueryBuilder();
        newBuilder.componentTypes = [...builder.componentTypes];
        newBuilder.filters = {
          ...builder.filters,
          added: [...(builder.filters.added || []), componentType],
        };
        return Object.assign(newBuilder, {
          forEach: (
            callback: (entity: Entity, ...components: any) => void | false,
          ) => {
            const result = addedQuery.execute(
              this.entityManager,
              this.componentStorage,
              this.changeDetection,
            );
            result.forEach(callback);
          },
          first: () => {
            const result = addedQuery.execute(
              this.entityManager,
              this.componentStorage,
              this.changeDetection,
            );
            return result.first();
          },
          with: (newComponentType: ComponentType<any>) => {
            newBuilder.with(newComponentType);
            return Object.assign(newBuilder, {
              forEach: (
                callback: (entity: Entity, ...components: any) => void | false,
              ) => {
                const query = newBuilder.build();
                const result = query.execute(
                  this.entityManager,
                  this.componentStorage,
                  this.changeDetection,
                );
                result.forEach(callback);
              },
              first: () => {
                const query = newBuilder.build();
                const result = query.execute(
                  this.entityManager,
                  this.componentStorage,
                  this.changeDetection,
                );
                return result.first();
              },
            });
          },
        });
      },
      changed: (componentType: ComponentType<any>) => {
        const query = builder.build();
        const changedQuery = query.changed(componentType);
        // Return a new query builder with the changed filter
        const newBuilder = new QueryBuilder();
        newBuilder.componentTypes = [...builder.componentTypes];
        newBuilder.filters = {
          ...builder.filters,
          changed: [...(builder.filters.changed || []), componentType],
        };
        return Object.assign(newBuilder, {
          forEach: (
            callback: (entity: Entity, ...components: any) => void | false,
          ) => {
            const result = changedQuery.execute(
              this.entityManager,
              this.componentStorage,
              this.changeDetection,
            );
            result.forEach(callback);
          },
          first: () => {
            const result = changedQuery.execute(
              this.entityManager,
              this.componentStorage,
              this.changeDetection,
            );
            return result.first();
          },
          with: (newComponentType: ComponentType<any>) => {
            newBuilder.with(newComponentType);
            return Object.assign(newBuilder, {
              forEach: (
                callback: (entity: Entity, ...components: any) => void | false,
              ) => {
                const query = newBuilder.build();
                const result = query.execute(
                  this.entityManager,
                  this.componentStorage,
                  this.changeDetection,
                );
                result.forEach(callback);
              },
              first: () => {
                const query = newBuilder.build();
                const result = query.execute(
                  this.entityManager,
                  this.componentStorage,
                  this.changeDetection,
                );
                return result.first();
              },
            });
          },
        });
      },
      removed: (componentType: ComponentType<any>) => {
        const query = builder.build();
        const removedQuery = query.removed(componentType);
        // Return a new query builder with the removed filter
        const newBuilder = new QueryBuilder();
        newBuilder.componentTypes = [...builder.componentTypes];
        newBuilder.filters = {
          ...builder.filters,
          removed: [...(builder.filters.removed || []), componentType],
        };
        return Object.assign(newBuilder, {
          forEach: (
            callback: (entity: Entity, ...components: any) => void | false,
          ) => {
            const result = removedQuery.execute(
              this.entityManager,
              this.componentStorage,
              this.changeDetection,
            );
            result.forEach(callback);
          },
          first: () => {
            const result = removedQuery.execute(
              this.entityManager,
              this.componentStorage,
              this.changeDetection,
            );
            return result.first();
          },
          with: (newComponentType: ComponentType<any>) => {
            newBuilder.with(newComponentType);
            return Object.assign(newBuilder, {
              forEach: (
                callback: (entity: Entity, ...components: any) => void | false,
              ) => {
                const query = newBuilder.build();
                const result = query.execute(
                  this.entityManager,
                  this.componentStorage,
                  this.changeDetection,
                );
                result.forEach(callback);
              },
              first: () => {
                const query = newBuilder.build();
                const result = query.execute(
                  this.entityManager,
                  this.componentStorage,
                  this.changeDetection,
                );
                return result.first();
              },
            });
          },
        });
      },
    });
  }

  queryFiltered<T extends Component[]>(
    componentTypes: ComponentType<T[number]>[],
    filter: QueryFilter,
  ): QueryResult<T> {
    const query = new QueryImpl(componentTypes, filter);
    return query.execute(
      this.entityManager,
      this.componentStorage,
      this.changeDetection,
    );
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

  getComponentCount<T extends Component>(
    componentType: ComponentType<T>,
  ): number {
    const storage =
      this.componentStorage.getTableStorage(componentType) ||
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

  // Archetype access
  getArchetype(entity: Entity): any {
    if (!this.entityManager.contains(entity)) {
      return null;
    }

    // Get the archetype ID for this entity
    const archetypeId = this.entityToArchetype.get(entity.index);
    if (archetypeId === undefined) {
      // Entity hasn't been assigned to an archetype yet, update it
      this.updateEntityArchetype(entity);
      const newArchetypeId = this.entityToArchetype.get(entity.index);
      if (newArchetypeId === undefined) {
        return null;
      }
      return this.getArchetype(entity); // Recursive call with updated archetype
    }

    const archetype = this.archetypes.getArchetype(archetypeId);
    if (!archetype) {
      return null;
    }

    // Get the component types for this entity
    const componentTypes: ComponentType<any>[] = [];
    for (const componentType of this.componentRegistry.getAllTypes()) {
      if (this.has(entity, componentType)) {
        componentTypes.push(componentType);
      }
    }

    return archetype;
  }

  // Change detection access for tests
  getChangeDetection(): ChangeDetectionImpl {
    return this.changeDetection;
  }

  // Helper methods
  private findComponentType(
    component: Component,
  ): ComponentType<any> | undefined {
    const componentName = component.constructor.name;
    let componentType = this.componentRegistry.getByName(componentName);

    // Auto-register component type if not found, but only for valid component classes
    if (
      !componentType &&
      component.constructor !== Object &&
      componentName !== "Object"
    ) {
      componentType = this.componentRegistry.register(
        componentName,
        StorageType.Table,
        () => new (component.constructor as any)(),
      );
    }

    return componentType;
  }

  /**
   * Updates an entity's archetype based on its current components.
   */
  private updateEntityArchetype(entity: Entity): void {
    // Get the component types for this entity
    const componentTypes: ComponentType<any>[] = [];
    for (const componentType of this.componentRegistry.getAllTypes()) {
      if (this.has(entity, componentType)) {
        componentTypes.push(componentType);
      }
    }

    // Get or create the archetype for these component types
    const newArchetypeId = this.archetypes.getOrCreateArchetype(componentTypes);
    const oldArchetypeId = this.entityToArchetype.get(entity.index);

    // If the archetype changed, move the entity
    if (
      oldArchetypeId === undefined ||
      oldArchetypeId.index !== newArchetypeId.index
    ) {
      // Remove from old archetype if it exists
      if (oldArchetypeId !== undefined) {
        const oldArchetype = this.archetypes.getArchetype(oldArchetypeId);
        if (oldArchetype) {
          oldArchetype.removeEntity(entity);
        }
      }

      // Add to new archetype
      const newArchetype = this.archetypes.getArchetype(newArchetypeId);
      if (newArchetype) {
        newArchetype.addEntity(entity);
      }

      // Update tracking
      this.entityToArchetype.set(entity.index, newArchetypeId);
    }
  }

  private findResourceType(resource: Resource): ResourceType<any> | undefined {
    const resourceName = resource.constructor.name;
    let resourceType = this.resourceRegistry.getByName(resourceName);

    // Auto-register resource type if not found
    if (!resourceType) {
      resourceType = this.resourceRegistry.register(
        resourceName,
        () => new (resource.constructor as any)(),
      );
    }

    return resourceType;
  }
}

/**
 * Creates a new world instance.
 */
export function createWorld(): IWorld {
  return new WorldImpl();
}
