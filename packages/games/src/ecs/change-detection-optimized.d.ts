/**
 * @fileoverview Optimized Change Detection System for Large Entity Counts
 *
 * This optimized version addresses the Map size limit issue by:
 * 1. Using a more efficient key structure
 * 2. Implementing automatic cleanup of old change data
 * 3. Using typed arrays for better memory efficiency
 * 4. Adding configurable limits and cleanup strategies
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { Component, Entity } from "./types/core";
import { ComponentType } from "./types/storage";
/**
 * Tick value for change tracking.
 */
export interface Tick {
    readonly value: number;
    isNewerThan(other: Tick): boolean;
    isOlderThan(other: Tick): boolean;
    equals(other: Tick): boolean;
}
/**
 * Component tick information for change tracking.
 */
export interface ComponentTicks {
    readonly added: Tick;
    readonly changed: Tick;
    readonly removed?: Tick;
}
/**
 * Change detection interface for tracking component modifications.
 */
export interface ChangeDetection {
    incrementTick(): void;
    createTick(): Tick;
    advanceTick(): void;
    markAdded<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;
    markChanged<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;
    markRemoved<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;
    isAdded<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    isChanged<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    isRemoved<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    clear(): void;
    cleanup(): void;
    getStats(): ChangeDetectionStats;
}
/**
 * Statistics for change detection system.
 */
export interface ChangeDetectionStats {
    totalEntries: number;
    memoryUsageMB: number;
    averageEntriesPerTick: number;
    cleanupCount: number;
}
/**
 * Configuration for optimized change detection.
 */
export interface ChangeDetectionConfig {
    maxEntries: number;
    cleanupThreshold: number;
    cleanupInterval: number;
    enableStats: boolean;
    useTypedArrays: boolean;
}
/**
 * Creates a new tick.
 */
export declare function createTick(value: number): Tick;
/**
 * Creates component ticks.
 */
export declare function createComponentTicks(added: Tick, changed: Tick, removed?: Tick): ComponentTicks;
/**
 * Optimized change detection implementation with Map size limit handling.
 */
export declare class OptimizedChangeDetectionImpl implements ChangeDetection {
    private componentTicks;
    private currentTick;
    private lastCheckTick;
    private config;
    private stats;
    private lastCleanupTick;
    private cleanupCount;
    constructor(config?: Partial<ChangeDetectionConfig>);
    /**
     * Increments the current tick.
     */
    incrementTick(): void;
    /**
     * Creates a new tick (advances tick and returns it for test compatibility).
     */
    createTick(): Tick;
    /**
     * Advances the tick and updates the last check tick.
     */
    advanceTick(): void;
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
     * Clears all change tracking data.
     */
    clear(): void;
    /**
     * Cleans up old change tracking data.
     */
    cleanup(): void;
    /**
     * Gets statistics about the change detection system.
     */
    getStats(): ChangeDetectionStats;
    /**
     * Optimized component key generation using numeric IDs instead of strings.
     */
    private getOptimizedComponentKey;
    /**
     * Updates internal statistics.
     */
    private updateStats;
    /**
     * Estimates memory usage of the change detection system.
     */
    private estimateMemoryUsage;
}
/**
 * Creates an optimized change detection system.
 */
export declare function createOptimizedChangeDetection(config?: Partial<ChangeDetectionConfig>): ChangeDetection;
