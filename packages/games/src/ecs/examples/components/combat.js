// Combat and health components
import { StorageType } from "../../types";
export class Health {
    constructor(current, max) {
        Object.defineProperty(this, "current", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: current
        });
        Object.defineProperty(this, "max", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: max
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Damage {
    constructor(amount) {
        Object.defineProperty(this, "amount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: amount
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Collider {
    constructor(radius) {
        Object.defineProperty(this, "radius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: radius
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Lifetime {
    constructor(remaining) {
        Object.defineProperty(this, "remaining", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: remaining
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
// Component Type Definitions
export const HealthType = {
    name: "Health",
    id: 6,
    storage: StorageType.Table,
    create: () => new Health(100, 100),
};
export const DamageType = {
    name: "Damage",
    id: 7,
    storage: StorageType.Table,
    create: () => new Damage(10),
};
export const ColliderType = {
    name: "Collider",
    id: 11,
    storage: StorageType.Table,
    create: () => new Collider(10),
};
export const LifetimeType = {
    name: "Lifetime",
    id: 13,
    storage: StorageType.Table,
    create: () => new Lifetime(1),
};
