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
export declare const DEFAULT_BATCHING_STRATEGY: BatchingStrategy;
/**
 * Parallel iterator implementation.
 */
export declare class ParallelIteratorImpl<T extends Component[]> implements ParallelIterator<T> {
    private queryResult;
    private _world;
    private _changeDetection?;
    private _strategy;
    constructor(queryResult: QueryResult<T>, _world: any, _changeDetection?: ChangeDetection | undefined);
    forEach(callback: (entity: Entity, ...components: T) => void): void;
    forEachInit<U>(init: () => U, callback: (local: U, entity: Entity, ...components: T) => void): void;
    batchingStrategy(strategy: BatchingStrategy): ParallelIterator<T>;
    private executeSequential;
    private executeParallel;
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
export declare class ParallelCommandsImpl implements ParallelCommands {
    private commandQueue;
    commandScope(callback: (commands: any) => void): void;
    /**
     * Applies all queued commands.
     */
    applyCommands(): void;
}
/**
 * Task pool for managing parallel execution.
 */
export declare class TaskPool {
    private workers;
    private maxWorkers;
    constructor(maxWorkers?: number);
    /**
     * Executes tasks in parallel.
     */
    executeParallel<T, R>(tasks: T[], worker: (task: T) => R): Promise<R[]>;
    /**
     * Gets the number of available workers.
     */
    getWorkerCount(): number;
    /**
     * Shuts down the task pool.
     */
    shutdown(): void;
}
/**
 * Global task pool instance.
 */
export declare const TASK_POOL: TaskPool;
