/**
 * Memory Adapter
 * In-memory storage for testing and temporary storage
 */

import type { StorageAdapter } from "./storage-adapter";

export class MemoryAdapter implements StorageAdapter {
  private storage = new Map<string, string>();
  private prefix: string;

  constructor(prefix = "") {
    this.prefix = prefix;
  }

  isAvailable(): boolean {
    return true;
  }

  get(key: string): string | null {
    return this.storage.get(this.prefix + key) || null;
  }

  set(key: string, value: string): void {
    this.storage.set(this.prefix + key, value);
  }

  remove(key: string): void {
    this.storage.delete(this.prefix + key);
  }

  clear(prefix?: string): void {
    const targetPrefix = this.prefix + (prefix || "");
    for (const key of this.storage.keys()) {
      if (key.startsWith(targetPrefix)) {
        this.storage.delete(key);
      }
    }
  }

  keys(prefix?: string): string[] {
    const targetPrefix = this.prefix + (prefix || "");
    const keys: string[] = [];

    for (const key of this.storage.keys()) {
      if (key.startsWith(targetPrefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }

    return keys;
  }

  getSize(): number {
    let size = 0;
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(this.prefix)) {
        size += (key.length + value.length) * 2;
      }
    }
    return size;
  }
}
