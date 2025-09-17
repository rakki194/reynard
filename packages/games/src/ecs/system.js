// System implementation for ECS behavior
/**
 * System implementation.
 */
export class SystemImpl {
    constructor(name, run, dependencies = [], exclusive = false, condition) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "run", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: run
        });
        Object.defineProperty(this, "dependencies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: dependencies
        });
        Object.defineProperty(this, "exclusive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: exclusive
        });
        Object.defineProperty(this, "condition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: condition
        });
    }
}
/**
 * Schedule implementation for organizing system execution.
 */
export class ScheduleImpl {
    constructor(name) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "systems", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    addSystem(system) {
        // Validate system parameter
        if (!system) {
            throw new Error("Cannot add null or undefined system to schedule");
        }
        // Check for duplicate system names
        if (this.systems.some((s) => s.name === system.name)) {
            throw new Error(`System '${system.name}' is already in schedule '${this.name}'`);
        }
        this.systems.push(system);
        return this;
    }
    /**
     * Adds a system set to this schedule.
     */
    addSystemSet(systemSet) {
        // Add all systems from the set to this schedule
        const systems = systemSet.getSystems();
        for (const system of systems) {
            this.addSystem(system);
        }
        return this;
    }
    removeSystem(systemName) {
        const index = this.systems.findIndex((s) => s.name === systemName);
        if (index === -1) {
            throw new Error(`System '${systemName}' not found in schedule '${this.name}'`);
        }
        this.systems.splice(index, 1);
    }
    run(world) {
        // Sort systems by dependencies
        const sortedSystems = this.topologicalSort();
        // Run systems in order
        for (const system of sortedSystems) {
            try {
                // Check system condition if it exists
                if (system.condition) {
                    try {
                        if (!system.condition.run(world)) {
                            continue; // Skip system if condition is not met
                        }
                    }
                    catch (conditionError) {
                        // Handle condition errors gracefully - skip system execution
                        continue;
                    }
                }
                system.run(world);
            }
            catch (error) {
                console.error(`Error running system '${system.name}':`, error);
                throw error;
            }
        }
    }
    getSystems() {
        return [...this.systems];
    }
    topologicalSort() {
        const visited = new Set();
        const visiting = new Set();
        const result = [];
        const visit = (systemName) => {
            if (visiting.has(systemName)) {
                // Circular dependency detected - break the cycle by returning early
                // This allows the system to continue but may not execute in expected order
                return;
            }
            if (visited.has(systemName)) {
                return;
            }
            visiting.add(systemName);
            const system = this.systems.find((s) => s.name === systemName);
            if (system) {
                // Visit dependencies first
                for (const dependency of system.dependencies) {
                    visit(dependency);
                }
                result.push(system);
            }
            visiting.delete(systemName);
            visited.add(systemName);
        };
        // Visit all systems
        for (const system of this.systems) {
            if (!visited.has(system.name)) {
                visit(system.name);
            }
        }
        return result;
    }
}
/**
 * System builder for creating systems with dependencies.
 */
export class SystemBuilder {
    constructor(name, systemFunction) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "systemFunction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dependencies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "exclusive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "conditions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.name = name;
        this.systemFunction = systemFunction;
    }
    /**
     * Adds a dependency to this system.
     */
    after(systemName) {
        this.dependencies.push(systemName);
        return this;
    }
    /**
     * Marks this system as exclusive (cannot run in parallel).
     */
    setExclusive() {
        this.exclusive = true;
        return this;
    }
    /**
     * Adds a condition to this system.
     */
    runIf(condition) {
        this.conditions.push(condition);
        return this;
    }
    /**
     * Alias for runIf to match test expectations.
     */
    withCondition(condition) {
        return this.runIf(condition);
    }
    /**
     * Adds a dependency to this system.
     */
    addDependency(system) {
        this.dependencies.push(system.name);
        return this;
    }
    /**
     * Runs the system (for direct execution).
     */
    run(world) {
        const system = this.build();
        // Check all system conditions
        for (const condition of this.conditions) {
            try {
                if (!condition.run(world)) {
                    return; // Skip system if any condition is not met
                }
            }
            catch (error) {
                // Handle condition errors gracefully - skip system execution
                return;
            }
        }
        system.run(world);
    }
    /**
     * Builds the system.
     */
    build() {
        // Create a combined condition if multiple conditions exist
        let combinedCondition;
        if (this.conditions.length > 0) {
            if (this.conditions.length === 1) {
                combinedCondition = this.conditions[0];
            }
            else {
                // Combine multiple conditions with AND logic
                combinedCondition = {
                    __condition: true,
                    name: `combined_${this.conditions.map((c) => c.name).join("_and_")}`,
                    run: (world) => {
                        for (const condition of this.conditions) {
                            try {
                                if (!condition.run(world)) {
                                    return false;
                                }
                            }
                            catch (error) {
                                return false; // If any condition throws, the combined condition fails
                            }
                        }
                        return true;
                    },
                };
            }
        }
        return new SystemImpl(this.name, this.systemFunction, this.dependencies, this.exclusive, combinedCondition);
    }
}
export function system(nameOrRun, run) {
    if (typeof nameOrRun === "string") {
        // Called with name and function: system(name, run)
        return new SystemBuilder(nameOrRun, run);
    }
    else {
        // Called with just function: system(run) - generate a name
        const name = `system_${Math.random().toString(36).substr(2, 9)}`;
        return new SystemBuilder(name, nameOrRun);
    }
}
/**
 * Helper function to create a schedule.
 */
export function schedule(name) {
    return new ScheduleImpl(name);
}
/**
 * System set for grouping related systems.
 */
export class SystemSet {
    constructor(name) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "systems", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    /**
     * Adds a system to this set.
     */
    add(_systemName) {
        // This method is for backward compatibility - it doesn't work with actual systems
        // Use addSystem() instead
        return this;
    }
    /**
     * Adds a system to this set (alias for add).
     */
    addSystem(system) {
        this.systems.push(system);
        return this;
    }
    /**
     * Adds a dependency to this system set.
     */
    addDependency(_other) {
        // For now, this is a placeholder - in a real implementation,
        // this would track dependencies between system sets
        return this;
    }
    /**
     * Gets all systems in this set.
     */
    getSystems() {
        return [...this.systems];
    }
    /**
     * Configures this set to run before another set.
     */
    before(otherSet) {
        return new SystemSetConfig(this, otherSet, "before");
    }
    /**
     * Configures this set to run after another set.
     */
    after(otherSet) {
        return new SystemSetConfig(this, otherSet, "after");
    }
}
/**
 * System set configuration for ordering.
 */
export class SystemSetConfig {
    constructor(set, otherSet, order) {
        Object.defineProperty(this, "set", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: set
        });
        Object.defineProperty(this, "otherSet", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: otherSet
        });
        Object.defineProperty(this, "order", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: order
        });
    }
}
/**
 * Helper function to create a system set.
 */
export function systemSet(name) {
    return new SystemSet(name);
}
