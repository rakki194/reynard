// Component storage manager for handling different storage types

import { Component, ComponentType, StorageType } from './types';
import { TableStorage } from './table-storage';
import { SparseSetStorage } from './sparse-set-storage';

export class ComponentStorage {
  private tableStorages: Map<number, TableStorage<Component>> = new Map();
  private sparseSetStorages: Map<number, SparseSetStorage<Component>> = new Map();

  getStorage<T extends Component>(
    componentType: ComponentType<T>,
    storageType: StorageType
  ): TableStorage<T> | SparseSetStorage<T> {
    if (storageType === StorageType.Table) {
      if (!this.tableStorages.has(componentType.id)) {
        this.tableStorages.set(componentType.id, new TableStorage<T>());
      }
      return this.tableStorages.get(componentType.id)! as TableStorage<T>;
    } else {
      if (!this.sparseSetStorages.has(componentType.id)) {
        this.sparseSetStorages.set(componentType.id, new SparseSetStorage<T>());
      }
      return this.sparseSetStorages.get(componentType.id)! as SparseSetStorage<T>;
    }
  }

  getTableStorage<T extends Component>(componentType: ComponentType<T>): TableStorage<T> | undefined {
    return this.tableStorages.get(componentType.id) as TableStorage<T> | undefined;
  }

  getSparseSetStorage<T extends Component>(componentType: ComponentType<T>): SparseSetStorage<T> | undefined {
    return this.sparseSetStorages.get(componentType.id) as SparseSetStorage<T> | undefined;
  }

  clear(): void {
    this.tableStorages.clear();
    this.sparseSetStorages.clear();
  }
}
