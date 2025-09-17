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
export declare function createTick(value: number): Tick;
/**
 * Change detection for tracking component modifications.
 */
export interface ChangeDetection {
    isAdded<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    isChanged<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    isRemoved<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
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
export declare function createComponentTicks(added: Tick, changed: Tick, removed?: Tick): ComponentTicks;
/**
 * Change detection implementation.
 */
export declare class ChangeDetectionImpl implements ChangeDetection {
    private componentTicks;
    private currentTick;
    private lastCheckTick;
    /**
     * Increments the current tick.
     */
    incrementTick(): void;
    /**
     * Creates a new tick (advances tick and returns it for test compatibility).
     */
    createTick(): Tick;
    /**
     * Advances the tick (alias for incrementTick for test compatibility).
     */
    advanceTick(): void;
    /**
     * Sets the last check tick.
     */
    setLastCheckTick(tick: Tick): void;
    /**
     * Gets the current tick.
     */
    getCurrentTick(): Tick;
    /**
     * Gets the last check tick.
     */
    getLastCheckTick(): Tick;
    /**
     * Marks a component as added.
     */
    markAdded<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;
    /**
     * Marks a component as changed.
     */
    markChanged<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;
    /**
     * Marks a component as removed.
     */
    markRemoved<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;
    /**
     * Checks if a component was added since the last check.
     */
    isAdded<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    /**
     * Checks if a component was changed since the last check.
     */
    isChanged<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    /**
     * Checks if a component was removed since the last check.
     */
    isRemoved<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    /**
     * Gets the component ticks for an entity and component type.
     */
    getComponentTicks<T extends Component>(entity: Entity, componentType: ComponentType<T>): ComponentTicks | undefined;
    /**
     * Clears all change detection data.
     */
    clear(): void;
    /**
     * Gets the component key for tracking.
     */
    private getComponentKey;
}
