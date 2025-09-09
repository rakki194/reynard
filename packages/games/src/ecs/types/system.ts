/**
 * @fileoverview System types for behavior and execution management.
 *
 * Defines how systems are structured, executed, and scheduled in the ECS.
 * Systems contain all game logic and operate on components and resources.
 *
 * @example
 * ```typescript
 * const movementSystem: SystemFunction = (world) => {
 *   const query = world.query(Position, Velocity);
 *   const gameTime = world.getResource(GameTime);
 *
 *   if (!gameTime) return;
 *
 *   query.forEach((entity, position, velocity) => {
 *     position.x += velocity.x * gameTime.deltaTime;
 *     position.y += velocity.y * gameTime.deltaTime;
 *   });
 * };
 *
 * const system = system('movement', movementSystem)
 *   .after('input')
 *   .runIf(Conditions.everyNFrames(1));
 * ```
 *
 * @performance Systems are cached and reused, dependencies enable parallel execution
 * @author Reynard ECS Team
 * @since 1.0.0
 */

// Removed unused imports: Component, Resource, ComponentType, ResourceType, QueryResult
import { World } from "./world";

/**
 * System function type that operates on the world.
 *
 * Systems are the behavior layer of the ECS architecture. They contain
 * all the game logic and operate on components and resources. Systems
 * can be synchronous or asynchronous, and are executed by the scheduler.
 *
 * @param world - The ECS world containing all entities, components, and resources
 * @returns void or Promise<void> for async systems
 *
 * @example
 * ```typescript
 * const movementSystem: SystemFunction = (world) => {
 *   const query = world.query(Position, Velocity);
 *   const gameTime = world.getResource(GameTime);
 *
 *   if (!gameTime) return;
 *
 *   query.forEach((entity, position, velocity) => {
 *     position.x += velocity.x * gameTime.deltaTime;
 *     position.y += velocity.y * gameTime.deltaTime;
 *   });
 * };
 * ```
 *
 * @performance
 * - Systems are executed in dependency order
 * - Can run in parallel when no conflicts exist
 * - Optimized for bulk operations on components
 *
 * @since 1.0.0
 */
export type SystemFunction = (world: World) => void | Promise<void>;

/**
 * System condition for conditional execution of systems.
 *
 * System conditions allow systems to run only when certain criteria
 * are met, enabling more efficient system execution and complex
 * conditional logic.
 *
 * @example
 * ```typescript
 * const condition = Conditions.everyNFrames(60); // Run every 60 frames
 * const system = system('expensive', expensiveLogic)
 *   .runIf(condition);
 * ```
 *
 * @since 1.0.0
 */
export interface SystemCondition {
  /** Type marker to distinguish conditions from other objects */
  readonly __condition: true;
  /** Human-readable name of this condition */
  readonly name: string;
  /** Function that determines if the condition is met */
  readonly run: (world: World) => boolean;
}

/**
 * System that can be added to a schedule for execution.
 *
 * Systems encapsulate game behavior and operate on components and resources.
 * They can have dependencies, conditions, and can be marked as exclusive
 * to prevent parallel execution with other systems.
 *
 * @example
 * ```typescript
 * const movementSystem: System = {
 *   name: 'movement',
 *   run: (world) => {
 *     // Movement logic here
 *   },
 *   dependencies: ['input'],
 *   exclusive: false,
 *   condition: Conditions.everyNFrames(1)
 * };
 * ```
 *
 * @performance
 * - Systems are cached and reused
 * - Dependencies enable parallel execution
 * - Conditions prevent unnecessary execution
 *
 * @since 1.0.0
 */
export interface System {
  /** Unique name identifying this system */
  readonly name: string;
  /** The function that implements the system logic */
  readonly run: SystemFunction;
  /** Names of systems that must run before this system */
  readonly dependencies: string[];
  /** Whether this system requires exclusive world access */
  readonly exclusive: boolean;
  /** Optional condition that determines if the system should run */
  readonly condition?: SystemCondition;
}

/**
 * Schedule for organizing system execution with dependency management.
 *
 * Schedules manage the execution order of systems, ensuring dependencies
 * are respected and systems run in the correct sequence. They also handle
 * parallel execution where possible and system condition evaluation.
 *
 * @example
 * ```typescript
 * const schedule = schedule('main');
 * schedule.addSystem(movementSystem);
 * schedule.addSystem(renderSystem);
 *
 * // Systems with dependencies are automatically ordered
 * const physicsSystem = system('physics', physicsLogic)
 *   .after('movement')
 *   .runIf(Conditions.everyNFrames(1));
 * schedule.addSystem(physicsSystem);
 *
 * // Run the entire schedule
 * schedule.run(world);
 * ```
 *
 * @performance
 * - Systems are topologically sorted for optimal execution order
 * - Parallel execution when no conflicts exist
 * - Condition evaluation prevents unnecessary system runs
 *
 * @since 1.0.0
 */
export interface Schedule {
  /** Unique name identifying this schedule */
  readonly name: string;

  /**
   * Adds a system to this schedule.
   * @param system The system to add
   */
  addSystem(system: System): void;

  /**
   * Removes a system from this schedule.
   * @param systemName The name of the system to remove
   */
  removeSystem(systemName: string): void;

  /**
   * Runs all systems in this schedule in dependency order.
   * @param world The world to run systems against
   */
  run(world: World): void;

  /**
   * Gets all systems in this schedule.
   * @returns Array of systems in execution order
   */
  getSystems(): System[];
}
