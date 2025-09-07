// Entity implementation with generational indexing

import { Entity } from './types';
import { ArchetypeId, ArchetypeRow } from './archetype';

/**
 * Location of an entity within the world.
 * This tracks exactly where an entity's components are stored.
 */
export interface EntityLocation {
  readonly archetypeId: ArchetypeId;
  readonly archetypeRow: ArchetypeRow;
  readonly tableId: number;
  readonly tableRow: number;
}

/**
 * Creates a new entity location.
 */
export function createEntityLocation(
  archetypeId: ArchetypeId,
  archetypeRow: ArchetypeRow,
  tableId: number,
  tableRow: number
): EntityLocation {
  return { archetypeId, archetypeRow, tableId, tableRow };
}

/**
 * Special entity location for invalid entities.
 */
export const ENTITY_LOCATION_INVALID: EntityLocation = {
  archetypeId: { index: Number.MAX_SAFE_INTEGER },
  archetypeRow: { index: Number.MAX_SAFE_INTEGER },
  tableId: Number.MAX_SAFE_INTEGER,
  tableRow: Number.MAX_SAFE_INTEGER
};

/**
 * Creates a new entity with the given index and generation.
 */
export function createEntity(index: number, generation: number): Entity {
  return { index, generation };
}

/**
 * Creates a placeholder entity for initialization.
 */
export function createPlaceholderEntity(): Entity {
  return { index: Number.MAX_SAFE_INTEGER, generation: 0 };
}

/**
 * Checks if an entity is a placeholder.
 */
export function isPlaceholderEntity(entity: Entity): boolean {
  return entity.index === Number.MAX_SAFE_INTEGER;
}

/**
 * Converts entity to a unique string representation.
 */
export function entityToString(entity: Entity): string {
  if (isPlaceholderEntity(entity)) {
    return 'PLACEHOLDER';
  }
  return `${entity.index}v${entity.generation}`;
}

/**
 * Converts entity to bits for efficient storage and comparison.
 */
export function entityToBits(entity: Entity): number {
  // Pack index and generation into a single number
  // Using 32 bits for index and 32 bits for generation
  return (entity.generation << 32) | entity.index;
}

/**
 * Reconstructs entity from bits.
 */
export function entityFromBits(bits: number): Entity {
  const index = bits & 0xFFFFFFFF;
  const generation = (bits >>> 32) & 0xFFFFFFFF;
  return { index, generation };
}

/**
 * Compares two entities for equality.
 */
export function entityEquals(a: Entity, b: Entity): boolean {
  return a.index === b.index && a.generation === b.generation;
}

/**
 * Compares two entities for ordering.
 */
export function entityCompare(a: Entity, b: Entity): number {
  // First compare by generation, then by index
  const genDiff = a.generation - b.generation;
  if (genDiff !== 0) return genDiff;
  return a.index - b.index;
}

/**
 * Entity metadata stored in the entity manager.
 */
export interface EntityMeta {
  readonly generation: number;
  readonly location: EntityLocation;
  readonly spawnedOrDespawnedBy?: string; // For debugging
}

/**
 * Entity manager for handling entity lifecycle.
 */
export class EntityManager {
  private entities: Map<number, Entity> = new Map();
  private entityMeta: Map<number, EntityMeta> = new Map();
  private nextIndex: number = 0;
  private freeIndices: number[] = [];
  private generations: Map<number, number> = new Map();

  /**
   * Allocates a new entity.
   */
  allocate(): Entity {
    let index: number;
    let generation: number;

    if (this.freeIndices.length > 0) {
      // Reuse a freed index
      index = this.freeIndices.pop()!;
      generation = (this.generations.get(index) || 0) + 1;
    } else {
      // Use a new index
      index = this.nextIndex++;
      generation = 1;
    }

    this.generations.set(index, generation);
    const entity = createEntity(index, generation);
    const meta: EntityMeta = {
      generation,
      location: ENTITY_LOCATION_INVALID
    };
    
    this.entities.set(index, entity);
    this.entityMeta.set(index, meta);
    return entity;
  }

  /**
   * Frees an entity, allowing its index to be reused.
   */
  free(entity: Entity): boolean {
    const existing = this.entities.get(entity.index);
    if (!existing || existing.generation !== entity.generation) {
      return false; // Entity doesn't exist or generation mismatch
    }

    this.entities.delete(entity.index);
    this.entityMeta.delete(entity.index);
    this.freeIndices.push(entity.index);
    return true;
  }

  /**
   * Checks if an entity exists and is valid.
   */
  contains(entity: Entity): boolean {
    const existing = this.entities.get(entity.index);
    return existing !== undefined && existing.generation === entity.generation;
  }

  /**
   * Gets the current entity for an index, if it exists.
   */
  getEntity(index: number): Entity | undefined {
    return this.entities.get(index);
  }

  /**
   * Gets entity metadata for an entity.
   */
  getEntityMeta(entity: Entity): EntityMeta | undefined {
    const existing = this.entities.get(entity.index);
    if (!existing || existing.generation !== entity.generation) {
      return undefined;
    }
    return this.entityMeta.get(entity.index);
  }

  /**
   * Sets entity metadata.
   */
  setEntityMeta(entity: Entity, meta: EntityMeta): void {
    const existing = this.entities.get(entity.index);
    if (!existing || existing.generation !== entity.generation) {
      throw new Error(`Entity ${entity.index}v${entity.generation} does not exist`);
    }
    this.entityMeta.set(entity.index, meta);
  }

  /**
   * Gets all currently allocated entities.
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Gets the number of allocated entities.
   */
  getEntityCount(): number {
    return this.entities.size;
  }

  /**
   * Clears all entities.
   */
  clear(): void {
    this.entities.clear();
    this.entityMeta.clear();
    this.freeIndices.length = 0;
    this.generations.clear();
    this.nextIndex = 0;
  }

  /**
   * Reserves space for the given number of entities.
   */
  reserve(count: number): void {
    // Pre-allocate indices to avoid reallocation
    for (let i = 0; i < count; i++) {
      this.freeIndices.push(this.nextIndex + i);
    }
    this.nextIndex += count;
  }
}
