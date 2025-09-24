/**
 * 🦊 Reynard Linting Processors
 * ==============================
 *
 * Collection of linting processors for different file types.
 */

import type { LintingProcessor } from "./types.js";

/**
 * Collection of linting processors
 */
export class LintingProcessors {
  private processors: Map<string, LintingProcessor> = new Map();

  /**
   * Register a processor
   */
  register(name: string, processor: LintingProcessor): void {
    this.processors.set(name, processor);
  }

  /**
   * Get a processor by name
   */
  get(name: string): LintingProcessor | undefined {
    return this.processors.get(name);
  }

  /**
   * Get all processors
   */
  getAll(): Map<string, LintingProcessor> {
    return new Map(this.processors);
  }

  /**
   * Get processors that can handle a file
   */
  getProcessorsForFile(filePath: string): LintingProcessor[] {
    const applicableProcessors: LintingProcessor[] = [];
    
    for (const processor of this.processors.values()) {
      if (processor.canProcess(filePath)) {
        applicableProcessors.push(processor);
      }
    }

    return applicableProcessors;
  }

  /**
   * Remove a processor
   */
  remove(name: string): boolean {
    return this.processors.delete(name);
  }

  /**
   * Clear all processors
   */
  clear(): void {
    this.processors.clear();
  }

  /**
   * Get processor count
   */
  size(): number {
    return this.processors.size;
  }
}