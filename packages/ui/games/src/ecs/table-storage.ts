// Table-based component storage implementation

import { Component } from "./types";

export class TableStorage<T extends Component> {
  private components: T[] = [];
  private entityToIndex: Map<number, number> = new Map();
  private indexToEntity: Map<number, number> = new Map();

  insert(entityIndex: number, component: T): void {
    if (this.entityToIndex.has(entityIndex)) {
      const index = this.entityToIndex.get(entityIndex)!;
      this.components[index] = component;
    } else {
      const index = this.components.length;
      this.components.push(component);
      this.entityToIndex.set(entityIndex, index);
      this.indexToEntity.set(index, entityIndex);
    }
  }

  get(entityIndex: number): T | undefined {
    const index = this.entityToIndex.get(entityIndex);
    return index !== undefined ? this.components[index] : undefined;
  }

  remove(entityIndex: number): T | undefined {
    const index = this.entityToIndex.get(entityIndex);
    if (index === undefined) return undefined;

    const component = this.components[index];
    const lastIndex = this.components.length - 1;

    if (index !== lastIndex) {
      const lastEntity = this.indexToEntity.get(lastIndex)!;
      this.components[index] = this.components[lastIndex];
      this.entityToIndex.set(lastEntity, index);
      this.indexToEntity.set(index, lastEntity);
    }

    this.components.pop();
    this.entityToIndex.delete(entityIndex);
    this.indexToEntity.delete(lastIndex);
    return component;
  }

  has(entityIndex: number): boolean {
    return this.entityToIndex.has(entityIndex);
  }

  getEntities(): number[] {
    return Array.from(this.entityToIndex.keys());
  }

  getComponents(): T[] {
    return [...this.components];
  }

  getCount(): number {
    return this.components.length;
  }

  clear(): void {
    this.components.length = 0;
    this.entityToIndex.clear();
    this.indexToEntity.clear();
  }
}
