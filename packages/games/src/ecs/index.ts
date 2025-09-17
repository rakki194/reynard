// Main ECS exports

// Core types
export * from "./types";

// Entity system
export * from "./entity";

// Component system
export * from "./component";

// Resource system
export * from "./resource";

// Query system
export * from "./query";

// World system
export * from "./world";

// System system
export * from "./system";

// Archetype system
export * from "./archetype";

// Change detection system
export * from "./change-detection";

// Bundle system
export * from "./bundle";

// Event system
export * from "./event";

// Parallel execution system
export * from "./parallel";

// System conditions
export * from "./conditions";

// Component hooks
export * from "./component-hooks";

// Query state management
export * from "./query-state";

// Re-export commonly used items for convenience
export {
  createEntity,
  createPlaceholderEntity,
  entityToString,
  entityToBits,
  entityFromBits,
  entityEquals,
  entityCompare,
} from "./entity";

export { createWorld } from "./world";

export { createComponentType, ComponentRegistry, ComponentStorage, TableStorage, SparseSetStorage } from "./component";

export { createResourceType, ResourceRegistry, ResourceStorage } from "./resource";

export { query, QueryBuilder, QueryResultImpl } from "./query";

export { WorldImpl, CommandsImpl } from "./world";

export {
  system,
  schedule,
  systemSet,
  SystemImpl,
  ScheduleImpl,
  SystemBuilder,
  SystemSet,
  SystemSetConfig,
} from "./system";

export {
  Archetype,
  Archetypes,
  createArchetypeId,
  createArchetypeRow,
  ARCHETYPE_IDS,
  ARCHETYPE_ROWS,
} from "./archetype";

export type { ArchetypeId, ArchetypeRow } from "./archetype";

export { ChangeDetectionImpl, createTick, createComponentTicks } from "./change-detection";

export type { ChangeDetection } from "./change-detection";

export type { ComponentTicks, Tick } from "./change-detection";

export { BundleRegistry, createBundle, createBundleFromTypes, createBundleInfo } from "./bundle";

export type { Bundle } from "./bundle";

export type { BundleInfo } from "./bundle";

export { Events, EventReaderImpl, EventWriterImpl, EventRegistry, createEventId } from "./event";

export type { EventInstance, EventId } from "./event";

export { ParallelIteratorImpl, ParallelCommandsImpl, TaskPool, TASK_POOL, DEFAULT_BATCHING_STRATEGY } from "./parallel";

export type { ParallelIterator, ParallelCommands } from "./parallel";

export type { BatchingStrategy } from "./parallel";

export { Conditions, ConditionCombinators, createCondition } from "./conditions";

export type { SystemCondition } from "./conditions";

export { ComponentHookRegistry, CommonHooks, createComponentHooks } from "./component-hooks";

export type { ComponentHooks } from "./component-hooks";

export type { ComponentHook } from "./component-hooks";

export { QueryStateManager, QueryStateBuilder, queryState } from "./query-state";

export type { QueryState } from "./query-state";
