// Core types and interfaces for component hooks

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
export function createComponentHooks(hooks: Partial<ComponentHooks>): ComponentHooks {
  return {
    onAdd: hooks.onAdd,
    onInsert: hooks.onInsert,
    onReplace: hooks.onReplace,
    onRemove: hooks.onRemove,
    onDespawn: hooks.onDespawn,
  };
}
