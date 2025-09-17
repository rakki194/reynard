// Sparse set-based component storage implementation
export class SparseSetStorage {
    constructor() {
        Object.defineProperty(this, "components", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    insert(entityIndex, component) {
        this.components.set(entityIndex, component);
    }
    get(entityIndex) {
        return this.components.get(entityIndex);
    }
    remove(entityIndex) {
        const component = this.components.get(entityIndex);
        this.components.delete(entityIndex);
        return component;
    }
    has(entityIndex) {
        return this.components.has(entityIndex);
    }
    getEntities() {
        return Array.from(this.components.keys());
    }
    getComponents() {
        return Array.from(this.components.values());
    }
    getCount() {
        return this.components.size;
    }
    clear() {
        this.components.clear();
    }
}
