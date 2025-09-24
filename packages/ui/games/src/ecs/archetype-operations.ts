// Archetype operations for the ECS world

import {
  Component,
  ComponentType,
  Entity,
} from "./types";

import { ArchetypeId, Archetypes } from "./archetype";
import { ComponentRegistry, ComponentStorage } from "./component";
import { EntityManager } from "./entity";

/**
 * Archetype operations mixin for WorldImpl.
 * This provides archetype management functionality.
 */
export class ArchetypeOperationsMixin {
  constructor(
    private archetypes: Archetypes,
    private entityToArchetype: Map<number, ArchetypeId>,
    private componentRegistry: ComponentRegistry,
    private componentStorage: ComponentStorage,
    private entityManager: EntityManager
  ) {}

  /**
   * Gets the archetype for an entity.
   */
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

  /**
   * Updates an entity's archetype based on its current components.
   */
  updateEntityArchetype(entity: Entity): void {
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

  /**
   * Removes an entity from its archetype during despawning.
   */
  removeEntityFromArchetype(entity: Entity): void {
    const archetypeId = this.entityToArchetype.get(entity.index);
    if (archetypeId !== undefined) {
      const archetype = this.archetypes.getArchetype(archetypeId);
      if (archetype) {
        archetype.removeEntity(entity);
      }
      this.entityToArchetype.delete(entity.index);
    }
  }

  /**
   * Checks if an entity has a component (helper method).
   */
  private has<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean {
    if (!this.entityManager.contains(entity)) {
      return false;
    }

    const storage =
      this.componentStorage.getTableStorage(componentType) || this.componentStorage.getSparseSetStorage(componentType);
    return storage?.has(entity.index) ?? false;
  }
}
