/**
 * SessionStorage Adapter
 * Handles sessionStorage operations with error handling and availability checks
 */

import type { StorageAdapter } from "./storage-adapter";

export class SessionStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix = "") {
    this.prefix = prefix;
  }

  isAvailable(): boolean {
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

  get(key: string): string | null {
    if (!this.isAvailable()) return null;
    try {
      return sessionStorage.getItem(this.prefix + key);
    } catch (error) {
      console.warn("SessionStorage get error:", error);
      return null;
    }
  }

  set(key: string, value: string): void {
    if (!this.isAvailable()) return;
    try {
      sessionStorage.setItem(this.prefix + key, value);
    } catch (error) {
      console.error("SessionStorage set error:", error);
      throw new Error(`Failed to save setting: ${key}`);
    }
  }

  remove(key: string): void {
    if (!this.isAvailable()) return;
    try {
      sessionStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn("SessionStorage remove error:", error);
    }
  }

  clear(prefix?: string): void {
    if (!this.isAvailable()) return;
    try {
      const targetPrefix = this.prefix + (prefix || "");
      const keys = this.keys(prefix);
      keys.forEach((key) => sessionStorage.removeItem(targetPrefix + key));
    } catch (error) {
      console.error("SessionStorage clear error:", error);
    }
  }

  keys(prefix?: string): string[] {
    if (!this.isAvailable()) return [];
    try {
      const targetPrefix = this.prefix + (prefix || "");
      const keys: string[] = [];

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
