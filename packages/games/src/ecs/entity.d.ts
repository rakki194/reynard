import { Entity } from "./types";
import { ArchetypeId, ArchetypeRow } from "./archetype";
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
export declare function createEntityLocation(archetypeId: ArchetypeId, archetypeRow: ArchetypeRow, tableId: number, tableRow: number): EntityLocation;
/**
 * Special entity location for invalid entities.
 */
export declare const ENTITY_LOCATION_INVALID: EntityLocation;
/**
 * Creates a new entity with the given index and generation.
 */
export declare function createEntity(index: number, generation: number): Entity;
/**
 * Creates a placeholder entity for initialization.
 */
export declare function createPlaceholderEntity(): Entity;
/**
 * Checks if an entity is a placeholder.
 */
export declare function isPlaceholderEntity(entity: Entity): boolean;
/**
 * Converts entity to a unique string representation.
 */
export declare function entityToString(entity: Entity): string;
/**
 * Converts entity to bits for efficient storage and comparison.
 */
export declare function entityToBits(entity: Entity): number;
/**
 * Reconstructs entity from bits.
 */
export declare function entityFromBits(bits: number): Entity;
/**
 * Compares two entities for equality.
 */
export declare function entityEquals(a: Entity, b: Entity): boolean;
/**
 * Compares two entities for ordering.
 */
export declare function entityCompare(a: Entity, b: Entity): number;
/**
 * Entity metadata stored in the entity manager.
 */
export interface EntityMeta {
    readonly generation: number;
    readonly location: EntityLocation;
    readonly spawnedOrDespawnedBy?: string;
}
/**
 * Entity manager for handling entity lifecycle.
 */
export declare class EntityManager {
    private entities;
    private entityMeta;
    private nextIndex;
    private freeIndices;
    private generations;
    /**
     * Allocates a new entity.
     */
    allocate(): Entity;
    /**
     * Frees an entity, allowing its index to be reused.
     */
    free(entity: Entity): boolean;
    /**
     * Checks if an entity exists and is valid.
     */
    contains(entity: Entity): boolean;
    /**
     * Gets the current entity for an index, if it exists.
     */
    getEntity(index: number): Entity | undefined;
    /**
     * Gets entity metadata for an entity.
     */
    getEntityMeta(entity: Entity): EntityMeta | undefined;
    /**
     * Sets entity metadata.
     */
    setEntityMeta(entity: Entity, meta: EntityMeta): void;
    /**
     * Gets all currently allocated entities.
     */
    getAllEntities(): Entity[];
    /**
     * Gets the number of allocated entities.
     */
    getEntityCount(): number;
    /**
     * Clears all entities.
     */
    clear(): void;
    /**
     * Reserves space for the given number of entities.
     */
    reserve(count: number): void;
}
