// Query system barrel exports

import { Component, ComponentType } from "./types";
import { QueryBuilder } from "./query-builder";

/**
 * Helper type to extract component types from ComponentType array.
 * This maps ComponentType<T>[] to T[] for proper type inference.
 */
export type ExtractComponentTypes<T extends ComponentType<Component>[]> = {
  [K in keyof T]: T[K] extends ComponentType<infer U> ? U : never;
};

// Re-export all query-related classes and functions
export { QueryResultImpl } from "./query-result";
export { QueryBuilder } from "./query-builder";
export type { Query } from "./query-builder";
export { QueryImpl } from "./query-impl";

export function query<T extends Component[] = []>(): QueryBuilder<T> {
  return new QueryBuilder<T>();
}
