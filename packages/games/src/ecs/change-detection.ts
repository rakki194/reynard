// Change detection system for tracking component modifications

import { Component, ComponentType, Entity } from "./types";

/**
 * A tick represents a point in time for change detection.
 */
export interface Tick {
  readonly value: number;
  isNewerThan(other: Tick): boolean;
}

/**
 * Creates a new tick.
 */
export function createTick(value: number): Tick {
  return {
    value,
    isNewerThan(other: Tick): boolean {
      return this.value > other.value;
    },
  };
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
  readonly removed?: Tick;
}

/**
 * Creates component ticks.
 */
export function createComponentTicks(
  added: Tick,
  changed: Tick,
  removed?: Tick,
): ComponentTicks {
  return { added, changed, removed };
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
   * Creates a new tick (advances tick and returns it for test compatibility).
   */
  createTick(): Tick {
    this.incrementTick();
    return this.currentTick;
  }

  /**
   * Advances the tick (alias for incrementTick for test compatibility).
   */
  advanceTick(): void {
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
    const existing = this.componentTicks.get(key);
    if (existing) {
      this.componentTicks.set(
        key,
        createComponentTicks(
          existing.added,
          existing.changed,
          this.currentTick,
        ),
      );
    }
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

    // Component is added if it was added after the last check tick
    return ticks.added.isNewerThan(this.lastCheckTick);
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

    // Component is changed if it was changed after the last check tick
    return ticks.changed.isNewerThan(this.lastCheckTick);
  }

  /**
   * Checks if a component was removed since the last check.
   */
  isRemoved<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): boolean {
    const key = this.getComponentKey(entity, componentType);
    const ticks = this.componentTicks.get(key);
    if (!ticks) return false;

    // Component is removed if it was removed after the last check tick
    return ticks.removed
      ? ticks.removed.isNewerThan(this.lastCheckTick)
      : false;
  }

  /**
   * Gets the component ticks for an entity and component type.
   */
  getComponentTicks<T extends Component>(
    entity: Entity,
    componentType: ComponentType<T>,
  ): ComponentTicks | undefined {
    const key = this.getComponentKey(entity, componentType);
    return this.componentTicks.get(key);
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
