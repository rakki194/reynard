import { SystemCondition } from "./conditions";
import { Schedule, System, SystemFunction, World } from "./types";
/**
 * System implementation.
 */
export declare class SystemImpl implements System {
    readonly name: string;
    readonly run: SystemFunction;
    readonly dependencies: string[];
    readonly exclusive: boolean;
    readonly condition?: SystemCondition | undefined;
    constructor(name: string, run: SystemFunction, dependencies?: string[], exclusive?: boolean, condition?: SystemCondition | undefined);
}
/**
 * Schedule implementation for organizing system execution.
 */
export declare class ScheduleImpl implements Schedule {
    readonly name: string;
    private systems;
    constructor(name: string);
    addSystem(system: System): this;
    /**
     * Adds a system set to this schedule.
     */
    addSystemSet(systemSet: SystemSet): this;
    removeSystem(systemName: string): void;
    run(world: World): void;
    getSystems(): System[];
    private topologicalSort;
}
/**
 * System builder for creating systems with dependencies.
 */
export declare class SystemBuilder {
    private name;
    private systemFunction;
    private dependencies;
    private exclusive;
    private conditions;
    constructor(name: string, systemFunction: SystemFunction);
    /**
     * Adds a dependency to this system.
     */
    after(systemName: string): this;
    /**
     * Marks this system as exclusive (cannot run in parallel).
     */
    setExclusive(): this;
    /**
     * Adds a condition to this system.
     */
    runIf(condition: SystemCondition): this;
    /**
     * Alias for runIf to match test expectations.
     */
    withCondition(condition: SystemCondition): this;
    /**
     * Adds a dependency to this system.
     */
    addDependency(system: System): this;
    /**
     * Runs the system (for direct execution).
     */
    run(world: World): void;
    /**
     * Builds the system.
     */
    build(): System;
}
/**
 * Helper function to create a system.
 */
export declare function system(name: string, run: SystemFunction): SystemBuilder;
export declare function system(run: SystemFunction): SystemBuilder;
/**
 * Helper function to create a schedule.
 */
export declare function schedule(name: string): ScheduleImpl;
/**
 * System set for grouping related systems.
 */
export declare class SystemSet {
    readonly name: string;
    private systems;
    constructor(name: string);
    /**
     * Adds a system to this set.
     */
    add(_systemName: string): this;
    /**
     * Adds a system to this set (alias for add).
     */
    addSystem(system: System): this;
    /**
     * Adds a dependency to this system set.
     */
    addDependency(_other: SystemSet | System): this;
    /**
     * Gets all systems in this set.
     */
    getSystems(): System[];
    /**
     * Configures this set to run before another set.
     */
    before(otherSet: SystemSet): SystemSetConfig;
    /**
     * Configures this set to run after another set.
     */
    after(otherSet: SystemSet): SystemSetConfig;
}
/**
 * System set configuration for ordering.
 */
export declare class SystemSetConfig {
    readonly set: SystemSet;
    readonly otherSet: SystemSet;
    readonly order: "before" | "after";
    constructor(set: SystemSet, otherSet: SystemSet, order: "before" | "after");
}
/**
 * Helper function to create a system set.
 */
export declare function systemSet(name: string): SystemSet;
