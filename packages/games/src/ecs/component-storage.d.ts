import { Component, ComponentType, StorageType } from "./types";
import { TableStorage } from "./table-storage";
import { SparseSetStorage } from "./sparse-set-storage";
export declare class ComponentStorage {
    private tableStorages;
    private sparseSetStorages;
    getStorage<T extends Component>(componentType: ComponentType<T>, storageType: StorageType): TableStorage<T> | SparseSetStorage<T>;
    getTableStorage<T extends Component>(componentType: ComponentType<T>): TableStorage<T> | undefined;
    getSparseSetStorage<T extends Component>(componentType: ComponentType<T>): SparseSetStorage<T> | undefined;
    clear(): void;
}
