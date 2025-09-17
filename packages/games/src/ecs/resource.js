// Resource system implementation
/**
 * Resource registry for managing resource types.
 */
export class ResourceRegistry {
    constructor() {
        Object.defineProperty(this, "resourceTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "resourceIds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "nextId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    /**
     * Registers a new resource type.
     */
    register(name, create) {
        if (this.resourceTypes.has(name)) {
            throw new Error(`Resource type '${name}' is already registered`);
        }
        const id = this.nextId++;
        const resourceType = {
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
    getByName(name) {
        return this.resourceTypes.get(name);
    }
    /**
     * Gets a resource type by ID.
     */
    getById(id) {
        return this.resourceIds.get(id);
    }
    /**
     * Gets all registered resource types.
     */
    getAllTypes() {
        return Array.from(this.resourceTypes.values());
    }
    /**
     * Checks if a resource type is registered.
     */
    has(name) {
        return this.resourceTypes.has(name);
    }
}
/**
 * Resource storage for managing global resources.
 */
export class ResourceStorage {
    constructor() {
        Object.defineProperty(this, "resources", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "resourceTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Inserts a resource.
     */
    insert(resourceType, resource) {
        this.resources.set(resourceType.id, resource);
        this.resourceTypes.set(resourceType.id, resourceType);
    }
    /**
     * Gets a resource.
     */
    get(resourceType) {
        return this.resources.get(resourceType.id);
    }
    /**
     * Removes a resource.
     */
    remove(resourceType) {
        const resource = this.resources.get(resourceType.id);
        this.resources.delete(resourceType.id);
        this.resourceTypes.delete(resourceType.id);
        return resource;
    }
    /**
     * Checks if a resource exists.
     */
    has(resourceType) {
        return this.resources.has(resourceType.id);
    }
    /**
     * Gets all resource types.
     */
    getResourceTypes() {
        return Array.from(this.resourceTypes.values());
    }
    /**
     * Gets all resources.
     */
    getResources() {
        return Array.from(this.resources.values());
    }
    /**
     * Clears all resources.
     */
    clear() {
        this.resources.clear();
        this.resourceTypes.clear();
    }
}
/**
 * Helper function to create a resource type.
 */
export function createResourceType(name, create) {
    return {
        name,
        id: 0, // Will be set by registry
        create,
    };
}
