/**
 * Service Registry
 *
 * Manages service registration and discovery.
 */
export class ServiceRegistry {
    constructor() {
        Object.defineProperty(this, "_services", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    register(config) {
        if (this._services.has(config.name)) {
            console.warn(`Service '${config.name}' is already registered, overwriting`);
        }
        this._services.set(config.name, { ...config });
    }
    unregister(name) {
        this._services.delete(name);
    }
    get(name) {
        const config = this._services.get(name);
        return config ? { ...config } : undefined;
    }
    getAll() {
        const result = {};
        for (const [name, config] of this._services) {
            result[name] = { ...config };
        }
        return result;
    }
    isRegistered(name) {
        return this._services.has(name);
    }
    getRegisteredNames() {
        return Array.from(this._services.keys());
    }
    clear() {
        this._services.clear();
    }
    size() {
        return this._services.size;
    }
}
