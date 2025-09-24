// Task pool for managing parallel execution

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
