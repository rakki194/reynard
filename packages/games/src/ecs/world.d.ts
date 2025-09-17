import { Commands, Component, ComponentType, Entity, World as IWorld, QueryFilter, QueryResult, Resource, ResourceType, System } from "./types";
import { ChangeDetectionImpl } from "./change-detection";
import { ComponentRegistry } from "./component";
import { QueryBuilder } from "./query";
import { ResourceRegistry } from "./resource";
/**
 * Commands implementation for deferred world modifications.
 */
export declare class CommandsImpl implements Commands {
    private world;
    private commands;
    constructor(world: WorldImpl);
    spawn<T extends Component[]>(...components: T): Entity;
    spawnEmpty(): Entity;
    despawn(entity: Entity): void;
    insert<T extends Component[]>(entity: Entity, ...components: T): void;
    remove<T extends Component[]>(entity: Entity, ...componentTypes: ComponentType<T[number]>[]): void;
    insertResource<T extends Resource>(resource: T): void;
    removeResource<T extends Resource>(resourceType: ResourceType<T>): void;
    /**
     * Applies all queued commands.
     */
    apply(): void;
    /**
     * Clears all queued commands.
     */
    clear(): void;
}
/**
 * World implementation.
 */
export declare class WorldImpl implements IWorld {
    private entityManager;
    private componentRegistry;
    private componentStorage;
    private resourceRegistry;
    private resourceStorage;
    private systems;
    private schedules;
    private changeDetection;
    private archetypes;
    private entityToArchetype;
    constructor();
    spawn<T extends Component[]>(...components: T): Entity;
    spawnEmpty(): Entity;
    despawn(entity: Entity): boolean;
    contains(entity: Entity): boolean;
    isAlive(entity: Entity): boolean;
    insert<T extends Component[]>(entity: Entity, ...components: T): void;
    add<T extends Component>(entity: Entity, componentType: ComponentType<T>, component: T): void;
    remove<T extends Component[]>(entity: Entity, ...componentTypes: ComponentType<T[number]>[]): void;
    get<T extends Component>(entity: Entity, componentType: ComponentType<T>): T | undefined;
    getMut<T extends Component>(entity: Entity, componentType: ComponentType<T>): T | undefined;
    has<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    insertResource<T extends Resource>(resource: T): void;
    addResource<T extends Resource>(resourceType: ResourceType<T>, resource: T): void;
    removeResource<T extends Resource>(resourceType: ResourceType<T>): T | undefined;
    getResource<T extends Resource>(resourceType: ResourceType<T>): T | undefined;
    getResourceMut<T extends Resource>(resourceType: ResourceType<T>): T | undefined;
    hasResource<T extends Resource>(resourceType: ResourceType<T>): boolean;
    query<T extends Component[]>(...componentTypes: ComponentType<T[number]>[]): QueryBuilder<T> & {
        forEach: (callback: (entity: Entity, ...components: T) => void | false) => void;
        first: () => {
            entity: Entity;
            components: T;
        } | undefined;
        added: (componentType: ComponentType<any>) => any;
        changed: (componentType: ComponentType<any>) => any;
        removed: (componentType: ComponentType<any>) => any;
    };
    queryFiltered<T extends Component[]>(componentTypes: ComponentType<T[number]>[], filter: QueryFilter): QueryResult<T>;
    addSystem(system: System): void;
    removeSystem(systemName: string): void;
    runSystem(systemName: string): void;
    runSchedule(scheduleName: string): void;
    commands(): Commands;
    getEntityCount(): number;
    getComponentCount<T extends Component>(componentType: ComponentType<T>): number;
    getComponentRegistry(): ComponentRegistry;
    getResourceRegistry(): ResourceRegistry;
    getArchetype(entity: Entity): any;
    getChangeDetection(): ChangeDetectionImpl;
    private findComponentType;
    /**
     * Updates an entity's archetype based on its current components.
     */
    private updateEntityArchetype;
    private findResourceType;
}
/**
 * Creates a new world instance.
 */
export declare function createWorld(): IWorld;
