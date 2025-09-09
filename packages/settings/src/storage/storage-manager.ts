/**
 * Storage Manager
 * Orchestrates multiple storage adapters with fallback logic
 */

import type { SettingStorage, SettingsExportData } from "../types";
import type { StorageAdapter } from "./adapters";
import {
  LocalStorageAdapter,
  SessionStorageAdapter,
  MemoryAdapter,
  IndexedDBAdapter,
} from "./adapters";

export class StorageManager {
  private adapters: Map<SettingStorage, StorageAdapter> = new Map();
  private defaultAdapter: SettingStorage;

  constructor(defaultStorage: SettingStorage = "localStorage", prefix = "") {
    this.defaultAdapter = defaultStorage;

    // Initialize adapters
    this.adapters.set("localStorage", new LocalStorageAdapter(prefix));
    this.adapters.set("sessionStorage", new SessionStorageAdapter(prefix));
    this.adapters.set("memory", new MemoryAdapter(prefix));
    this.adapters.set(
      "indexedDB",
      new IndexedDBAdapter("reynard_settings", "settings", prefix),
    );
  }

  /**
   * Register a custom storage adapter
   */
  registerAdapter(type: SettingStorage, adapter: StorageAdapter): void {
    this.adapters.set(type, adapter);
  }

  /**
   * Get the best available storage adapter
   */
  getAdapter(preferredType?: SettingStorage): StorageAdapter {
    const type = preferredType || this.defaultAdapter;
    const adapter = this.adapters.get(type);

    if (adapter && adapter.isAvailable()) {
      return adapter;
    }

    // Fallback to available adapters
    for (const [, fallbackAdapter] of this.adapters) {
      if (fallbackAdapter.isAvailable()) {
        return fallbackAdapter;
      }
    }

    // Last resort: memory adapter
    return new MemoryAdapter();
  }

  /**
   * Get a value using the specified or default storage
   */
  async get(key: string, storageType?: SettingStorage): Promise<string | null> {
    const adapter = this.getAdapter(storageType);
    const result = adapter.get(key);
    return result instanceof Promise ? await result : result;
  }

  /**
   * Set a value using the specified or default storage
   */
  async set(
    key: string,
    value: string,
    storageType?: SettingStorage,
  ): Promise<void> {
    const adapter = this.getAdapter(storageType);
    const result = adapter.set(key, value);
    if (result instanceof Promise) await result;
  }

  /**
   * Remove a value using the specified or default storage
   */
  async remove(key: string, storageType?: SettingStorage): Promise<void> {
    const adapter = this.getAdapter(storageType);
    const result = adapter.remove(key);
    if (result instanceof Promise) await result;
  }

  /**
   * Clear values using the specified or default storage
   */
  async clear(prefix?: string, storageType?: SettingStorage): Promise<void> {
    const adapter = this.getAdapter(storageType);
    const result = adapter.clear(prefix);
    if (result instanceof Promise) await result;
  }

  /**
   * Get all keys using the specified or default storage
   */
  async keys(prefix?: string, storageType?: SettingStorage): Promise<string[]> {
    const adapter = this.getAdapter(storageType);
    const result = adapter.keys(prefix);
    return result instanceof Promise ? await result : result;
  }

  /**
   * Export settings data
   */
  async export(storageType?: SettingStorage): Promise<SettingsExportData> {
    const adapter = this.getAdapter(storageType);
    const keys = await (adapter.keys() instanceof Promise
      ? await adapter.keys()
      : adapter.keys());

    const settings: SettingsExportData["settings"] = {};

    for (const key of keys) {
      try {
        const value = await this.get(key, storageType);
        if (value !== null) {
          settings[key] = JSON.parse(value);
        }
      } catch (error) {
        // Skip invalid JSON values
        console.warn(`Failed to parse setting ${key}:`, error);
      }
    }

    return {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
      settings,
    };
  }

  /**
   * Import settings data
   */
  async import(
    data: SettingsExportData,
    options: { merge?: boolean; storageType?: SettingStorage } = {},
  ): Promise<void> {
    const { merge = false, storageType } = options;

    if (!merge) {
      await this.clear(undefined, storageType);
    }

    for (const [key, value] of Object.entries(data.settings)) {
      try {
        await this.set(key, JSON.stringify(value), storageType);
      } catch (error) {
        console.error(`Failed to import setting ${key}:`, error);
      }
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(storageType?: SettingStorage): Promise<{
    used: number;
    available: number;
    total: number;
  }> {
    const adapter = this.getAdapter(storageType);

    let used = 0;
    if (adapter.getSize) {
      const result = adapter.getSize();
      used = result instanceof Promise ? await result : result;
    }

    // Estimate available space (very rough approximation)
    const total =
      storageType === "localStorage" || storageType === "sessionStorage"
        ? 10 * 1024 * 1024 // ~10MB typical browser limit
        : 1024 * 1024 * 1024; // ~1GB for IndexedDB

    return {
      used,
      available: Math.max(0, total - used),
      total,
    };
  }
}
