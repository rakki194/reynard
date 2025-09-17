import { Component } from "./types";
export declare class TableStorage<T extends Component> {
    private components;
    private entityToIndex;
    private indexToEntity;
    insert(entityIndex: number, component: T): void;
    get(entityIndex: number): T | undefined;
    remove(entityIndex: number): T | undefined;
    has(entityIndex: number): boolean;
    getEntities(): number[];
    getComponents(): T[];
    getCount(): number;
    clear(): void;
}
