// Component storage manager for handling different storage types
import { StorageType } from "./types";
import { TableStorage } from "./table-storage";
import { SparseSetStorage } from "./sparse-set-storage";
export class ComponentStorage {
    constructor() {
        Object.defineProperty(this, "tableStorages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "sparseSetStorages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    getStorage(componentType, storageType) {
        if (storageType === StorageType.Table) {
            if (!this.tableStorages.has(componentType.id)) {
                this.tableStorages.set(componentType.id, new TableStorage());
            }
            return this.tableStorages.get(componentType.id);
        }
        else {
            if (!this.sparseSetStorages.has(componentType.id)) {
                this.sparseSetStorages.set(componentType.id, new SparseSetStorage());
            }
            return this.sparseSetStorages.get(componentType.id);
        }
    }
    getTableStorage(componentType) {
        return this.tableStorages.get(componentType.id);
    }
    getSparseSetStorage(componentType) {
        return this.sparseSetStorages.get(componentType.id);
    }
    clear() {
        this.tableStorages.clear();
        this.sparseSetStorages.clear();
    }
}
