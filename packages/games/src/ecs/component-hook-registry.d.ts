import { Entity, Component, ComponentType, World } from "./types";
import { ComponentHooks } from "./component-hook-types";
/**
 * Component hook registry for managing hooks.
 */
export declare class ComponentHookRegistry {
    private hooks;
    /**
     * Registers hooks for a component type.
     */
    registerHooks<T extends Component>(componentType: ComponentType<T>, hooks: ComponentHooks): void;
    /**
     * Gets hooks for a component type.
     */
    getHooks<T extends Component>(componentType: ComponentType<T>): ComponentHooks | undefined;
    /**
     * Executes the onAdd hook for a component.
     */
    executeOnAdd<T extends Component>(world: World, entity: Entity, componentType: ComponentType<T>, component: T): void;
    /**
     * Executes the onInsert hook for a component.
     */
    executeOnInsert<T extends Component>(world: World, entity: Entity, componentType: ComponentType<T>, component: T): void;
    /**
     * Executes the onReplace hook for a component.
     */
    executeOnReplace<T extends Component>(world: World, entity: Entity, componentType: ComponentType<T>, _oldComponent: T, newComponent: T): void;
    /**
     * Executes the onRemove hook for a component.
     */
    executeOnRemove<T extends Component>(world: World, entity: Entity, componentType: ComponentType<T>, component: T): void;
    /**
     * Executes the onDespawn hook for a component.
     */
    executeOnDespawn<T extends Component>(world: World, entity: Entity, componentType: ComponentType<T>, component: T): void;
    /**
     * Clears all hooks.
     */
    clear(): void;
}
