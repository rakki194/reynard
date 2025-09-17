// Query state management for caching and optimization
/**
 * Query state manager for caching and optimization.
 */
export class QueryStateManager {
    constructor() {
        Object.defineProperty(this, "queryStates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "lastWorldUpdate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    /**
     * Gets or creates a query state.
     */
    getOrCreateQueryState(componentTypes, filter) {
        const key = this.getQueryKey(componentTypes, filter);
        let state = this.queryStates.get(key);
        if (!state) {
            state = {
                componentTypes,
                filter,
                lastUpdate: 0,
                cachedResults: [],
                isDirty: true,
            };
            this.queryStates.set(key, state);
        }
        return state;
    }
    /**
     * Updates a query state with new results.
     */
    updateQueryState(state, results) {
        state.cachedResults.length = 0;
        state.cachedResults.push(...results);
        state.lastUpdate = Date.now();
        state.isDirty = false;
    }
    /**
     * Marks a query state as dirty.
     */
    markDirty(state) {
        state.isDirty = true;
    }
    /**
     * Marks all query states as dirty.
     */
    markAllDirty() {
        for (const state of this.queryStates.values()) {
            state.isDirty = true;
        }
        this.lastWorldUpdate = Date.now();
    }
    /**
     * Checks if a query state needs updating.
     */
    needsUpdate(state) {
        return state.isDirty || state.lastUpdate < this.lastWorldUpdate;
    }
    /**
     * Gets cached results for a query state.
     */
    getCachedResults(state) {
        return state.cachedResults;
    }
    /**
     * Clears all query states.
     */
    clear() {
        this.queryStates.clear();
        this.lastWorldUpdate = 0;
    }
    /**
     * Gets the number of cached query states.
     */
    getStateCount() {
        return this.queryStates.size;
    }
    /**
     * Creates a query key for caching.
     */
    getQueryKey(componentTypes, filter) {
        const componentIds = componentTypes
            .map((ct) => ct.id)
            .sort()
            .join(",");
        const filterKey = this.getFilterKey(filter);
        return `${componentIds}:${filterKey}`;
    }
    /**
     * Creates a filter key for caching.
     */
    getFilterKey(filter) {
        const parts = [];
        if (filter.with) {
            parts.push(`with:${filter.with
                .map((ct) => ct.id)
                .sort()
                .join(",")}`);
        }
        if (filter.without) {
            parts.push(`without:${filter.without
                .map((ct) => ct.id)
                .sort()
                .join(",")}`);
        }
        if (filter.added) {
            parts.push(`added:${filter.added
                .map((ct) => ct.id)
                .sort()
                .join(",")}`);
        }
        if (filter.changed) {
            parts.push(`changed:${filter.changed
                .map((ct) => ct.id)
                .sort()
                .join(",")}`);
        }
        return parts.join("|");
    }
}
/**
 * Query state builder for creating optimized queries.
 */
export class QueryStateBuilder {
    constructor() {
        Object.defineProperty(this, "componentTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "filter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    /**
     * Adds a component type to the query.
     */
    with(componentType) {
        this.componentTypes.push(componentType);
        return this;
    }
    /**
     * Adds a filter to the query.
     */
    withFilter(filter) {
        this.filter = { ...this.filter, ...filter };
        return this;
    }
    /**
     * Builds the query state.
     */
    build(manager) {
        return manager.getOrCreateQueryState(this.componentTypes, this.filter);
    }
}
/**
 * Helper function to create a query state builder.
 */
export function queryState() {
    return new QueryStateBuilder();
}
