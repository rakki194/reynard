// Query system implementation for component access
/**
 * Query result implementation.
 */
export class QueryResultImpl {
    constructor(entities, components, length, componentTypes = [], entityComponents = new Map()) {
        Object.defineProperty(this, "entities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: entities
        });
        Object.defineProperty(this, "components", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: components
        });
        Object.defineProperty(this, "length", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: length
        });
        Object.defineProperty(this, "componentTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: componentTypes
        });
        Object.defineProperty(this, "entityComponents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: entityComponents
        });
    }
    forEach(callback) {
        for (let i = 0; i < this.length; i++) {
            const entity = this.entities[i];
            const componentValues = this.getComponentValuesForEntity(i);
            const result = callback(entity, ...componentValues);
            if (result === false) {
                break; // Early termination
            }
        }
    }
    map(callback) {
        const results = [];
        for (let i = 0; i < this.length; i++) {
            const entity = this.entities[i];
            const componentValues = this.getComponentValuesForEntity(i);
            results.push(callback(entity, ...componentValues));
        }
        return results;
    }
    filter(predicate) {
        const filteredEntities = [];
        const filteredEntityComponents = new Map();
        for (let i = 0; i < this.length; i++) {
            const entity = this.entities[i];
            const componentValues = this.getComponentValuesForEntity(i);
            if (predicate(entity, ...componentValues)) {
                filteredEntities.push(entity);
                filteredEntityComponents.set(entity.index, componentValues);
            }
        }
        // Create a flat array of all components for backward compatibility
        const allComponents = [];
        for (const components of filteredEntityComponents.values()) {
            allComponents.push(...components);
        }
        return new QueryResultImpl(filteredEntities, allComponents, filteredEntities.length, this.componentTypes, filteredEntityComponents);
    }
    first() {
        if (this.length === 0) {
            return undefined;
        }
        const entity = this.entities[0];
        const components = this.getComponentValuesForEntity(0);
        return { entity, components };
    }
    getComponentValuesForEntity(entityIndex) {
        const entity = this.entities[entityIndex];
        const components = this.entityComponents.get(entity.index);
        if (!components) {
            throw new Error(`No components found for entity ${entity.index}`);
        }
        return components;
    }
}
/**
 * Query builder for constructing component queries.
 */
export class QueryBuilder {
    constructor() {
        Object.defineProperty(this, "componentTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "filters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    with(componentType) {
        this.componentTypes.push(componentType);
        return this;
    }
    without(componentType) {
        this.filters = {
            ...this.filters,
            without: [
                ...(this.filters.without || []),
                componentType,
            ],
        };
        return this;
    }
    filter(filter) {
        this.filters = { ...this.filters, ...filter };
        return this;
    }
    build() {
        return new QueryImpl(this.componentTypes, this.filters);
    }
    // Make QueryBuilder executable like QueryResult
    execute(entityManager, componentStorage, changeDetection) {
        return this.build().execute(entityManager, componentStorage, changeDetection);
    }
    forEach(_callback) {
        // This will be called by the test, but we need the world context
        throw new Error("QueryBuilder.forEach() requires world context - use world.query() instead");
    }
}
/**
 * Query implementation.
 */
export class QueryImpl {
    constructor(componentTypes, filters) {
        Object.defineProperty(this, "componentTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: componentTypes
        });
        Object.defineProperty(this, "filters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: filters
        });
    }
    // Add change detection methods for tests
    added(componentType) {
        const newFilters = {
            ...this.filters,
            added: [...(this.filters.added || []), componentType],
        };
        return new QueryImpl(this.componentTypes, newFilters);
    }
    changed(componentType) {
        const newFilters = {
            ...this.filters,
            changed: [...(this.filters.changed || []), componentType],
        };
        return new QueryImpl(this.componentTypes, newFilters);
    }
    removed(componentType) {
        const newFilters = {
            ...this.filters,
            removed: [...(this.filters.removed || []), componentType],
        };
        return new QueryImpl(this.componentTypes, newFilters);
    }
    execute(entityManager, componentStorage, changeDetection) {
        const matchingEntities = [];
        const entityComponents = new Map();
        const allEntities = entityManager.getAllEntities();
        for (const entity of allEntities) {
            if (this.hasAllComponents(entity, componentStorage) &&
                this.passesFilters(entity, componentStorage, changeDetection)) {
                matchingEntities.push(entity);
                const components = this.getEntityComponents(entity, componentStorage);
                entityComponents.set(entity.index, components);
            }
        }
        // Create a flat array of all components for backward compatibility
        const allComponents = [];
        for (const components of entityComponents.values()) {
            allComponents.push(...components);
        }
        return new QueryResultImpl(matchingEntities, allComponents, matchingEntities.length, this.componentTypes, entityComponents);
    }
    hasAllComponents(entity, storage) {
        return this.componentTypes.every((type) => {
            const tableStorage = storage.getTableStorage(type);
            const sparseStorage = storage.getSparseSetStorage(type);
            return ((tableStorage?.has(entity.index) || sparseStorage?.has(entity.index)) ??
                false);
        });
    }
    getEntityComponents(entity, storage) {
        return this.componentTypes.map((type) => {
            const tableStorage = storage.getTableStorage(type);
            const sparseStorage = storage.getSparseSetStorage(type);
            return (tableStorage?.get(entity.index) ||
                sparseStorage?.get(entity.index));
        });
    }
    passesFilters(entity, storage, changeDetection) {
        if (this.filters.with && !this.checkWithFilter(entity, storage))
            return false;
        if (this.filters.without && this.checkWithoutFilter(entity, storage))
            return false;
        if (this.filters.added &&
            changeDetection &&
            !this.checkAddedFilter(entity, changeDetection))
            return false;
        if (this.filters.changed &&
            changeDetection &&
            !this.checkChangedFilter(entity, changeDetection))
            return false;
        if (this.filters.removed &&
            changeDetection &&
            !this.checkRemovedFilter(entity, changeDetection))
            return false;
        return true;
    }
    checkWithFilter(entity, storage) {
        return this.filters.with.every((type) => {
            const tableStorage = storage.getTableStorage(type);
            const sparseStorage = storage.getSparseSetStorage(type);
            return ((tableStorage?.has(entity.index) || sparseStorage?.has(entity.index)) ??
                false);
        });
    }
    checkWithoutFilter(entity, storage) {
        return this.filters.without.some((type) => {
            const tableStorage = storage.getTableStorage(type);
            const sparseStorage = storage.getSparseSetStorage(type);
            return ((tableStorage?.has(entity.index) || sparseStorage?.has(entity.index)) ??
                false);
        });
    }
    checkAddedFilter(entity, changeDetection) {
        return this.filters.added.every((type) => changeDetection.isAdded(entity, type));
    }
    checkChangedFilter(entity, changeDetection) {
        return this.filters.changed.every((type) => changeDetection.isChanged(entity, type));
    }
    checkRemovedFilter(entity, changeDetection) {
        return this.filters.removed.every((type) => changeDetection.isRemoved(entity, type));
    }
}
export function query() {
    return new QueryBuilder();
}
