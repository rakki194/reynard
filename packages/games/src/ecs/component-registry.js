// Component registry for managing component types
import { StorageType } from "./types";
export class ComponentRegistry {
    constructor() {
        Object.defineProperty(this, "componentTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "componentIds", {
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
    register(name, storage = StorageType.Table, create) {
        if (this.componentTypes.has(name)) {
            throw new Error(`Component type '${name}' is already registered`);
        }
        const id = this.nextId++;
        const componentType = { name, id, storage, create };
        this.componentTypes.set(name, componentType);
        this.componentIds.set(id, componentType);
        return componentType;
    }
    getByName(name) {
        return this.componentTypes.get(name);
    }
    getById(id) {
        return this.componentIds.get(id);
    }
    getAllTypes() {
        return Array.from(this.componentTypes.values());
    }
    has(name) {
        return this.componentTypes.has(name);
    }
}
