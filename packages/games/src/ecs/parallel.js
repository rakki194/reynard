// Parallel execution system for multi-threaded operations
/**
 * Default batching strategy.
 */
export const DEFAULT_BATCHING_STRATEGY = {
    batchSize: 1000,
    minBatchSize: 100,
    maxBatchSize: 10000,
};
/**
 * Parallel iterator implementation.
 */
export class ParallelIteratorImpl {
    constructor(queryResult, _world, _changeDetection) {
        Object.defineProperty(this, "queryResult", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: queryResult
        });
        Object.defineProperty(this, "_world", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _world
        });
        Object.defineProperty(this, "_changeDetection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _changeDetection
        });
        Object.defineProperty(this, "_strategy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: DEFAULT_BATCHING_STRATEGY
        });
    }
    forEach(callback) {
        this.forEachInit(() => { }, (_, entity, ...components) => {
            callback(entity, ...components);
        });
    }
    forEachInit(init, callback) {
        // Check if we're in a web worker environment
        if (typeof Worker !== "undefined" &&
            typeof globalThis.importScripts === "function") {
            // We're in a web worker, use parallel execution
            this.executeParallel(init, callback);
        }
        else {
            // Fallback to sequential execution
            this.executeSequential(init, callback);
        }
    }
    batchingStrategy(strategy) {
        this._strategy = strategy;
        return this;
    }
    executeSequential(init, callback) {
        const local = init();
        this.queryResult.forEach((entity, ...components) => {
            callback(local, entity, ...components);
        });
    }
    executeParallel(init, callback) {
        // For now, fallback to sequential execution
        // In a real implementation, this would use Web Workers or SharedArrayBuffer
        this.executeSequential(init, callback);
    }
}
/**
 * Parallel commands implementation.
 */
export class ParallelCommandsImpl {
    constructor() {
        Object.defineProperty(this, "commandQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    commandScope(callback) {
        // Create a scoped command context
        const scopedCommands = {
            spawn: (..._components) => {
                this.commandQueue.push(() => {
                    // Commands will be applied later
                });
            },
            despawn: (_entity) => {
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
    applyCommands() {
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
    constructor(maxWorkers = navigator.hardwareConcurrency || 4) {
        Object.defineProperty(this, "workers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "maxWorkers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.maxWorkers = maxWorkers;
    }
    /**
     * Executes tasks in parallel.
     */
    async executeParallel(tasks, worker) {
        if (tasks.length === 0)
            return [];
        // For now, execute sequentially
        // In a real implementation, this would distribute tasks across workers
        return tasks.map(worker);
    }
    /**
     * Gets the number of available workers.
     */
    getWorkerCount() {
        return this.maxWorkers;
    }
    /**
     * Shuts down the task pool.
     */
    shutdown() {
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
