import { Component, ComponentType, StorageType } from "./types";
export declare class ComponentRegistry {
    private componentTypes;
    private componentIds;
    private nextId;
    register<T extends Component>(name: string, storage: StorageType | undefined, create: () => T): ComponentType<T>;
    getByName<T extends Component>(name: string): ComponentType<T> | undefined;
    getById<T extends Component>(id: number): ComponentType<T> | undefined;
    getAllTypes(): ComponentType<Component>[];
    has(name: string): boolean;
}
