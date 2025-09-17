// Common component hook implementations
/**
 * Common component hook implementations.
 */
export const CommonHooks = {
    /**
     * Logs when a component is added.
     */
    logOnAdd(componentType) {
        return (_world, entity, component) => {
            console.log(`Component ${componentType.name} added to entity ${entity.index}v${entity.generation}:`, component);
        };
    },
    /**
     * Logs when a component is removed.
     */
    logOnRemove(componentType) {
        return (_world, entity, component) => {
            console.log(`Component ${componentType.name} removed from entity ${entity.index}v${entity.generation}:`, component);
        };
    },
    /**
     * Validates component data on add.
     */
    validateOnAdd(componentType, validator) {
        return (_world, entity, component) => {
            if (!validator(component)) {
                console.warn(`Invalid component ${componentType.name} added to entity ${entity.index}v${entity.generation}`);
            }
        };
    },
    /**
     * Triggers an event when a component is added.
     */
    eventOnAdd(eventType) {
        return (_world, entity, component) => {
            // This would trigger an event in the event system
            console.log(`Event ${eventType} triggered for component added to entity ${entity.index}v${entity.generation}:`, component);
        };
    },
    /**
     * Updates a counter when a component is added.
     */
    counterOnAdd(counterResource) {
        return (world, _entity, _component) => {
            const counter = world.getResource(counterResource);
            if (counter) {
                counter.count++;
            }
        };
    },
    /**
     * Updates a counter when a component is removed.
     */
    counterOnRemove(counterResource) {
        return (world, _entity, _component) => {
            const counter = world.getResource(counterResource);
            if (counter) {
                counter.count--;
            }
        };
    },
    /**
     * Cleans up resources when a component is removed.
     */
    cleanupOnRemove(cleanup) {
        return (_world, _entity, component) => {
            cleanup(component);
        };
    },
    /**
     * Initializes component state on add.
     */
    initializeOnAdd(initializer) {
        return (_world, _entity, component) => {
            initializer(component);
        };
    },
};
