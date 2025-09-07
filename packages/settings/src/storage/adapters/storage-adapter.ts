/**
 * Storage Adapter Interface
 * Defines the contract for all storage adapters
 */

export interface StorageAdapter {
  /** Get a value from storage */
  get(key: string): Promise<string | null> | string | null;
  /** Set a value in storage */
  set(key: string, value: string): Promise<void> | void;
  /** Remove a value from storage */
  remove(key: string): Promise<void> | void;
  /** Clear all values with optional prefix filter */
  clear(prefix?: string): Promise<void> | void;
  /** Get all keys with optional prefix filter */
  keys(prefix?: string): Promise<string[]> | string[];
  /** Check if storage is available */
  isAvailable(): boolean;
  /** Get storage size information */
  getSize?(): Promise<number> | number;
}
