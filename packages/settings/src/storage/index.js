/**
 * Settings Storage Layer
 * Handles persistence and retrieval of settings across different storage mechanisms
 */
/**
 * LocalStorage adapter
 */
export class LocalStorageAdapter {
  constructor(prefix = "") {
    Object.defineProperty(this, "prefix", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    this.prefix = prefix;
  }
  isAvailable() {
    try {
      if (typeof window === "undefined" || !window.localStorage) return false;
      const test = "__storage_test__";
      localStorage.setItem(test, "test");
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  get(key) {
    if (!this.isAvailable()) return null;
    try {
      return localStorage.getItem(this.prefix + key);
    } catch (error) {
      console.warn("LocalStorage get error:", error);
      return null;
    }
  }
  set(key, value) {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(this.prefix + key, value);
    } catch (error) {
      console.error("LocalStorage set error:", error);
      throw new Error(`Failed to save setting: ${key}`);
    }
  }
  remove(key) {
    if (!this.isAvailable()) return;
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn("LocalStorage remove error:", error);
    }
  }
  clear(prefix) {
    if (!this.isAvailable()) return;
    try {
      const targetPrefix = this.prefix + (prefix || "");
      const keys = this.keys(prefix);
      keys.forEach((key) => localStorage.removeItem(targetPrefix + key));
    } catch (error) {
      console.error("LocalStorage clear error:", error);
    }
  }
  keys(prefix) {
    if (!this.isAvailable()) return [];
    try {
      const targetPrefix = this.prefix + (prefix || "");
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(targetPrefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      console.warn("LocalStorage keys error:", error);
      return [];
    }
  }
  getSize() {
    if (!this.isAvailable()) return 0;
    try {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          size += (key.length + (value?.length || 0)) * 2; // UTF-16 encoding
        }
      }
      return size;
    } catch {
      return 0;
    }
  }
}
/**
 * SessionStorage adapter
 */
export class SessionStorageAdapter {
  constructor(prefix = "") {
    Object.defineProperty(this, "prefix", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    this.prefix = prefix;
  }
  isAvailable() {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) return false;
      const test = "__storage_test__";
      sessionStorage.setItem(test, "test");
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  get(key) {
    if (!this.isAvailable()) return null;
    try {
      return sessionStorage.getItem(this.prefix + key);
    } catch (error) {
      console.warn("SessionStorage get error:", error);
      return null;
    }
  }
  set(key, value) {
    if (!this.isAvailable()) return;
    try {
      sessionStorage.setItem(this.prefix + key, value);
    } catch (error) {
      console.error("SessionStorage set error:", error);
      throw new Error(`Failed to save setting: ${key}`);
    }
  }
  remove(key) {
    if (!this.isAvailable()) return;
    try {
      sessionStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn("SessionStorage remove error:", error);
    }
  }
  clear(prefix) {
    if (!this.isAvailable()) return;
    try {
      const targetPrefix = this.prefix + (prefix || "");
      const keys = this.keys(prefix);
      keys.forEach((key) => sessionStorage.removeItem(targetPrefix + key));
    } catch (error) {
      console.error("SessionStorage clear error:", error);
    }
  }
  keys(prefix) {
    if (!this.isAvailable()) return [];
    try {
      const targetPrefix = this.prefix + (prefix || "");
      const keys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(targetPrefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      console.warn("SessionStorage keys error:", error);
      return [];
    }
  }
}
/**
 * Memory adapter (for testing and temporary storage)
 */
export class MemoryAdapter {
  constructor(prefix = "") {
    Object.defineProperty(this, "storage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: new Map(),
    });
    Object.defineProperty(this, "prefix", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    this.prefix = prefix;
  }
  isAvailable() {
    return true;
  }
  get(key) {
    return this.storage.get(this.prefix + key) || null;
  }
  set(key, value) {
    this.storage.set(this.prefix + key, value);
  }
  remove(key) {
    this.storage.delete(this.prefix + key);
  }
  clear(prefix) {
    const targetPrefix = this.prefix + (prefix || "");
    for (const key of this.storage.keys()) {
      if (key.startsWith(targetPrefix)) {
        this.storage.delete(key);
      }
    }
  }
  keys(prefix) {
    const targetPrefix = this.prefix + (prefix || "");
    const keys = [];
    for (const key of this.storage.keys()) {
      if (key.startsWith(targetPrefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }
  getSize() {
    let size = 0;
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(this.prefix)) {
        size += (key.length + value.length) * 2;
      }
    }
    return size;
  }
}
/**
 * IndexedDB adapter (for larger data storage)
 */
export class IndexedDBAdapter {
  constructor(
    dbName = "reynard_settings",
    storeName = "settings",
    prefix = "",
  ) {
    Object.defineProperty(this, "dbName", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, "storeName", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, "prefix", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, "db", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null,
    });
    this.dbName = dbName;
    this.storeName = storeName;
    this.prefix = prefix;
  }
  isAvailable() {
    return typeof window !== "undefined" && "indexedDB" in window;
  }
  async getDB() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error("IndexedDB not available"));
        return;
      }
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }
  async get(key) {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.get(this.prefix + key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch (error) {
      console.warn("IndexedDB get error:", error);
      return null;
    }
  }
  async set(key, value) {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.put(value, this.prefix + key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error("IndexedDB set error:", error);
      throw new Error(`Failed to save setting: ${key}`);
    }
  }
  async remove(key) {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.delete(this.prefix + key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn("IndexedDB remove error:", error);
    }
  }
  async clear(prefix) {
    try {
      const keys = await this.keys(prefix);
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const targetPrefix = this.prefix + (prefix || "");
      return new Promise((resolve, reject) => {
        let completed = 0;
        const total = keys.length;
        if (total === 0) {
          resolve();
          return;
        }
        keys.forEach((key) => {
          const request = store.delete(targetPrefix + key);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            completed++;
            if (completed === total) resolve();
          };
        });
      });
    } catch (error) {
      console.error("IndexedDB clear error:", error);
    }
  }
  async keys(prefix) {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.getAllKeys();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const targetPrefix = this.prefix + (prefix || "");
          const keys = request.result
            .filter((key) => key.startsWith(targetPrefix))
            .map((key) => key.substring(this.prefix.length));
          resolve(keys);
        };
      });
    } catch (error) {
      console.warn("IndexedDB keys error:", error);
      return [];
    }
  }
  async getSize() {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          let size = 0;
          const results = request.result;
          results.forEach((value) => {
            size += value.length * 2; // UTF-16 encoding
          });
          resolve(size);
        };
      });
    } catch {
      return 0;
    }
  }
}
/**
 * Storage manager that handles multiple storage types
 */
export class StorageManager {
  constructor(defaultStorage = "localStorage", prefix = "") {
    Object.defineProperty(this, "adapters", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: new Map(),
    });
    Object.defineProperty(this, "defaultAdapter", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
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
  registerAdapter(type, adapter) {
    this.adapters.set(type, adapter);
  }
  /**
   * Get the best available storage adapter
   */
  getAdapter(preferredType) {
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
  async get(key, storageType) {
    const adapter = this.getAdapter(storageType);
    const result = adapter.get(key);
    return result instanceof Promise ? await result : result;
  }
  /**
   * Set a value using the specified or default storage
   */
  async set(key, value, storageType) {
    const adapter = this.getAdapter(storageType);
    const result = adapter.set(key, value);
    if (result instanceof Promise) await result;
  }
  /**
   * Remove a value using the specified or default storage
   */
  async remove(key, storageType) {
    const adapter = this.getAdapter(storageType);
    const result = adapter.remove(key);
    if (result instanceof Promise) await result;
  }
  /**
   * Clear values using the specified or default storage
   */
  async clear(prefix, storageType) {
    const adapter = this.getAdapter(storageType);
    const result = adapter.clear(prefix);
    if (result instanceof Promise) await result;
  }
  /**
   * Get all keys using the specified or default storage
   */
  async keys(prefix, storageType) {
    const adapter = this.getAdapter(storageType);
    const result = adapter.keys(prefix);
    return result instanceof Promise ? await result : result;
  }
  /**
   * Export settings data
   */
  async export(storageType) {
    const adapter = this.getAdapter(storageType);
    const keys = await (adapter.keys() instanceof Promise
      ? await adapter.keys()
      : adapter.keys());
    const settings = {};
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
  async import(data, options = {}) {
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
  async getStorageInfo(storageType) {
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
