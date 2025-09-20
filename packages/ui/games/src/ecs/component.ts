// Component system barrel exports

// Export all component-related classes and utilities
export { ComponentRegistry } from "./component-registry";
export { TableStorage } from "./table-storage";
export { SparseSetStorage } from "./sparse-set-storage";
export { ComponentStorage } from "./component-storage";
export { createComponentType } from "./component-utils";

// Re-export types for convenience
export type { Component, ComponentType, StorageType } from "./types";
