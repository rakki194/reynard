// Resource operations for the ECS world

import {
  Resource,
  ResourceType,
} from "./types";

import { ResourceRegistry, ResourceStorage } from "./resource";

/**
 * Resource operations mixin for WorldImpl.
 * This provides resource management functionality.
 */
export class ResourceOperationsMixin {
  constructor(
    private resourceRegistry: ResourceRegistry,
    private resourceStorage: ResourceStorage
  ) {}

  /**
   * Inserts a resource into the world.
   */
  insertResource<T extends Resource>(resource: T): void {
    const resourceType = this.findResourceType(resource);
    if (!resourceType) {
      throw new Error(`Resource type not registered: ${resource.constructor.name}`);
    }
    this.resourceStorage.insert(resourceType, resource);
  }

  /**
   * Adds a resource to the world (alias for insertResource).
   */
  addResource<T extends Resource>(resourceType: ResourceType<T>, resource: T): void {
    this.resourceStorage.insert(resourceType, resource);
  }

  /**
   * Removes a resource from the world.
   */
  removeResource<T extends Resource>(resourceType: ResourceType<T>): T | undefined {
    return this.resourceStorage.remove(resourceType);
  }

  /**
   * Gets a resource from the world.
   */
  getResource<T extends Resource>(resourceType: ResourceType<T>): T | undefined {
    return this.resourceStorage.get(resourceType);
  }

  /**
   * Gets a mutable resource from the world.
   */
  getResourceMut<T extends Resource>(resourceType: ResourceType<T>): T | undefined {
    // For now, same as get - in a real implementation, this would track mutability
    return this.resourceStorage.get(resourceType);
  }

  /**
   * Checks if a resource exists in the world.
   */
  hasResource<T extends Resource>(resourceType: ResourceType<T>): boolean {
    return this.resourceStorage.has(resourceType);
  }

  /**
   * Finds a resource type by resource instance.
   */
  private findResourceType(resource: Resource): ResourceType<any> | undefined {
    const resourceName = resource.constructor.name;
    let resourceType = this.resourceRegistry.getByName(resourceName);

    // Auto-register resource type if not found
    if (!resourceType) {
      resourceType = this.resourceRegistry.register(resourceName, () => new (resource.constructor as any)());
    }

    return resourceType;
  }
}
