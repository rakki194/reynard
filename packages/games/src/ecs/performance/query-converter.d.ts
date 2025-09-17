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
export declare class QueryConverter {
    /**
     * Convert QueryResult to IterableIterator for compatibility.
     */
    convertToIterator<T extends Component[]>(queryResult: Record<string, unknown>): IterableIterator<[Entity, ...T]>;
}
