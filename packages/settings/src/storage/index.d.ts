/**
 * Settings Storage Layer
 * Handles persistence and retrieval of settings across different storage mechanisms
 */
import type { SettingStorage, SettingsExportData } from "../types";
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
/**
 * LocalStorage adapter
 */
export declare class LocalStorageAdapter implements StorageAdapter {
  private prefix;
  constructor(prefix?: string);
  isAvailable(): boolean;
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(prefix?: string): void;
  keys(prefix?: string): string[];
  getSize(): number;
}
/**
 * SessionStorage adapter
 */
export declare class SessionStorageAdapter implements StorageAdapter {
  private prefix;
  constructor(prefix?: string);
  isAvailable(): boolean;
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(prefix?: string): void;
  keys(prefix?: string): string[];
}
/**
 * Memory adapter (for testing and temporary storage)
 */
export declare class MemoryAdapter implements StorageAdapter {
  private storage;
  private prefix;
  constructor(prefix?: string);
  isAvailable(): boolean;
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(prefix?: string): void;
  keys(prefix?: string): string[];
  getSize(): number;
}
/**
 * IndexedDB adapter (for larger data storage)
 */
export declare class IndexedDBAdapter implements StorageAdapter {
  private dbName;
  private storeName;
  private prefix;
  private db;
  constructor(dbName?: string, storeName?: string, prefix?: string);
  isAvailable(): boolean;
  private getDB;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(prefix?: string): Promise<void>;
  keys(prefix?: string): Promise<string[]>;
  getSize(): Promise<number>;
}
/**
 * Storage manager that handles multiple storage types
 */
export declare class StorageManager {
  private adapters;
  private defaultAdapter;
  constructor(defaultStorage?: SettingStorage, prefix?: string);
  /**
   * Register a custom storage adapter
   */
  registerAdapter(type: SettingStorage, adapter: StorageAdapter): void;
  /**
   * Get the best available storage adapter
   */
  getAdapter(preferredType?: SettingStorage): StorageAdapter;
  /**
   * Get a value using the specified or default storage
   */
  get(key: string, storageType?: SettingStorage): Promise<string | null>;
  /**
   * Set a value using the specified or default storage
   */
  set(key: string, value: string, storageType?: SettingStorage): Promise<void>;
  /**
   * Remove a value using the specified or default storage
   */
  remove(key: string, storageType?: SettingStorage): Promise<void>;
  /**
   * Clear values using the specified or default storage
   */
  clear(prefix?: string, storageType?: SettingStorage): Promise<void>;
  /**
   * Get all keys using the specified or default storage
   */
  keys(prefix?: string, storageType?: SettingStorage): Promise<string[]>;
  /**
   * Export settings data
   */
  export(storageType?: SettingStorage): Promise<SettingsExportData>;
  /**
   * Import settings data
   */
  import(
    data: SettingsExportData,
    options?: {
      merge?: boolean;
      storageType?: SettingStorage;
    },
  ): Promise<void>;
  /**
   * Get storage usage information
   */
  getStorageInfo(storageType?: SettingStorage): Promise<{
    used: number;
    available: number;
    total: number;
  }>;
}
