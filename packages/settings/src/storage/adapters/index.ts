/**
 * Storage Adapters Barrel Export
 * Clean API boundary for all storage adapters
 */

export type { StorageAdapter } from "./storage-adapter";
export { LocalStorageAdapter } from "./local-storage-adapter";
export { SessionStorageAdapter } from "./session-storage-adapter";
export { MemoryAdapter } from "./memory-adapter";
export { IndexedDBAdapter } from "./indexeddb-adapter";
