/**
 * @fileoverview Query Result Converter for WASM SIMD ECS.
 *
 * Converts between different query result formats to maintain
 * compatibility between TypeScript and WASM implementations.
 *
 * @example
 * ```typescript
 * import { QueryConverter } from './query-converter';
 *
 * const converter = new QueryConverter();
 * const iterator = converter.convertToIterator(queryResult);
 * ```
 *
 * @performance
 * - Efficient query result conversion
 * - Type-safe iterator creation
 * - Minimal memory overhead
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { Entity, Component } from "../types";

/**
 * Query result converter for ECS operations.
 *
 * Converts QueryResult objects to IterableIterator format
 * for compatibility with the unified ECS interface.
 */
export class QueryConverter {
  /**
   * Convert QueryResult to IterableIterator for compatibility.
   */
  convertToIterator<T extends Component[]>(queryResult: Record<string, unknown>): IterableIterator<[Entity, ...T]> {
    // This is a simplified conversion - in a real implementation,
    // you'd properly convert the QueryResult to an iterator
    const entities = (queryResult.entities as Entity[]) || [];
    const components = (queryResult.components as T[][]) || [];

    let index = 0;
    return {
      [Symbol.iterator]() {
        return this;
      },
      next(): IteratorResult<[Entity, ...T]> {
        if (index < entities.length) {
          const entity = entities[index];
          const entityComponents = components[index] || [];
          index++;
          return {
            value: [entity, ...entityComponents] as unknown as [Entity, ...T],
            done: false,
          };
        }
        return { value: undefined, done: true };
      },
    };
  }
}
