import { Component, ComponentType, StorageType } from "./types";
export declare function createComponentType<T extends Component>(name: string): ComponentType<T>;
export declare function createComponentType<T extends Component>(name: string, storage: StorageType, create: () => T): ComponentType<T>;
