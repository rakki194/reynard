// Entity type components
import { StorageType } from "../../types";
export class Player {
    constructor(name) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Enemy {
    constructor(type) {
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: type
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Bullet {
    constructor(speed) {
        Object.defineProperty(this, "speed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: speed
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Renderable {
    constructor(shape) {
        Object.defineProperty(this, "shape", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: shape
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
export const PlayerType = {
    name: "Player",
    id: 8,
    storage: StorageType.SparseSet,
    create: () => new Player("Player"),
};
export const EnemyType = {
    name: "Enemy",
    id: 9,
    storage: StorageType.SparseSet,
    create: () => new Enemy("basic"),
};
export const BulletType = {
    name: "Bullet",
    id: 10,
    storage: StorageType.SparseSet,
    create: () => new Bullet(300),
};
export const RenderableType = {
    name: "Renderable",
    id: 12,
    storage: StorageType.Table,
    create: () => new Renderable("circle"),
};
