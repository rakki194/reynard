// System operations for the ECS world

import { Schedule, System } from "./types";

/**
 * System operations mixin for WorldImpl.
 * This provides system management functionality.
 */
export class SystemOperationsMixin {
  private systems: Map<string, System> = new Map();
  private schedules: Map<string, Schedule> = new Map();

  /**
   * Adds a system to the world.
   */
  addSystem(system: System): void {
    this.systems.set(system.name, system);
  }

  /**
   * Removes a system from the world.
   */
  removeSystem(systemName: string): void {
    this.systems.delete(systemName);
  }

  /**
   * Runs a system by name.
   */
  runSystem(systemName: string, world: any): void {
    const system = this.systems.get(systemName);
    if (!system) {
      throw new Error(`System '${systemName}' not found`);
    }
    system.run(world);
  }

  /**
   * Runs a schedule by name.
   */
  runSchedule(scheduleName: string, world: any): void {
    const schedule = this.schedules.get(scheduleName);
    if (!schedule) {
      throw new Error(`Schedule '${scheduleName}' not found`);
    }
    schedule.run(world);
  }

  /**
   * Gets the systems map.
   */
  getSystems(): Map<string, System> {
    return this.systems;
  }

  /**
   * Gets the schedules map.
   */
  getSchedules(): Map<string, Schedule> {
    return this.schedules;
  }
}
