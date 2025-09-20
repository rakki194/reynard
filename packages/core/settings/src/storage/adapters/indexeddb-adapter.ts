/**
 * IndexedDB Adapter
 * Handles IndexedDB operations for larger data storage
 */

import type { StorageAdapter } from "./storage-adapter";

export class IndexedDBAdapter implements StorageAdapter {
  private dbName: string;
  private storeName: string;
  private prefix: string;
  private db: IDBDatabase | null = null;

  constructor(dbName = "reynard_settings", storeName = "settings", prefix = "") {
    this.dbName = dbName;
    this.storeName = storeName;
    this.prefix = prefix;
  }

  isAvailable(): boolean {
    return typeof window !== "undefined" && "indexedDB" in window;
  }

  private async getDB(): Promise<IDBDatabase> {
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

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async get(key: string): Promise<string | null> {
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

  async set(key: string, value: string): Promise<void> {
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

  async remove(key: string): Promise<void> {
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

  async clear(prefix?: string): Promise<void> {
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

        keys.forEach(key => {
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

  async keys(prefix?: string): Promise<string[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAllKeys();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const targetPrefix = this.prefix + (prefix || "");
          const keys = (request.result as string[])
            .filter(key => key.startsWith(targetPrefix))
            .map(key => key.substring(this.prefix.length));
          resolve(keys);
        };
      });
    } catch (error) {
      console.warn("IndexedDB keys error:", error);
      return [];
    }
  }

  async getSize(): Promise<number> {
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
          results.forEach((value: string) => {
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
