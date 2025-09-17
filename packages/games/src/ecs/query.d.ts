import { ComponentStorage } from "./component";
import { Component, ComponentType, Entity, QueryFilter, QueryResult } from "./types";
/**
 * Helper type to extract component types from ComponentType array.
 * This maps ComponentType<T>[] to T[] for proper type inference.
 */
export type ExtractComponentTypes<T extends ComponentType<Component>[]> = {
    [K in keyof T]: T[K] extends ComponentType<infer U> ? U : never;
};
/**
 * Query result implementation.
 */
export declare class QueryResultImpl<T extends Component[]> implements QueryResult<T> {
    readonly entities: Entity[];
    readonly components: T;
    readonly length: number;
    private readonly componentTypes;
    private readonly entityComponents;
    constructor(entities: Entity[], components: T, length: number, componentTypes?: ComponentType<Component>[], entityComponents?: Map<number, Component[]>);
    forEach(callback: (entity: Entity, ...components: T) => void | false): void;
    map<U>(callback: (entity: Entity, ...components: T) => U): U[];
    filter(predicate: (entity: Entity, ...components: T) => boolean): QueryResult<T>;
    first(): {
        entity: Entity;
        components: T;
    } | undefined;
    private getComponentValuesForEntity;
}
/**
 * Query builder for constructing component queries.
 */
export declare class QueryBuilder<T extends Component[]> {
    componentTypes: ComponentType<Component>[];
    filters: QueryFilter;
    with<U extends Component>(componentType: ComponentType<U>): QueryBuilder<[...T, U]>;
    without<U extends Component>(componentType: ComponentType<U>): this;
    filter(filter: QueryFilter): this;
    build(): Query<T>;
    execute(entityManager: {
        getAllEntities(): Entity[];
    }, componentStorage: ComponentStorage, changeDetection?: {
        isAdded(entity: Entity, type: ComponentType<Component>): boolean;
        isChanged(entity: Entity, type: ComponentType<Component>): boolean;
        isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    }): QueryResult<T>;
    forEach(_callback: (entity: Entity, ...components: T) => void | false): void;
}
/**
 * Query implementation.
 */
export declare class QueryImpl<T extends Component[]> {
    private componentTypes;
    private filters;
    constructor(componentTypes: ComponentType<T[number]>[], filters: QueryFilter);
    added<U extends Component>(componentType: ComponentType<U>): Query<T>;
    changed<U extends Component>(componentType: ComponentType<U>): Query<T>;
    removed<U extends Component>(componentType: ComponentType<U>): Query<T>;
    execute(entityManager: {
        getAllEntities(): Entity[];
    }, componentStorage: ComponentStorage, changeDetection?: {
        isAdded(entity: Entity, type: ComponentType<Component>): boolean;
        isChanged(entity: Entity, type: ComponentType<Component>): boolean;
        isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    }): QueryResult<T>;
    private hasAllComponents;
    private getEntityComponents;
    private passesFilters;
    private checkWithFilter;
    private checkWithoutFilter;
    private checkAddedFilter;
    private checkChangedFilter;
    private checkRemovedFilter;
}
export interface Query<T extends Component[]> {
    execute(entityManager: {
        getAllEntities(): Entity[];
    }, componentStorage: ComponentStorage, changeDetection?: {
        isAdded(entity: Entity, type: ComponentType<Component>): boolean;
        isChanged(entity: Entity, type: ComponentType<Component>): boolean;
        isRemoved(entity: Entity, type: ComponentType<Component>): boolean;
    }): QueryResult<T>;
    added<U extends Component>(componentType: ComponentType<U>): Query<T>;
    changed<U extends Component>(componentType: ComponentType<U>): Query<T>;
    removed<U extends Component>(componentType: ComponentType<U>): Query<T>;
}
export declare function query<T extends Component[] = []>(): QueryBuilder<T>;
