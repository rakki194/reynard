// World implementation - the central ECS container
import { StorageType, } from "./types";
import { Archetypes } from "./archetype";
import { ChangeDetectionImpl } from "./change-detection";
import { ComponentRegistry, ComponentStorage } from "./component";
import { EntityManager } from "./entity";
import { QueryBuilder, QueryImpl } from "./query";
import { ResourceRegistry, ResourceStorage } from "./resource";
/**
 * Commands implementation for deferred world modifications.
 */
export class CommandsImpl {
    constructor(world) {
        Object.defineProperty(this, "world", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: world
        });
        Object.defineProperty(this, "commands", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    spawn(...components) {
        const entity = this.world.spawnEmpty();
        this.world.insert(entity, ...components);
        return entity;
    }
    spawnEmpty() {
        return this.world.spawnEmpty();
    }
    despawn(entity) {
        this.commands.push(() => this.world.despawn(entity));
    }
    insert(entity, ...components) {
        this.world.insert(entity, ...components);
    }
    remove(entity, ...componentTypes) {
        this.commands.push(() => this.world.remove(entity, ...componentTypes));
    }
    insertResource(resource) {
        this.commands.push(() => this.world.insertResource(resource));
    }
    removeResource(resourceType) {
        this.commands.push(() => this.world.removeResource(resourceType));
    }
    /**
     * Applies all queued commands.
     */
    apply() {
        for (const command of this.commands) {
            command();
        }
        this.commands.length = 0;
    }
    /**
     * Clears all queued commands.
     */
    clear() {
        this.commands.length = 0;
    }
}
/**
 * World implementation.
 */
export class WorldImpl {
    constructor() {
        Object.defineProperty(this, "entityManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "componentRegistry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "componentStorage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resourceRegistry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resourceStorage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "systems", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "schedules", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "changeDetection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "archetypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "entityToArchetype", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        }); // entity index -> archetype id
        this.entityManager = new EntityManager();
        this.componentRegistry = new ComponentRegistry();
        this.componentStorage = new ComponentStorage();
        this.resourceRegistry = new ResourceRegistry();
        this.resourceStorage = new ResourceStorage();
        this.changeDetection = new ChangeDetectionImpl();
        this.archetypes = new Archetypes();
    }
    // Entity operations
    spawn(...components) {
        const entity = this.entityManager.allocate();
        this.insert(entity, ...components);
        return entity;
    }
    spawnEmpty() {
        return this.entityManager.allocate();
    }
    despawn(entity) {
        // Remove all components from the entity
        const componentTypes = this.componentRegistry.getAllTypes();
        for (const componentType of componentTypes) {
            const storage = this.componentStorage.getTableStorage(componentType) ||
                this.componentStorage.getSparseSetStorage(componentType);
            if (storage?.has(entity.index)) {
                storage.remove(entity.index);
                // Mark component as removed in change detection
                this.changeDetection.markRemoved(entity, componentType);
            }
        }
        // Remove entity from archetype
        const archetypeId = this.entityToArchetype.get(entity.index);
        if (archetypeId !== undefined) {
            const archetype = this.archetypes.getArchetype(archetypeId);
            if (archetype) {
                archetype.removeEntity(entity);
            }
            this.entityToArchetype.delete(entity.index);
        }
        return this.entityManager.free(entity);
    }
    contains(entity) {
        return this.entityManager.contains(entity);
    }
    isAlive(entity) {
        return this.entityManager.contains(entity);
    }
    // Component operations
    insert(entity, ...components) {
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
    // Alias for insert to match test expectations
    add(entity, componentType, component) {
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
    remove(entity, ...componentTypes) {
        if (!this.entityManager.contains(entity)) {
            return; // Safe to ignore operations on non-existent entities
        }
        for (const componentType of componentTypes) {
            const storage = this.componentStorage.getTableStorage(componentType) ||
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
    get(entity, componentType) {
        if (!this.entityManager.contains(entity)) {
            return undefined;
        }
        const storage = this.componentStorage.getTableStorage(componentType) ||
            this.componentStorage.getSparseSetStorage(componentType);
        return storage?.get(entity.index);
    }
    getMut(entity, componentType) {
        // For now, same as get - in a real implementation, this would track mutability
        return this.get(entity, componentType);
    }
    has(entity, componentType) {
        if (!this.entityManager.contains(entity)) {
            return false;
        }
        const storage = this.componentStorage.getTableStorage(componentType) ||
            this.componentStorage.getSparseSetStorage(componentType);
        return storage?.has(entity.index) ?? false;
    }
    // Resource operations
    insertResource(resource) {
        const resourceType = this.findResourceType(resource);
        if (!resourceType) {
            throw new Error(`Resource type not registered: ${resource.constructor.name}`);
        }
        this.resourceStorage.insert(resourceType, resource);
    }
    // Alias for insertResource to match test expectations
    addResource(resourceType, resource) {
        this.resourceStorage.insert(resourceType, resource);
    }
    removeResource(resourceType) {
        return this.resourceStorage.remove(resourceType);
    }
    getResource(resourceType) {
        return this.resourceStorage.get(resourceType);
    }
    getResourceMut(resourceType) {
        // For now, same as get - in a real implementation, this would track mutability
        return this.resourceStorage.get(resourceType);
    }
    hasResource(resourceType) {
        return this.resourceStorage.has(resourceType);
    }
    // Query operations
    query(...componentTypes) {
        const builder = new QueryBuilder();
        for (const componentType of componentTypes) {
            builder.with(componentType);
        }
        // Add methods that have access to world context
        return Object.assign(builder, {
            forEach: (callback) => {
                const query = builder.build();
                const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
                result.forEach(callback);
            },
            first: () => {
                const query = builder.build();
                const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
                return result.first();
            },
            added: (componentType) => {
                const query = builder.build();
                const addedQuery = query.added(componentType);
                // Return a new query builder with the added filter
                const newBuilder = new QueryBuilder();
                newBuilder.componentTypes = [...builder.componentTypes];
                newBuilder.filters = {
                    ...builder.filters,
                    added: [...(builder.filters.added || []), componentType],
                };
                return Object.assign(newBuilder, {
                    forEach: (callback) => {
                        const result = addedQuery.execute(this.entityManager, this.componentStorage, this.changeDetection);
                        result.forEach(callback);
                    },
                    first: () => {
                        const result = addedQuery.execute(this.entityManager, this.componentStorage, this.changeDetection);
                        return result.first();
                    },
                    with: (newComponentType) => {
                        newBuilder.with(newComponentType);
                        return Object.assign(newBuilder, {
                            forEach: (callback) => {
                                const query = newBuilder.build();
                                const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
                                result.forEach(callback);
                            },
                            first: () => {
                                const query = newBuilder.build();
                                const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
                                return result.first();
                            },
                        });
                    },
                });
            },
            changed: (componentType) => {
                const query = builder.build();
                const changedQuery = query.changed(componentType);
                // Return a new query builder with the changed filter
                const newBuilder = new QueryBuilder();
                newBuilder.componentTypes = [...builder.componentTypes];
                newBuilder.filters = {
                    ...builder.filters,
                    changed: [...(builder.filters.changed || []), componentType],
                };
                return Object.assign(newBuilder, {
                    forEach: (callback) => {
                        const result = changedQuery.execute(this.entityManager, this.componentStorage, this.changeDetection);
                        result.forEach(callback);
                    },
                    first: () => {
                        const result = changedQuery.execute(this.entityManager, this.componentStorage, this.changeDetection);
                        return result.first();
                    },
                    with: (newComponentType) => {
                        newBuilder.with(newComponentType);
                        return Object.assign(newBuilder, {
                            forEach: (callback) => {
                                const query = newBuilder.build();
                                const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
                                result.forEach(callback);
                            },
                            first: () => {
                                const query = newBuilder.build();
                                const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
                                return result.first();
                            },
                        });
                    },
                });
            },
            removed: (componentType) => {
                const query = builder.build();
                const removedQuery = query.removed(componentType);
                // Return a new query builder with the removed filter
                const newBuilder = new QueryBuilder();
                newBuilder.componentTypes = [...builder.componentTypes];
                newBuilder.filters = {
                    ...builder.filters,
                    removed: [...(builder.filters.removed || []), componentType],
                };
                return Object.assign(newBuilder, {
                    forEach: (callback) => {
                        const result = removedQuery.execute(this.entityManager, this.componentStorage, this.changeDetection);
                        result.forEach(callback);
                    },
                    first: () => {
                        const result = removedQuery.execute(this.entityManager, this.componentStorage, this.changeDetection);
                        return result.first();
                    },
                    with: (newComponentType) => {
                        newBuilder.with(newComponentType);
                        return Object.assign(newBuilder, {
                            forEach: (callback) => {
                                const query = newBuilder.build();
                                const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
                                result.forEach(callback);
                            },
                            first: () => {
                                const query = newBuilder.build();
                                const result = query.execute(this.entityManager, this.componentStorage, this.changeDetection);
                                return result.first();
                            },
                        });
                    },
                });
            },
        });
    }
    queryFiltered(componentTypes, filter) {
        const query = new QueryImpl(componentTypes, filter);
        return query.execute(this.entityManager, this.componentStorage, this.changeDetection);
    }
    // System operations
    addSystem(system) {
        this.systems.set(system.name, system);
    }
    removeSystem(systemName) {
        this.systems.delete(systemName);
    }
    runSystem(systemName) {
        const system = this.systems.get(systemName);
        if (!system) {
            throw new Error(`System '${systemName}' not found`);
        }
        system.run(this);
    }
    runSchedule(scheduleName) {
        const schedule = this.schedules.get(scheduleName);
        if (!schedule) {
            throw new Error(`Schedule '${scheduleName}' not found`);
        }
        schedule.run(this);
    }
    // Commands
    commands() {
        return new CommandsImpl(this);
    }
    // Statistics
    getEntityCount() {
        return this.entityManager.getEntityCount();
    }
    getComponentCount(componentType) {
        const storage = this.componentStorage.getTableStorage(componentType) ||
            this.componentStorage.getSparseSetStorage(componentType);
        return storage?.getCount() ?? 0;
    }
    // Registry access
    getComponentRegistry() {
        return this.componentRegistry;
    }
    getResourceRegistry() {
        return this.resourceRegistry;
    }
    // Archetype access
    getArchetype(entity) {
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
        const componentTypes = [];
        for (const componentType of this.componentRegistry.getAllTypes()) {
            if (this.has(entity, componentType)) {
                componentTypes.push(componentType);
            }
        }
        return archetype;
    }
    // Change detection access for tests
    getChangeDetection() {
        return this.changeDetection;
    }
    // Helper methods
    findComponentType(component) {
        const componentName = component.constructor.name;
        let componentType = this.componentRegistry.getByName(componentName);
        // Auto-register component type if not found, but only for valid component classes
        if (!componentType &&
            component.constructor !== Object &&
            componentName !== "Object") {
            componentType = this.componentRegistry.register(componentName, StorageType.Table, () => new component.constructor());
        }
        return componentType;
    }
    /**
     * Updates an entity's archetype based on its current components.
     */
    updateEntityArchetype(entity) {
        // Get the component types for this entity
        const componentTypes = [];
        for (const componentType of this.componentRegistry.getAllTypes()) {
            if (this.has(entity, componentType)) {
                componentTypes.push(componentType);
            }
        }
        // Get or create the archetype for these component types
        const newArchetypeId = this.archetypes.getOrCreateArchetype(componentTypes);
        const oldArchetypeId = this.entityToArchetype.get(entity.index);
        // If the archetype changed, move the entity
        if (oldArchetypeId === undefined ||
            oldArchetypeId.index !== newArchetypeId.index) {
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
    findResourceType(resource) {
        const resourceName = resource.constructor.name;
        let resourceType = this.resourceRegistry.getByName(resourceName);
        // Auto-register resource type if not found
        if (!resourceType) {
            resourceType = this.resourceRegistry.register(resourceName, () => new resource.constructor());
        }
        return resourceType;
    }
}
/**
 * Creates a new world instance.
 */
export function createWorld() {
    return new WorldImpl();
}
