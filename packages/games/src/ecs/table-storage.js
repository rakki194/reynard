// Table-based component storage implementation
export class TableStorage {
    constructor() {
        Object.defineProperty(this, "components", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "entityToIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "indexToEntity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    insert(entityIndex, component) {
        if (this.entityToIndex.has(entityIndex)) {
            const index = this.entityToIndex.get(entityIndex);
            this.components[index] = component;
        }
        else {
            const index = this.components.length;
            this.components.push(component);
            this.entityToIndex.set(entityIndex, index);
            this.indexToEntity.set(index, entityIndex);
        }
    }
    get(entityIndex) {
        const index = this.entityToIndex.get(entityIndex);
        return index !== undefined ? this.components[index] : undefined;
    }
    remove(entityIndex) {
        const index = this.entityToIndex.get(entityIndex);
        if (index === undefined)
            return undefined;
        const component = this.components[index];
        const lastIndex = this.components.length - 1;
        if (index !== lastIndex) {
            const lastEntity = this.indexToEntity.get(lastIndex);
            this.components[index] = this.components[lastIndex];
            this.entityToIndex.set(lastEntity, index);
            this.indexToEntity.set(index, lastEntity);
        }
        this.components.pop();
        this.entityToIndex.delete(entityIndex);
        this.indexToEntity.delete(lastIndex);
        return component;
    }
    has(entityIndex) {
        return this.entityToIndex.has(entityIndex);
    }
    getEntities() {
        return Array.from(this.entityToIndex.keys());
    }
    getComponents() {
        return [...this.components];
    }
    getCount() {
        return this.components.length;
    }
    clear() {
        this.components.length = 0;
        this.entityToIndex.clear();
        this.indexToEntity.clear();
    }
}
