// Marker components (zero-sized)
import { StorageType } from "../../types";
export class Static {
    constructor() {
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Dynamic {
    constructor() {
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Destructible {
    constructor() {
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Collectible {
    constructor() {
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
// Component Type Definitions
export const StaticType = {
    name: "Static",
    id: 14,
    storage: StorageType.SparseSet,
    create: () => new Static(),
};
export const DynamicType = {
    name: "Dynamic",
    id: 15,
    storage: StorageType.SparseSet,
    create: () => new Dynamic(),
};
export const DestructibleType = {
    name: "Destructible",
    id: 16,
    storage: StorageType.SparseSet,
    create: () => new Destructible(),
};
export const CollectibleType = {
    name: "Collectible",
    id: 17,
    storage: StorageType.SparseSet,
    create: () => new Collectible(),
};
