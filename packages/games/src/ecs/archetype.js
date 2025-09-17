// Archetype system implementation - groups entities with same component layout
/**
 * Creates a new archetype row.
 */
export function createArchetypeRow(index) {
    return { index };
}
/**
 * Creates a new archetype ID.
 */
export function createArchetypeId(index) {
    return { index };
}
/**
 * Special archetype IDs.
 */
export const ARCHETYPE_IDS = {
    EMPTY: createArchetypeId(0),
    INVALID: createArchetypeId(Number.MAX_SAFE_INTEGER),
};
/**
 * Special archetype rows.
 */
export const ARCHETYPE_ROWS = {
    INVALID: createArchetypeRow(Number.MAX_SAFE_INTEGER),
};
/**
 * An archetype represents a group of entities that have the same set of components.
 * This is the core optimization in ECS - entities with the same component layout
 * are stored together for efficient iteration.
 */
export class Archetype {
    constructor(id, componentTypes) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: id
        });
        Object.defineProperty(this, "componentTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: componentTypes
        });
        Object.defineProperty(this, "entities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "entityToRow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "rowToEntity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "componentTypeIds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "tableId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        // Store component type IDs for fast lookup
        for (const componentType of componentTypes) {
            this.componentTypeIds.add(componentType.id);
        }
    }
    /**
     * Adds an entity to this archetype.
     */
    addEntity(entity) {
        const row = createArchetypeRow(this.entities.length);
        this.entities.push(entity);
        this.entityToRow.set(entity.index, row);
        this.rowToEntity.set(row.index, entity);
        return row;
    }
    /**
     * Removes an entity from this archetype.
     */
    removeEntity(entity) {
        const row = this.entityToRow.get(entity.index);
        if (!row)
            return false;
        // Move last entity to this position to maintain dense storage
        const lastIndex = this.entities.length - 1;
        if (row.index !== lastIndex) {
            const lastEntity = this.rowToEntity.get(lastIndex);
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
    getEntityRow(entity) {
        return this.entityToRow.get(entity.index);
    }
    /**
     * Gets the entity at a specific row.
     */
    getEntityAtRow(row) {
        return this.rowToEntity.get(row.index);
    }
    /**
     * Gets all entities in this archetype.
     */
    getEntities() {
        return [...this.entities];
    }
    /**
     * Gets the number of entities in this archetype.
     */
    getEntityCount() {
        return this.entities.length;
    }
    /**
     * Checks if an entity is in this archetype.
     */
    hasEntity(entity) {
        return this.entityToRow.has(entity.index);
    }
    /**
     * Checks if this archetype contains a specific component type.
     */
    hasComponentType(componentType) {
        return this.componentTypeIds.has(componentType.id);
    }
    /**
     * Gets all component types in this archetype.
     */
    getComponentTypes() {
        return this.componentTypes;
    }
    /**
     * Sets the table ID for this archetype.
     */
    setTableId(tableId) {
        this.tableId = tableId;
    }
    /**
     * Gets the table ID for this archetype.
     */
    getTableId() {
        return this.tableId;
    }
    /**
     * Checks if this archetype is empty.
     */
    isEmpty() {
        return this.entities.length === 0;
    }
    /**
     * Gets the number of component types in this archetype.
     */
    getComponentCount() {
        return this.componentTypes.length;
    }
    /**
     * Checks if this archetype has a specific component type.
     * Alias for hasComponentType for test compatibility.
     */
    hasComponent(componentType) {
        return this.hasComponentType(componentType);
    }
}
/**
 * Manages all archetypes in a world.
 */
export class Archetypes {
    constructor() {
        Object.defineProperty(this, "archetypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "componentLayoutToArchetype", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "nextId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        }); // Start at 1, 0 is reserved for EMPTY
        // Create the empty archetype
        const emptyArchetype = new Archetype(ARCHETYPE_IDS.EMPTY, []);
        this.archetypes.push(emptyArchetype);
        this.componentLayoutToArchetype.set("", ARCHETYPE_IDS.EMPTY);
    }
    /**
     * Gets or creates an archetype for the given component types.
     */
    getOrCreateArchetype(componentTypes) {
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
    getArchetype(id) {
        return this.archetypes[id.index];
    }
    /**
     * Gets all archetypes.
     */
    getAllArchetypes() {
        return [...this.archetypes];
    }
    /**
     * Gets the number of archetypes.
     */
    getArchetypeCount() {
        return this.archetypes.length;
    }
    /**
     * Finds an archetype that contains the given component types.
     */
    findArchetypeWithComponents(componentTypes) {
        const layoutKey = this.getComponentLayoutKey(componentTypes);
        return this.componentLayoutToArchetype.get(layoutKey);
    }
    /**
     * Creates a component layout key for archetype lookup.
     */
    getComponentLayoutKey(componentTypes) {
        return componentTypes
            .map((ct) => ct.id)
            .sort((a, b) => a - b)
            .join(",");
    }
    /**
     * Clears all archetypes.
     */
    clear() {
        this.archetypes.length = 0;
        this.componentLayoutToArchetype.clear();
        this.nextId = 1;
        // Recreate empty archetype
        const emptyArchetype = new Archetype(ARCHETYPE_IDS.EMPTY, []);
        this.archetypes.push(emptyArchetype);
        this.componentLayoutToArchetype.set("", ARCHETYPE_IDS.EMPTY);
    }
}
