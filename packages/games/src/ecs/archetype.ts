// Archetype system implementation - groups entities with same component layout

import { Entity, Component, ComponentType } from './types';

/**
 * An opaque location within an archetype.
 */
export interface ArchetypeRow {
  readonly index: number;
}

/**
 * An opaque unique ID for a single archetype within a world.
 */
export interface ArchetypeId {
  readonly index: number;
}

/**
 * Creates a new archetype row.
 */
export function createArchetypeRow(index: number): ArchetypeRow {
  return { index };
}

/**
 * Creates a new archetype ID.
 */
export function createArchetypeId(index: number): ArchetypeId {
  return { index };
}

/**
 * Special archetype IDs.
 */
export const ARCHETYPE_IDS = {
  EMPTY: createArchetypeId(0),
  INVALID: createArchetypeId(Number.MAX_SAFE_INTEGER)
} as const;

/**
 * Special archetype rows.
 */
export const ARCHETYPE_ROWS = {
  INVALID: createArchetypeRow(Number.MAX_SAFE_INTEGER)
} as const;

/**
 * An archetype represents a group of entities that have the same set of components.
 * This is the core optimization in ECS - entities with the same component layout
 * are stored together for efficient iteration.
 */
export class Archetype {
  private entities: Entity[] = [];
  private entityToRow: Map<number, ArchetypeRow> = new Map();
  private rowToEntity: Map<number, Entity> = new Map();
  private componentTypeIds: Set<number> = new Set();
  private tableId: number = 0;

  constructor(
    public readonly id: ArchetypeId,
    public readonly componentTypes: ComponentType<Component>[]
  ) {
    // Store component type IDs for fast lookup
    for (const componentType of componentTypes) {
      this.componentTypeIds.add(componentType.id);
    }
  }

  /**
   * Adds an entity to this archetype.
   */
  addEntity(entity: Entity): ArchetypeRow {
    const row = createArchetypeRow(this.entities.length);
    this.entities.push(entity);
    this.entityToRow.set(entity.index, row);
    this.rowToEntity.set(row.index, entity);
    return row;
  }

  /**
   * Removes an entity from this archetype.
   */
  removeEntity(entity: Entity): boolean {
    const row = this.entityToRow.get(entity.index);
    if (!row) return false;

    // Move last entity to this position to maintain dense storage
    const lastIndex = this.entities.length - 1;
    if (row.index !== lastIndex) {
      const lastEntity = this.rowToEntity.get(lastIndex)!;
      this.entities[row.index] = lastEntity;
      this.entityToRow.set(lastEntity.index, row);
      this.rowToEntity.set(row.index, lastEntity);
    }

    this.entities.pop();
    this.entityToRow.delete(entity.index);
    this.rowToEntity.delete(lastIndex);
    return true;
  }

  /**
   * Gets the row of an entity in this archetype.
   */
  getEntityRow(entity: Entity): ArchetypeRow | undefined {
    return this.entityToRow.get(entity.index);
  }

  /**
   * Gets the entity at a specific row.
   */
  getEntityAtRow(row: ArchetypeRow): Entity | undefined {
    return this.rowToEntity.get(row.index);
  }

  /**
   * Gets all entities in this archetype.
   */
  getEntities(): Entity[] {
    return [...this.entities];
  }

  /**
   * Gets the number of entities in this archetype.
   */
  getEntityCount(): number {
    return this.entities.length;
  }

  /**
   * Checks if this archetype contains a specific component type.
   */
  hasComponentType(componentType: ComponentType<Component>): boolean {
    return this.componentTypeIds.has(componentType.id);
  }

  /**
   * Gets all component types in this archetype.
   */
  getComponentTypes(): ComponentType<Component>[] {
    return this.componentTypes;
  }

  /**
   * Sets the table ID for this archetype.
   */
  setTableId(tableId: number): void {
    this.tableId = tableId;
  }

  /**
   * Gets the table ID for this archetype.
   */
  getTableId(): number {
    return this.tableId;
  }

  /**
   * Checks if this archetype is empty.
   */
  isEmpty(): boolean {
    return this.entities.length === 0;
  }
}

/**
 * Manages all archetypes in a world.
 */
export class Archetypes {
  private archetypes: Archetype[] = [];
  private componentLayoutToArchetype: Map<string, ArchetypeId> = new Map();
  private nextId: number = 1; // Start at 1, 0 is reserved for EMPTY

  constructor() {
    // Create the empty archetype
    const emptyArchetype = new Archetype(ARCHETYPE_IDS.EMPTY, []);
    this.archetypes.push(emptyArchetype);
    this.componentLayoutToArchetype.set('', ARCHETYPE_IDS.EMPTY);
  }

  /**
   * Gets or creates an archetype for the given component types.
   */
  getOrCreateArchetype(componentTypes: ComponentType<Component>[]): ArchetypeId {
    const layoutKey = this.getComponentLayoutKey(componentTypes);
    
    let archetypeId = this.componentLayoutToArchetype.get(layoutKey);
    if (archetypeId) {
      return archetypeId;
    }

    // Create new archetype
    archetypeId = createArchetypeId(this.nextId++);
    const archetype = new Archetype(archetypeId, componentTypes);
    this.archetypes.push(archetype);
    this.componentLayoutToArchetype.set(layoutKey, archetypeId);
    
    return archetypeId;
  }

  /**
   * Gets an archetype by ID.
   */
  getArchetype(id: ArchetypeId): Archetype | undefined {
    return this.archetypes[id.index];
  }

  /**
   * Gets all archetypes.
   */
  getAllArchetypes(): Archetype[] {
    return [...this.archetypes];
  }

  /**
   * Gets the number of archetypes.
   */
  getArchetypeCount(): number {
    return this.archetypes.length;
  }

  /**
   * Finds an archetype that contains the given component types.
   */
  findArchetypeWithComponents(componentTypes: ComponentType<Component>[]): ArchetypeId | undefined {
    const layoutKey = this.getComponentLayoutKey(componentTypes);
    return this.componentLayoutToArchetype.get(layoutKey);
  }

  /**
   * Creates a component layout key for archetype lookup.
   */
  private getComponentLayoutKey(componentTypes: ComponentType<Component>[]): string {
    return componentTypes
      .map(ct => ct.id)
      .sort((a, b) => a - b)
      .join(',');
  }

  /**
   * Clears all archetypes.
   */
  clear(): void {
    this.archetypes.length = 0;
    this.componentLayoutToArchetype.clear();
    this.nextId = 1;
    
    // Recreate empty archetype
    const emptyArchetype = new Archetype(ARCHETYPE_IDS.EMPTY, []);
    this.archetypes.push(emptyArchetype);
    this.componentLayoutToArchetype.set('', ARCHETYPE_IDS.EMPTY);
  }
}
