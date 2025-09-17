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
    convertToIterator(queryResult) {
        // This is a simplified conversion - in a real implementation,
        // you'd properly convert the QueryResult to an iterator
        const entities = queryResult.entities || [];
        const components = queryResult.components || [];
        let index = 0;
        return {
            [Symbol.iterator]() {
                return this;
            },
            next() {
                if (index < entities.length) {
                    const entity = entities[index];
                    const entityComponents = components[index] || [];
                    index++;
                    return {
                        value: [entity, ...entityComponents],
                        done: false,
                    };
                }
                return { value: undefined, done: true };
            },
        };
    }
}
