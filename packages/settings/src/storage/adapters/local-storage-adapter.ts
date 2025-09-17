/**
 * LocalStorage Adapter
 * Handles localStorage operations with error handling and availability checks
 */

import type { StorageAdapter } from "./storage-adapter";

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix = "") {
    this.prefix = prefix;
  }

  isAvailable(): boolean {
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

  get(key: string): string | null {
    if (!this.isAvailable()) return null;
    try {
      return localStorage.getItem(this.prefix + key);
    } catch (error) {
      console.warn("LocalStorage get error:", error);
      return null;
    }
  }

  set(key: string, value: string): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(this.prefix + key, value);
    } catch (error) {
      console.error("LocalStorage set error:", error);
      throw new Error(`Failed to save setting: ${key}`);
    }
  }

  remove(key: string): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn("LocalStorage remove error:", error);
    }
  }

  clear(prefix?: string): void {
    if (!this.isAvailable()) return;
    try {
      const targetPrefix = this.prefix + (prefix || "");
      const keys = this.keys(prefix);
      keys.forEach(key => localStorage.removeItem(targetPrefix + key));
    } catch (error) {
      console.error("LocalStorage clear error:", error);
    }
  }

  keys(prefix?: string): string[] {
    if (!this.isAvailable()) return [];
    try {
      const targetPrefix = this.prefix + (prefix || "");
      const keys: string[] = [];

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

  getSize(): number {
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
