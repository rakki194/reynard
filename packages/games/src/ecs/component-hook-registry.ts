// Component hook registry for managing hooks

import { Entity, Component, ComponentType, World } from './types';
import { ComponentHooks } from './component-hook-types';

/**
 * Component hook registry for managing hooks.
 */
export class ComponentHookRegistry {
  private hooks: Map<number, ComponentHooks> = new Map();

  /**
   * Registers hooks for a component type.
   */
  registerHooks<T extends Component>(
    componentType: ComponentType<T>,
    hooks: ComponentHooks
  ): void {
    this.hooks.set(componentType.id, hooks);
  }

  /**
   * Gets hooks for a component type.
   */
  getHooks<T extends Component>(componentType: ComponentType<T>): ComponentHooks | undefined {
    return this.hooks.get(componentType.id);
  }

  /**
   * Executes the onAdd hook for a component.
   */
  executeOnAdd<T extends Component>(
    world: World,
    entity: Entity,
    componentType: ComponentType<T>,
    component: T
  ): void {
    const hooks = this.getHooks(componentType);
    if (hooks?.onAdd) {
      hooks.onAdd(world, entity, component);
    }
  }

  /**
   * Executes the onInsert hook for a component.
   */
  executeOnInsert<T extends Component>(
    world: World,
    entity: Entity,
    componentType: ComponentType<T>,
    component: T
  ): void {
    const hooks = this.getHooks(componentType);
    if (hooks?.onInsert) {
      hooks.onInsert(world, entity, component);
    }
  }

  /**
   * Executes the onReplace hook for a component.
   */
  executeOnReplace<T extends Component>(
    world: World,
    entity: Entity,
    componentType: ComponentType<T>,
    _oldComponent: T,
    newComponent: T
  ): void {
    const hooks = this.getHooks(componentType);
    if (hooks?.onReplace) {
      hooks.onReplace(world, entity, newComponent);
    }
  }

  /**
   * Executes the onRemove hook for a component.
   */
  executeOnRemove<T extends Component>(
    world: World,
    entity: Entity,
    componentType: ComponentType<T>,
    component: T
  ): void {
    const hooks = this.getHooks(componentType);
    if (hooks?.onRemove) {
      hooks.onRemove(world, entity, component);
    }
  }

  /**
   * Executes the onDespawn hook for a component.
   */
  executeOnDespawn<T extends Component>(
    world: World,
    entity: Entity,
    componentType: ComponentType<T>,
    component: T
  ): void {
    const hooks = this.getHooks(componentType);
    if (hooks?.onDespawn) {
      hooks.onDespawn(world, entity, component);
    }
  }

  /**
   * Clears all hooks.
   */
  clear(): void {
    this.hooks.clear();
  }
}
