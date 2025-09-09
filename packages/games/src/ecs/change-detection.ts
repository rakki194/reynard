// Change detection system for tracking component modifications

import { Entity, Component, ComponentType } from "./types";

/**
 * A tick represents a point in time for change detection.
 */
export interface Tick {
  readonly value: number;
}

/**
 * Creates a new tick.
 */
export function createTick(value: number): Tick {
  return { value };
}

/**
 * Change detection for tracking component modifications.
 */
export interface ChangeDetection {
  isAdded<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean;
  isChanged<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean;
  isRemoved<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean;
  clear(): void;
}

/**
 * Component ticks for tracking when components were added and changed.
 */
export interface ComponentTicks {
  readonly added: Tick;
  readonly changed: Tick;
}

/**
 * Creates component ticks.
 */
export function createComponentTicks(
  added: Tick,
  changed: Tick,
): ComponentTicks {
  return { added, changed };
}

/**
 * Change detection implementation.
 */
export class ChangeDetectionImpl implements ChangeDetection {
  private componentTicks: Map<string, ComponentTicks> = new Map();
  private currentTick: Tick = createTick(0);
  private lastCheckTick: Tick = createTick(0);

  /**
   * Increments the current tick.
   */
  incrementTick(): void {
    this.currentTick = createTick(this.currentTick.value + 1);
  }

  /**
   * Sets the last check tick.
   */
  setLastCheckTick(tick: Tick): void {
    this.lastCheckTick = tick;
  }

  /**
   * Gets the current tick.
   */
  getCurrentTick(): Tick {
    return this.currentTick;
  }

  /**
   * Gets the last check tick.
   */
  getLastCheckTick(): Tick {
    return this.lastCheckTick;
  }

  /**
   * Marks a component as added.
   */
  markAdded<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): void {
    const key = this.getComponentKey(entity, componentType);
    this.componentTicks.set(
      key,
      createComponentTicks(this.currentTick, this.currentTick),
    );
  }

  /**
   * Marks a component as changed.
   */
  markChanged<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): void {
    const key = this.getComponentKey(entity, componentType);
    const existing = this.componentTicks.get(key);
    if (existing) {
      this.componentTicks.set(
        key,
        createComponentTicks(existing.added, this.currentTick),
      );
    } else {
      this.componentTicks.set(
        key,
        createComponentTicks(this.currentTick, this.currentTick),
      );
    }
  }

  /**
   * Marks a component as removed.
   */
  markRemoved<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): void {
    const key = this.getComponentKey(entity, componentType);
    this.componentTicks.delete(key);
  }

  /**
   * Checks if a component was added since the last check.
   */
  isAdded<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean {
    const key = this.getComponentKey(entity, componentType);
    const ticks = this.componentTicks.get(key);
    if (!ticks) return false;

    return ticks.added.value > this.lastCheckTick.value;
  }

  /**
   * Checks if a component was changed since the last check.
   */
  isChanged<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean {
    const key = this.getComponentKey(entity, componentType);
    const ticks = this.componentTicks.get(key);
    if (!ticks) return false;

    return ticks.changed.value > this.lastCheckTick.value;
  }

  /**
   * Checks if a component was removed since the last check.
   */
  isRemoved<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean {
    // This is a simplified implementation
    // In a real implementation, we'd track removed components
    return false;
  }

  /**
   * Clears all change detection data.
   */
  clear(): void {
    this.componentTicks.clear();
    this.currentTick = createTick(0);
    this.lastCheckTick = createTick(0);
  }

  /**
   * Gets the component key for tracking.
   */
  private getComponentKey<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): string {
    return `${entity.index}v${entity.generation}:${componentType.id}`;
  }
}
