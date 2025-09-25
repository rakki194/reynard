// Component operations for the ECS world

import { Component, ComponentType, Entity, StorageType } from "./types";

import { ComponentRegistry, ComponentStorage } from "./component";
import { ChangeDetectionImpl } from "./change-detection";
import { ArchetypeId, Archetypes } from "./archetype";

/**
 * Component operations mixin for WorldImpl.
 * This provides component management functionality.
 */
export class ComponentOperationsMixin {
  constructor(
    private componentRegistry: ComponentRegistry,
    private componentStorage: ComponentStorage,
    private changeDetection: ChangeDetectionImpl,
    private archetypes: Archetypes,
    private entityToArchetype: Map<number, ArchetypeId>,
    private entityManager: any
  ) {}

  /**
   * Inserts components into an entity.
   */
  insert<T extends Component[]>(entity: Entity, ...components: T): void {
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
    this.updateEntityArchetype(entity);
  }

  /**
   * Adds a component to an entity (alias for insert).
   */
  add<T extends Component>(entity: Entity, componentType: ComponentType<T>, component: T): void {
    if (!this.entityManager.contains(entity)) {
      return; // Safe to ignore operations on non-existent entities
    }

    // Use the provided component type instead of finding it
    const storage = this.componentStorage.getStorage(componentType, componentType.storage);
    storage.insert(entity.index, component);

    // Mark component as added in change detection
    this.changeDetection.markAdded(entity, componentType);

    // Update entity's archetype after adding components
    this.updateEntityArchetype(entity);
  }

  /**
   * Removes components from an entity.
   */
  remove<T extends Component[]>(entity: Entity, ...componentTypes: ComponentType<T[number]>[]): void {
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

  /**
   * Gets a component from an entity.
   */
  get<T extends Component>(entity: Entity, componentType: ComponentType<T>): T | undefined {
    if (!this.entityManager.contains(entity)) {
      return undefined;
    }

    const storage =
      this.componentStorage.getTableStorage(componentType) || this.componentStorage.getSparseSetStorage(componentType);
    return storage?.get(entity.index);
  }

  /**
   * Gets a mutable component from an entity.
   */
  getMut<T extends Component>(entity: Entity, componentType: ComponentType<T>): T | undefined {
    // For now, same as get - in a real implementation, this would track mutability
    return this.get(entity, componentType);
  }

  /**
   * Checks if an entity has a component.
   */
  has<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean {
    if (!this.entityManager.contains(entity)) {
      return false;
    }

    const storage =
      this.componentStorage.getTableStorage(componentType) || this.componentStorage.getSparseSetStorage(componentType);
    return storage?.has(entity.index) ?? false;
  }

  /**
   * Gets the count of components of a specific type.
   */
  getComponentCount<T extends Component>(componentType: ComponentType<T>): number {
    const storage =
      this.componentStorage.getTableStorage(componentType) || this.componentStorage.getSparseSetStorage(componentType);
    return storage?.getCount() ?? 0;
  }

  /**
   * Finds a component type by component instance.
   */
  private findComponentType(component: Component): ComponentType<any> | undefined {
    const componentName = component.constructor.name;
    let componentType = this.componentRegistry.getByName(componentName);

    // Auto-register component type if not found, but only for valid component classes
    if (!componentType && component.constructor !== Object && componentName !== "Object") {
      componentType = this.componentRegistry.register(
        componentName,
        StorageType.Table,
        () => new (component.constructor as any)()
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
    if (oldArchetypeId === undefined || oldArchetypeId.index !== newArchetypeId.index) {
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
}
