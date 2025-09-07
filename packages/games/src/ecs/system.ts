// System implementation for ECS behavior

import { System, SystemFunction, Schedule, World } from './types';
import { SystemCondition } from './conditions';

/**
 * System implementation.
 */
export class SystemImpl implements System {
  constructor(
    public readonly name: string,
    public readonly run: SystemFunction,
    public readonly dependencies: string[] = [],
    public readonly exclusive: boolean = false,
    public readonly condition?: SystemCondition
  ) {}
}

/**
 * Schedule implementation for organizing system execution.
 */
export class ScheduleImpl implements Schedule {
  private systems: System[] = [];

  constructor(public readonly name: string) {}

  addSystem(system: System): void {
    // Check for duplicate system names
    if (this.systems.some(s => s.name === system.name)) {
      throw new Error(`System '${system.name}' is already in schedule '${this.name}'`);
    }

    this.systems.push(system);
  }

  removeSystem(systemName: string): void {
    const index = this.systems.findIndex(s => s.name === systemName);
    if (index === -1) {
      throw new Error(`System '${systemName}' not found in schedule '${this.name}'`);
    }
    this.systems.splice(index, 1);
  }

  run(world: World): void {
    // Sort systems by dependencies
    const sortedSystems = this.topologicalSort();
    
    // Run systems in order
    for (const system of sortedSystems) {
      try {
        // Check system condition if it exists
        if (system.condition && !system.condition.run(world)) {
          continue; // Skip system if condition is not met
        }
        
        system.run(world);
      } catch (error) {
        console.error(`Error running system '${system.name}':`, error);
        throw error;
      }
    }
  }

  getSystems(): System[] {
    return [...this.systems];
  }

  private topologicalSort(): System[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: System[] = [];

    const visit = (systemName: string) => {
      if (visiting.has(systemName)) {
        throw new Error(`Circular dependency detected involving system '${systemName}'`);
      }
      if (visited.has(systemName)) {
        return;
      }

      visiting.add(systemName);
      
      const system = this.systems.find(s => s.name === systemName);
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
  private name: string;
  private run: SystemFunction;
  private dependencies: string[] = [];
  private exclusive: boolean = false;
  private condition?: SystemCondition;

  constructor(name: string, run: SystemFunction) {
    this.name = name;
    this.run = run;
  }

  /**
   * Adds a dependency to this system.
   */
  after(systemName: string): this {
    this.dependencies.push(systemName);
    return this;
  }

  /**
   * Marks this system as exclusive (cannot run in parallel).
   */
  setExclusive(): this {
    this.exclusive = true;
    return this;
  }

  /**
   * Adds a condition to this system.
   */
  runIf(condition: SystemCondition): this {
    this.condition = condition;
    return this;
  }

  /**
   * Builds the system.
   */
  build(): System {
    return new SystemImpl(this.name, this.run, this.dependencies, this.exclusive, this.condition);
  }
}

/**
 * Helper function to create a system.
 */
export function system(name: string, run: SystemFunction): SystemBuilder {
  return new SystemBuilder(name, run);
}

/**
 * Helper function to create a schedule.
 */
export function schedule(name: string): ScheduleImpl {
  return new ScheduleImpl(name);
}

/**
 * System set for grouping related systems.
 */
export class SystemSet {
  private systems: string[] = [];

  constructor(public readonly name: string) {}

  /**
   * Adds a system to this set.
   */
  add(systemName: string): this {
    this.systems.push(systemName);
    return this;
  }

  /**
   * Gets all systems in this set.
   */
  getSystems(): string[] {
    return [...this.systems];
  }

  /**
   * Configures this set to run before another set.
   */
  before(otherSet: SystemSet): SystemSetConfig {
    return new SystemSetConfig(this, otherSet, 'before');
  }

  /**
   * Configures this set to run after another set.
   */
  after(otherSet: SystemSet): SystemSetConfig {
    return new SystemSetConfig(this, otherSet, 'after');
  }
}

/**
 * System set configuration for ordering.
 */
export class SystemSetConfig {
  constructor(
    public readonly set: SystemSet,
    public readonly otherSet: SystemSet,
    public readonly order: 'before' | 'after'
  ) {}
}

/**
 * Helper function to create a system set.
 */
export function systemSet(name: string): SystemSet {
  return new SystemSet(name);
}
