// Entity implementation with generational indexing
/**
 * Creates a new entity location.
 */
export function createEntityLocation(archetypeId, archetypeRow, tableId, tableRow) {
    return { archetypeId, archetypeRow, tableId, tableRow };
}
/**
 * Special entity location for invalid entities.
 */
export const ENTITY_LOCATION_INVALID = {
    archetypeId: { index: Number.MAX_SAFE_INTEGER },
    archetypeRow: { index: Number.MAX_SAFE_INTEGER },
    tableId: Number.MAX_SAFE_INTEGER,
    tableRow: Number.MAX_SAFE_INTEGER,
};
/**
 * Creates a new entity with the given index and generation.
 */
export function createEntity(index, generation) {
    return { index, generation };
}
/**
 * Creates a placeholder entity for initialization.
 */
export function createPlaceholderEntity() {
    return { index: Number.MAX_SAFE_INTEGER, generation: 0 };
}
/**
 * Checks if an entity is a placeholder.
 */
export function isPlaceholderEntity(entity) {
    return entity.index === Number.MAX_SAFE_INTEGER;
}
/**
 * Converts entity to a unique string representation.
 */
export function entityToString(entity) {
    if (isPlaceholderEntity(entity)) {
        return "PLACEHOLDER";
    }
    return `${entity.index}v${entity.generation}`;
}
/**
 * Converts entity to bits for efficient storage and comparison.
 */
export function entityToBits(entity) {
    // Pack index and generation into a single number
    // Using 16 bits for index and 16 bits for generation to avoid overflow
    return (entity.generation << 16) | entity.index;
}
/**
 * Reconstructs entity from bits.
 */
export function entityFromBits(bits) {
    const index = bits & 0xffff;
    const generation = (bits >>> 16) & 0xffff;
    return { index, generation };
}
/**
 * Compares two entities for equality.
 */
export function entityEquals(a, b) {
    return a.index === b.index && a.generation === b.generation;
}
/**
 * Compares two entities for ordering.
 */
export function entityCompare(a, b) {
    // First compare by generation, then by index
    const genDiff = a.generation - b.generation;
    if (genDiff !== 0)
        return genDiff;
    return a.index - b.index;
}
/**
 * Entity manager for handling entity lifecycle.
 */
export class EntityManager {
    constructor() {
        Object.defineProperty(this, "entities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "entityMeta", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "nextIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "freeIndices", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "generations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Allocates a new entity.
     */
    allocate() {
        let index;
        let generation;
        if (this.freeIndices.length > 0) {
            // Reuse a freed index
            index = this.freeIndices.pop();
            generation = (this.generations.get(index) || 0) + 1;
        }
        else {
            // Use a new index
            index = this.nextIndex++;
            generation = 1;
        }
        this.generations.set(index, generation);
        const entity = createEntity(index, generation);
        const meta = {
            generation,
            location: ENTITY_LOCATION_INVALID,
        };
        this.entities.set(index, entity);
        this.entityMeta.set(index, meta);
        return entity;
    }
    /**
     * Frees an entity, allowing its index to be reused.
     */
    free(entity) {
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
    contains(entity) {
        const existing = this.entities.get(entity.index);
        return existing !== undefined && existing.generation === entity.generation;
    }
    /**
     * Gets the current entity for an index, if it exists.
     */
    getEntity(index) {
        return this.entities.get(index);
    }
    /**
     * Gets entity metadata for an entity.
     */
    getEntityMeta(entity) {
        const existing = this.entities.get(entity.index);
        if (!existing || existing.generation !== entity.generation) {
            return undefined;
        }
        return this.entityMeta.get(entity.index);
    }
    /**
     * Sets entity metadata.
     */
    setEntityMeta(entity, meta) {
        const existing = this.entities.get(entity.index);
        if (!existing || existing.generation !== entity.generation) {
            throw new Error(`Entity ${entity.index}v${entity.generation} does not exist`);
        }
        this.entityMeta.set(entity.index, meta);
    }
    /**
     * Gets all currently allocated entities.
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }
    /**
     * Gets the number of allocated entities.
     */
    getEntityCount() {
        return this.entities.size;
    }
    /**
     * Clears all entities.
     */
    clear() {
        this.entities.clear();
        this.entityMeta.clear();
        this.freeIndices.length = 0;
        this.generations.clear();
        this.nextIndex = 0;
    }
    /**
     * Reserves space for the given number of entities.
     */
    reserve(count) {
        // Pre-allocate indices to avoid reallocation
        for (let i = 0; i < count; i++) {
            this.freeIndices.push(this.nextIndex + i);
        }
        this.nextIndex += count;
    }
}
