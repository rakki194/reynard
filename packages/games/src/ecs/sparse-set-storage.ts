// Sparse set-based component storage implementation

import { Component } from './types';

export class SparseSetStorage<T extends Component> {
  private components: Map<number, T> = new Map();

  insert(entityIndex: number, component: T): void {
    this.components.set(entityIndex, component);
  }

  get(entityIndex: number): T | undefined {
    return this.components.get(entityIndex);
  }

  remove(entityIndex: number): T | undefined {
    const component = this.components.get(entityIndex);
    this.components.delete(entityIndex);
    return component;
  }

  has(entityIndex: number): boolean {
    return this.components.has(entityIndex);
  }

  getEntities(): number[] {
    return Array.from(this.components.keys());
  }

  getComponents(): T[] {
    return Array.from(this.components.values());
  }

  getCount(): number {
    return this.components.size;
  }

  clear(): void {
    this.components.clear();
  }
}
