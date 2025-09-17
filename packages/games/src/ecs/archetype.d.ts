import { Component, ComponentType, Entity } from "./types";
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
export declare function createArchetypeRow(index: number): ArchetypeRow;
/**
 * Creates a new archetype ID.
 */
export declare function createArchetypeId(index: number): ArchetypeId;
/**
 * Special archetype IDs.
 */
export declare const ARCHETYPE_IDS: {
    readonly EMPTY: ArchetypeId;
    readonly INVALID: ArchetypeId;
};
/**
 * Special archetype rows.
 */
export declare const ARCHETYPE_ROWS: {
    readonly INVALID: ArchetypeRow;
};
/**
 * An archetype represents a group of entities that have the same set of components.
 * This is the core optimization in ECS - entities with the same component layout
 * are stored together for efficient iteration.
 */
export declare class Archetype {
    readonly id: ArchetypeId;
    readonly componentTypes: ComponentType<Component>[];
    private entities;
    private entityToRow;
    private rowToEntity;
    private componentTypeIds;
    private tableId;
    constructor(id: ArchetypeId, componentTypes: ComponentType<Component>[]);
    /**
     * Adds an entity to this archetype.
     */
    addEntity(entity: Entity): ArchetypeRow;
    /**
     * Removes an entity from this archetype.
     */
    removeEntity(entity: Entity): boolean;
    /**
     * Gets the row of an entity in this archetype.
     */
    getEntityRow(entity: Entity): ArchetypeRow | undefined;
    /**
     * Gets the entity at a specific row.
     */
    getEntityAtRow(row: ArchetypeRow): Entity | undefined;
    /**
     * Gets all entities in this archetype.
     */
    getEntities(): Entity[];
    /**
     * Gets the number of entities in this archetype.
     */
    getEntityCount(): number;
    /**
     * Checks if an entity is in this archetype.
     */
    hasEntity(entity: Entity): boolean;
    /**
     * Checks if this archetype contains a specific component type.
     */
    hasComponentType(componentType: ComponentType<Component>): boolean;
    /**
     * Gets all component types in this archetype.
     */
    getComponentTypes(): ComponentType<Component>[];
    /**
     * Sets the table ID for this archetype.
     */
    setTableId(tableId: number): void;
    /**
     * Gets the table ID for this archetype.
     */
    getTableId(): number;
    /**
     * Checks if this archetype is empty.
     */
    isEmpty(): boolean;
    /**
     * Gets the number of component types in this archetype.
     */
    getComponentCount(): number;
    /**
     * Checks if this archetype has a specific component type.
     * Alias for hasComponentType for test compatibility.
     */
    hasComponent(componentType: ComponentType<Component>): boolean;
}
/**
 * Manages all archetypes in a world.
 */
export declare class Archetypes {
    private archetypes;
    private componentLayoutToArchetype;
    private nextId;
    constructor();
    /**
     * Gets or creates an archetype for the given component types.
     */
    getOrCreateArchetype(componentTypes: ComponentType<Component>[]): ArchetypeId;
    /**
     * Gets an archetype by ID.
     */
    getArchetype(id: ArchetypeId): Archetype | undefined;
    /**
     * Gets all archetypes.
     */
    getAllArchetypes(): Archetype[];
    /**
     * Gets the number of archetypes.
     */
    getArchetypeCount(): number;
    /**
     * Finds an archetype that contains the given component types.
     */
    findArchetypeWithComponents(componentTypes: ComponentType<Component>[]): ArchetypeId | undefined;
    /**
     * Creates a component layout key for archetype lookup.
     */
    private getComponentLayoutKey;
    /**
     * Clears all archetypes.
     */
    clear(): void;
}
