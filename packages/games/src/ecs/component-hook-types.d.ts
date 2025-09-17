import { Entity, Component, World } from "./types";
/**
 * Component hook function type.
 */
export type ComponentHook = (world: World, entity: Entity, component: Component) => void;
/**
 * Component hooks for lifecycle management.
 */
export interface ComponentHooks {
    readonly onAdd?: ComponentHook;
    readonly onInsert?: ComponentHook;
    readonly onReplace?: ComponentHook;
    readonly onRemove?: ComponentHook;
    readonly onDespawn?: ComponentHook;
}
/**
 * Creates component hooks.
 */
export declare function createComponentHooks(hooks: Partial<ComponentHooks>): ComponentHooks;
