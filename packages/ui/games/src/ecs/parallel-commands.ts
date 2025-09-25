// Parallel commands for use in parallel contexts

import { Component, Entity } from "./types";

/**
 * Parallel commands for use in parallel contexts.
 */
export interface ParallelCommands {
  /**
   * Executes commands in a scoped context.
   */
  commandScope(callback: (commands: ScopedCommands) => void): void;
}

/**
 * Scoped commands interface for parallel execution.
 */
export interface ScopedCommands {
  spawn: (...components: Component[]) => void;
  despawn: (entity: Entity) => void;
}

/**
 * Parallel commands implementation.
 */
export class ParallelCommandsImpl implements ParallelCommands {
  private commandQueue: (() => void)[] = [];

  commandScope(callback: (commands: ScopedCommands) => void): void {
    // Create a scoped command context
    const scopedCommands: ScopedCommands = {
      spawn: (...components: Component[]) => {
        this.commandQueue.push(() => {
          // Commands will be applied later
          console.log("Spawning entity with components:", components);
        });
      },
      despawn: (entity: Entity) => {
        this.commandQueue.push(() => {
          // Commands will be applied later
          console.log("Despawning entity:", entity);
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
