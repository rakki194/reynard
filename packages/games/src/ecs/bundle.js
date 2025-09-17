// Bundle system for grouped component operations
/**
 * Creates bundle info.
 */
export function createBundleInfo(id, name, componentTypes) {
    return { id, name, componentTypes };
}
/**
 * Bundle registry for managing bundle types.
 */
export class BundleRegistry {
    constructor() {
        Object.defineProperty(this, "bundles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "bundleIds", {
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
     * Registers a new bundle type.
     */
    register(name, componentTypes) {
        if (this.bundles.has(name)) {
            throw new Error(`Bundle type '${name}' is already registered`);
        }
        const id = this.nextId++;
        const bundleInfo = {
            id,
            name,
            componentTypes,
        };
        this.bundles.set(name, bundleInfo);
        this.bundleIds.set(id, bundleInfo);
        return bundleInfo;
    }
    /**
     * Gets a bundle by name.
     */
    getByName(name) {
        return this.bundles.get(name);
    }
    /**
     * Gets a bundle by ID.
     */
    getById(id) {
        return this.bundleIds.get(id);
    }
    /**
     * Gets all registered bundles.
     */
    getAllBundles() {
        return Array.from(this.bundles.values());
    }
    /**
     * Checks if a bundle is registered.
     */
    has(name) {
        return this.bundles.has(name);
    }
}
/**
 * Helper function to create a bundle from components.
 */
export function createBundle(components) {
    return {
        __bundle: true,
        components,
    };
}
/**
 * Helper function to create a bundle from component types with default values.
 */
export function createBundleFromTypes(componentTypes) {
    const components = componentTypes.map((ct) => ct.create());
    return createBundle(components);
}
