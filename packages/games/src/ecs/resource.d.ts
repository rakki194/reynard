import { Resource, ResourceType } from "./types";
/**
 * Resource registry for managing resource types.
 */
export declare class ResourceRegistry {
    private resourceTypes;
    private resourceIds;
    private nextId;
    /**
     * Registers a new resource type.
     */
    register<T extends Resource>(name: string, create: () => T): ResourceType<T>;
    /**
     * Gets a resource type by name.
     */
    getByName<T extends Resource>(name: string): ResourceType<T> | undefined;
    /**
     * Gets a resource type by ID.
     */
    getById<T extends Resource>(id: number): ResourceType<T> | undefined;
    /**
     * Gets all registered resource types.
     */
    getAllTypes(): ResourceType<Resource>[];
    /**
     * Checks if a resource type is registered.
     */
    has(name: string): boolean;
}
/**
 * Resource storage for managing global resources.
 */
export declare class ResourceStorage {
    private resources;
    private resourceTypes;
    /**
     * Inserts a resource.
     */
    insert<T extends Resource>(resourceType: ResourceType<T>, resource: T): void;
    /**
     * Gets a resource.
     */
    get<T extends Resource>(resourceType: ResourceType<T>): T | undefined;
    /**
     * Removes a resource.
     */
    remove<T extends Resource>(resourceType: ResourceType<T>): T | undefined;
    /**
     * Checks if a resource exists.
     */
    has<T extends Resource>(resourceType: ResourceType<T>): boolean;
    /**
     * Gets all resource types.
     */
    getResourceTypes(): ResourceType<Resource>[];
    /**
     * Gets all resources.
     */
    getResources(): Resource[];
    /**
     * Clears all resources.
     */
    clear(): void;
}
/**
 * Helper function to create a resource type.
 */
export declare function createResourceType<T extends Resource>(name: string, create: () => T): ResourceType<T>;
