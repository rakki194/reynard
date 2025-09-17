// Component hook registry for managing hooks
/**
 * Component hook registry for managing hooks.
 */
export class ComponentHookRegistry {
    constructor() {
        Object.defineProperty(this, "hooks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Registers hooks for a component type.
     */
    registerHooks(componentType, hooks) {
        this.hooks.set(componentType.id, hooks);
    }
    /**
     * Gets hooks for a component type.
     */
    getHooks(componentType) {
        return this.hooks.get(componentType.id);
    }
    /**
     * Executes the onAdd hook for a component.
     */
    executeOnAdd(world, entity, componentType, component) {
        const hooks = this.getHooks(componentType);
        if (hooks?.onAdd) {
            hooks.onAdd(world, entity, component);
        }
    }
    /**
     * Executes the onInsert hook for a component.
     */
    executeOnInsert(world, entity, componentType, component) {
        const hooks = this.getHooks(componentType);
        if (hooks?.onInsert) {
            hooks.onInsert(world, entity, component);
        }
    }
    /**
     * Executes the onReplace hook for a component.
     */
    executeOnReplace(world, entity, componentType, _oldComponent, newComponent) {
        const hooks = this.getHooks(componentType);
        if (hooks?.onReplace) {
            hooks.onReplace(world, entity, newComponent);
        }
    }
    /**
     * Executes the onRemove hook for a component.
     */
    executeOnRemove(world, entity, componentType, component) {
        const hooks = this.getHooks(componentType);
        if (hooks?.onRemove) {
            hooks.onRemove(world, entity, component);
        }
    }
    /**
     * Executes the onDespawn hook for a component.
     */
    executeOnDespawn(world, entity, componentType, component) {
        const hooks = this.getHooks(componentType);
        if (hooks?.onDespawn) {
            hooks.onDespawn(world, entity, component);
        }
    }
    /**
     * Clears all hooks.
     */
    clear() {
        this.hooks.clear();
    }
}
