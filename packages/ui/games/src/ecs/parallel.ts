// Parallel execution system for multi-threaded operations

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
  private strategy: BatchingStrategy = DEFAULT_BATCHING_STRATEGY;

  constructor(private queryResult: QueryResult<T>) {}

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
    if (
      typeof Worker !== "undefined" &&
      typeof (globalThis as { importScripts?: () => void }).importScripts === "function"
    ) {
      // We're in a web worker, use parallel execution
      this.executeParallel(init, callback);
    } else {
      // Fallback to sequential execution
      this.executeSequential(init, callback);
    }
  }

  batchingStrategy(strategy: BatchingStrategy): ParallelIterator<T> {
    this.strategy = strategy;
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
    // The strategy would be used to determine batch sizes for parallel processing
    console.log("Using batching strategy:", this.strategy);
    this.executeSequential(init, callback);
  }
}

// Re-export ParallelCommands for convenience
export type { ParallelCommands, ScopedCommands } from "./parallel-commands";
export { ParallelCommandsImpl } from "./parallel-commands";

// Re-export TaskPool for convenience
export { TaskPool, TASK_POOL } from "./task-pool";
