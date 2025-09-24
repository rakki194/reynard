// World delegator - minimal interface that delegates to initialization

import {
  Component,
  ComponentType,
  Entity,
  World as IWorld,
  QueryFilter,
  QueryResult,
  Resource,
  ResourceType,
  System,
} from "./types";

import { WorldInitialization } from "./world-initialization";

/**
 * World delegator - minimal implementation that delegates to initialization.
 */
export class WorldDelegator implements IWorld {
  private init: WorldInitialization;

  constructor() {
    this.init = new WorldInitialization();
  }

  // Entity operations
  spawn<T extends Component[]>(...components: T): Entity {
    return this.init.entityOps.spawn(...components);
  }

  spawnEmpty(): Entity {
    return this.init.entityOps.spawnEmpty();
  }

  despawn(entity: Entity): boolean {
    return this.init.entityOps.despawn(entity);
  }

  contains(entity: Entity): boolean {
    return this.init.entityOps.contains(entity);
  }

  isAlive(entity: Entity): boolean {
    return this.init.entityOps.isAlive(entity);
  }

  // Component operations
  insert<T extends Component[]>(entity: Entity, ...components: T): void {
    this.init.componentOps.insert(entity, ...components);
  }

  add<T extends Component>(entity: Entity, componentType: ComponentType<T>, component: T): void {
    this.init.componentOps.add(entity, componentType, component);
  }

  remove<T extends Component[]>(entity: Entity, ...componentTypes: ComponentType<T[number]>[]): void {
    this.init.componentOps.remove(entity, ...componentTypes);
  }

  get<T extends Component>(entity: Entity, componentType: ComponentType<T>): T | undefined {
    return this.init.componentOps.get(entity, componentType);
  }

  getMut<T extends Component>(entity: Entity, componentType: ComponentType<T>): T | undefined {
    return this.init.componentOps.getMut(entity, componentType);
  }

  has<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean {
    return this.init.componentOps.has(entity, componentType);
  }

  // Resource operations
  insertResource<T extends Resource>(resource: T): void {
    this.init.resourceOps.insertResource(resource);
  }

  addResource<T extends Resource>(resourceType: ResourceType<T>, resource: T): void {
    this.init.resourceOps.addResource(resourceType, resource);
  }

  removeResource<T extends Resource>(resourceType: ResourceType<T>): T | undefined {
    return this.init.resourceOps.removeResource(resourceType);
  }

  getResource<T extends Resource>(resourceType: ResourceType<T>): T | undefined {
    return this.init.resourceOps.getResource(resourceType);
  }

  getResourceMut<T extends Resource>(resourceType: ResourceType<T>): T | undefined {
    return this.init.resourceOps.getResourceMut(resourceType);
  }

  hasResource<T extends Resource>(resourceType: ResourceType<T>): boolean {
    return this.init.resourceOps.hasResource(resourceType);
  }

  // Query operations
  query<T extends Component[]>(...componentTypes: ComponentType<T[number]>[]): any {
    return this.init.queryMixin.createQueryBuilder(...componentTypes);
  }

  queryFiltered<T extends Component[]>(
    componentTypes: ComponentType<T[number]>[],
    filter: QueryFilter
  ): QueryResult<T> {
    return this.init.queryMixin.queryFiltered(componentTypes, filter);
  }

  // System operations
  addSystem(system: System): void {
    this.init.systemOps.addSystem(system);
  }

  removeSystem(systemName: string): void {
    this.init.systemOps.removeSystem(systemName);
  }

  runSystem(systemName: string): void {
    this.init.systemOps.runSystem(systemName, this);
  }

  runSchedule(scheduleName: string): void {
    this.init.systemOps.runSchedule(scheduleName, this);
  }

  // Commands
  commands(): any {
    const { CommandsImpl } = require("./commands");
    return new CommandsImpl(this);
  }

  // Statistics
  getEntityCount(): number {
    return this.init.entityOps.getEntityCount();
  }

  getComponentCount<T extends Component>(componentType: ComponentType<T>): number {
    return this.init.componentOps.getComponentCount(componentType);
  }

  // Registry access
  getComponentRegistry(): any {
    return this.init.componentRegistry;
  }

  getResourceRegistry(): any {
    return this.init.resourceRegistry;
  }

  // Archetype access
  getArchetype(entity: Entity): any {
    return this.init.archetypeOps.getArchetype(entity);
  }

  // Change detection access for tests
  getChangeDetection(): any {
    return this.init.changeDetection;
  }
}
