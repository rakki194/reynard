// Resource system implementation

import { Resource, ResourceType } from "./types";

/**
 * Resource registry for managing resource types.
 */
export class ResourceRegistry {
  private resourceTypes: Map<string, ResourceType<Resource>> = new Map();
  private resourceIds: Map<number, ResourceType<Resource>> = new Map();
  private nextId: number = 0;

  /**
   * Registers a new resource type.
   */
  register<T extends Resource>(name: string, create: () => T): ResourceType<T> {
    if (this.resourceTypes.has(name)) {
      throw new Error(`Resource type '${name}' is already registered`);
    }

    const id = this.nextId++;
    const resourceType: ResourceType<T> = {
      name,
      id,
      create,
    };

    this.resourceTypes.set(name, resourceType);
    this.resourceIds.set(id, resourceType);
    return resourceType;
  }

  /**
   * Gets a resource type by name.
   */
  getByName<T extends Resource>(name: string): ResourceType<T> | undefined {
    return this.resourceTypes.get(name) as ResourceType<T> | undefined;
  }

  /**
   * Gets a resource type by ID.
   */
  getById<T extends Resource>(id: number): ResourceType<T> | undefined {
    return this.resourceIds.get(id) as ResourceType<T> | undefined;
  }

  /**
   * Gets all registered resource types.
   */
  getAllTypes(): ResourceType<Resource>[] {
    return Array.from(this.resourceTypes.values());
  }

  /**
   * Checks if a resource type is registered.
   */
  has(name: string): boolean {
    return this.resourceTypes.has(name);
  }
}

/**
 * Resource storage for managing global resources.
 */
export class ResourceStorage {
  private resources: Map<number, Resource> = new Map();
  private resourceTypes: Map<number, ResourceType<Resource>> = new Map();

  /**
   * Inserts a resource.
   */
  insert<T extends Resource>(resourceType: ResourceType<T>, resource: T): void {
    this.resources.set(resourceType.id, resource);
    this.resourceTypes.set(resourceType.id, resourceType);
  }

  /**
   * Gets a resource.
   */
  get<T extends Resource>(resourceType: ResourceType<T>): T | undefined {
    return this.resources.get(resourceType.id) as T | undefined;
  }

  /**
   * Removes a resource.
   */
  remove<T extends Resource>(resourceType: ResourceType<T>): T | undefined {
    const resource = this.resources.get(resourceType.id) as T | undefined;
    this.resources.delete(resourceType.id);
    this.resourceTypes.delete(resourceType.id);
    return resource;
  }

  /**
   * Checks if a resource exists.
   */
  has<T extends Resource>(resourceType: ResourceType<T>): boolean {
    return this.resources.has(resourceType.id);
  }

  /**
   * Gets all resource types.
   */
  getResourceTypes(): ResourceType<Resource>[] {
    return Array.from(this.resourceTypes.values());
  }

  /**
   * Gets all resources.
   */
  getResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  /**
   * Clears all resources.
   */
  clear(): void {
    this.resources.clear();
    this.resourceTypes.clear();
  }
}

/**
 * Helper function to create a resource type.
 */
export function createResourceType<T extends Resource>(
  name: string,
  create: () => T,
): ResourceType<T> {
  return {
    name,
    id: 0, // Will be set by registry
    create,
  };
}
