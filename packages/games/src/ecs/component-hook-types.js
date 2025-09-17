// Core types and interfaces for component hooks
/**
 * Creates component hooks.
 */
export function createComponentHooks(hooks) {
    return {
        onAdd: hooks.onAdd,
        onInsert: hooks.onInsert,
        onReplace: hooks.onReplace,
        onRemove: hooks.onRemove,
        onDespawn: hooks.onDespawn,
    };
}
