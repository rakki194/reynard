// Commands implementation for deferred world modifications

import { Commands, Component, ComponentType, Entity, Resource, ResourceType } from "./types";

import { WorldImpl } from "./world-core";

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
