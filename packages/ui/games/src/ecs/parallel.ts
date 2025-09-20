// Parallel execution system for multi-threaded operations

import { ChangeDetection } from "./change-detection";
import { Component, Entity, QueryResult } from "./types";

/**
 * Parallel iterator for query results.
 */
export interface ParallelIterator<T extends Component[]> {
  /**
   * Runs a function on each query result in parallel.
   */
  forEach(callback: (entity: Entity, ...components: T) => void): void;

  /**
   * Runs a function on each query result in parallel with initialization.
   */
  forEachInit<U>(init: () => U, callback: (local: U, entity: Entity, ...components: T) => void): void;

  /**
   * Changes the batching strategy used when iterating.
   */
  batchingStrategy(strategy: BatchingStrategy): ParallelIterator<T>;
}

/**
 * Batching strategy for parallel execution.
 */
export interface BatchingStrategy {
  readonly batchSize: number;
  readonly minBatchSize: number;
  readonly maxBatchSize: number;
}

/**
 * Default batching strategy.
 */
export const DEFAULT_BATCHING_STRATEGY: BatchingStrategy = {
  batchSize: 1000,
  minBatchSize: 100,
  maxBatchSize: 10000,
};

/**
 * Parallel iterator implementation.
 */
export class ParallelIteratorImpl<T extends Component[]> implements ParallelIterator<T> {
  private _strategy: BatchingStrategy = DEFAULT_BATCHING_STRATEGY;

  constructor(
    private queryResult: QueryResult<T>,
    private _world: any,
    private _changeDetection?: ChangeDetection
  ) {}

  forEach(callback: (entity: Entity, ...components: T) => void): void {
    this.forEachInit(
      () => {},
      (_, entity, ...components) => {
        callback(entity, ...components);
      }
    );
  }

  forEachInit<U>(init: () => U, callback: (local: U, entity: Entity, ...components: T) => void): void {
    // Check if we're in a web worker environment
    if (typeof Worker !== "undefined" && typeof (globalThis as any).importScripts === "function") {
      // We're in a web worker, use parallel execution
      this.executeParallel(init, callback);
    } else {
      // Fallback to sequential execution
      this.executeSequential(init, callback);
    }
  }

  batchingStrategy(strategy: BatchingStrategy): ParallelIterator<T> {
    this._strategy = strategy;
    return this;
  }

  private executeSequential<U>(init: () => U, callback: (local: U, entity: Entity, ...components: T) => void): void {
    const local = init();
    this.queryResult.forEach((entity, ...components) => {
      callback(local, entity, ...components);
    });
  }

  private executeParallel<U>(init: () => U, callback: (local: U, entity: Entity, ...components: T) => void): void {
    // For now, fallback to sequential execution
    // In a real implementation, this would use Web Workers or SharedArrayBuffer
    this.executeSequential(init, callback);
  }
}

/**
 * Parallel commands for use in parallel contexts.
 */
export interface ParallelCommands {
  /**
   * Executes commands in a scoped context.
   */
  commandScope(callback: (commands: any) => void): void;
}

/**
 * Parallel commands implementation.
 */
export class ParallelCommandsImpl implements ParallelCommands {
  private commandQueue: (() => void)[] = [];

  commandScope(callback: (commands: any) => void): void {
    // Create a scoped command context
    const scopedCommands = {
      spawn: (..._components: Component[]) => {
        this.commandQueue.push(() => {
          // Commands will be applied later
        });
      },
      despawn: (_entity: Entity) => {
        this.commandQueue.push(() => {
          // Commands will be applied later
        });
      },
    };

    callback(scopedCommands);
  }

  /**
   * Applies all queued commands.
   */
  applyCommands(): void {
    for (const command of this.commandQueue) {
      command();
    }
    this.commandQueue.length = 0;
  }
}

/**
 * Task pool for managing parallel execution.
 */
export class TaskPool {
  private workers: Worker[] = [];
  private maxWorkers: number;

  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4) {
    this.maxWorkers = maxWorkers;
  }

  /**
   * Executes tasks in parallel.
   */
  async executeParallel<T, R>(tasks: T[], worker: (task: T) => R): Promise<R[]> {
    if (tasks.length === 0) return [];

    // For now, execute sequentially
    // In a real implementation, this would distribute tasks across workers
    return tasks.map(worker);
  }

  /**
   * Gets the number of available workers.
   */
  getWorkerCount(): number {
    return this.maxWorkers;
  }

  /**
   * Shuts down the task pool.
   */
  shutdown(): void {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers.length = 0;
  }
}

/**
 * Global task pool instance.
 */
export const TASK_POOL = new TaskPool();
