// Change detection system for tracking component modifications
/**
 * Creates a new tick.
 */
export function createTick(value) {
    return {
        value,
        isNewerThan(other) {
            return this.value > other.value;
        },
    };
}
/**
 * Creates component ticks.
 */
export function createComponentTicks(added, changed, removed) {
    return { added, changed, removed };
}
/**
 * Change detection implementation.
 */
export class ChangeDetectionImpl {
    constructor() {
        Object.defineProperty(this, "componentTicks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "currentTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: createTick(0)
        });
        Object.defineProperty(this, "lastCheckTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: createTick(0)
        });
    }
    /**
     * Increments the current tick.
     */
    incrementTick() {
        this.currentTick = createTick(this.currentTick.value + 1);
    }
    /**
     * Creates a new tick (advances tick and returns it for test compatibility).
     */
    createTick() {
        this.incrementTick();
        return this.currentTick;
    }
    /**
     * Advances the tick (alias for incrementTick for test compatibility).
     */
    advanceTick() {
        this.incrementTick();
        // Clean up removed components after advancing tick
        for (const [key, ticks] of this.componentTicks.entries()) {
            if (ticks.removed) {
                this.componentTicks.delete(key);
            }
        }
    }
    /**
     * Sets the last check tick.
     */
    setLastCheckTick(tick) {
        this.lastCheckTick = tick;
    }
    /**
     * Gets the current tick.
     */
    getCurrentTick() {
        return this.currentTick;
    }
    /**
     * Gets the last check tick.
     */
    getLastCheckTick() {
        return this.lastCheckTick;
    }
    /**
     * Marks a component as added.
     */
    markAdded(entity, componentType) {
        const key = this.getComponentKey(entity, componentType);
        this.componentTicks.set(key, createComponentTicks(this.currentTick, this.currentTick));
    }
    /**
     * Marks a component as changed.
     */
    markChanged(entity, componentType) {
        const key = this.getComponentKey(entity, componentType);
        const existing = this.componentTicks.get(key);
        if (existing) {
            this.componentTicks.set(key, createComponentTicks(existing.added, this.currentTick));
        }
        else {
            this.componentTicks.set(key, createComponentTicks(this.currentTick, this.currentTick));
        }
    }
    /**
     * Marks a component as removed.
     */
    markRemoved(entity, componentType) {
        const key = this.getComponentKey(entity, componentType);
        const existing = this.componentTicks.get(key);
        if (existing) {
            this.componentTicks.set(key, createComponentTicks(existing.added, existing.changed, this.currentTick));
        }
    }
    /**
     * Checks if a component was added since the last check.
     */
    isAdded(entity, componentType) {
        const key = this.getComponentKey(entity, componentType);
        const ticks = this.componentTicks.get(key);
        if (!ticks)
            return false;
        // Component is added if it was added after the last check tick
        return ticks.added.isNewerThan(this.lastCheckTick);
    }
    /**
     * Checks if a component was changed since the last check.
     */
    isChanged(entity, componentType) {
        const key = this.getComponentKey(entity, componentType);
        const ticks = this.componentTicks.get(key);
        if (!ticks)
            return false;
        // Component is changed if it was changed after the last check tick
        return ticks.changed.isNewerThan(this.lastCheckTick);
    }
    /**
     * Checks if a component was removed since the last check.
     */
    isRemoved(entity, componentType) {
        const key = this.getComponentKey(entity, componentType);
        const ticks = this.componentTicks.get(key);
        if (!ticks)
            return false;
        // Component is removed if it was removed after the last check tick
        return ticks.removed
            ? ticks.removed.isNewerThan(this.lastCheckTick)
            : false;
    }
    /**
     * Gets the component ticks for an entity and component type.
     */
    getComponentTicks(entity, componentType) {
        const key = this.getComponentKey(entity, componentType);
        return this.componentTicks.get(key);
    }
    /**
     * Clears all change detection data.
     */
    clear() {
        this.componentTicks.clear();
        this.currentTick = createTick(0);
        this.lastCheckTick = createTick(0);
    }
    /**
     * Gets the component key for tracking.
     */
    getComponentKey(entity, componentType) {
        return `${entity.index}v${entity.generation}:${componentType.id}`;
    }
}
