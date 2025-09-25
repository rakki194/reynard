// Entity operations for the ECS world

import { Component, Entity } from "./types";

import { EntityManager } from "./entity";
import { ComponentRegistry, ComponentStorage } from "./component";
import { ChangeDetectionImpl } from "./change-detection";
import { ArchetypeOperationsMixin } from "./archetype-operations";

/**
 * Entity operations mixin for WorldImpl.
 * This provides entity management functionality.
 */
export class EntityOperationsMixin {
  constructor(
    private entityManager: EntityManager,
    private componentRegistry: ComponentRegistry,
    private componentStorage: ComponentStorage,
    private changeDetection: ChangeDetectionImpl,
    private archetypeOps: ArchetypeOperationsMixin
  ) {}

  /**
   * Spawns an entity with components.
   */
  spawn<T extends Component[]>(...components: T): Entity {
    const entity = this.entityManager.allocate();
    this.insert(entity, ...components);
    return entity;
  }

  /**
   * Spawns an empty entity.
   */
  spawnEmpty(): Entity {
    return this.entityManager.allocate();
  }

  /**
   * Despawns an entity.
   */
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
    this.archetypeOps.removeEntityFromArchetype(entity);

    return this.entityManager.free(entity);
  }

  /**
   * Checks if an entity exists.
   */
  contains(entity: Entity): boolean {
    return this.entityManager.contains(entity);
  }

  /**
   * Checks if an entity is alive.
   */
  isAlive(entity: Entity): boolean {
    return this.entityManager.contains(entity);
  }

  /**
   * Gets the entity count.
   */
  getEntityCount(): number {
    return this.entityManager.getEntityCount();
  }

  /**
   * Inserts components into an entity (helper method).
   */
  private insert<T extends Component[]>(entity: Entity, ...components: T): void {
    if (!this.entityManager.contains(entity)) {
      return; // Safe to ignore operations on non-existent entities
    }

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const componentType = this.findComponentType(component);
      if (!componentType) {
        throw new Error(`Component type not registered: ${component.constructor.name}`);
      }

      const storage = this.componentStorage.getStorage(componentType, componentType.storage);
      storage.insert(entity.index, component);

      // Mark component as added in change detection
      this.changeDetection.markAdded(entity, componentType);
    }

    // Update entity's archetype after adding components
    this.archetypeOps.updateEntityArchetype(entity);
  }

  /**
   * Finds a component type by component instance.
   */
  private findComponentType(component: Component): any {
    const componentName = component.constructor.name;
    let componentType = this.componentRegistry.getByName(componentName);

    // Auto-register component type if not found, but only for valid component classes
    if (!componentType && component.constructor !== Object && componentName !== "Object") {
      componentType = this.componentRegistry.register(
        componentName,
        "Table" as any,
        () => new (component.constructor as any)()
      );
    }

    return componentType;
  }
}
