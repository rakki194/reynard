// Rogue-like game components for ECS
import { StorageType } from "../ecs/types";
// Re-export basic components from ECS examples
export { Enemy, EnemyType, Health, HealthType, Player, PlayerType, Position, PositionType, Velocity, VelocityType, } from "../ecs/examples/components";
// === Basic Rogue-like Components ===
export class Tile {
    constructor(type, explored = false, visible = false) {
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: type
        });
        Object.defineProperty(this, "explored", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: explored
        });
        Object.defineProperty(this, "visible", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: visible
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Sprite {
    constructor(char, fg = "#ffffff", bg = "#000000") {
        Object.defineProperty(this, "char", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: char
        });
        Object.defineProperty(this, "fg", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: fg
        });
        Object.defineProperty(this, "bg", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: bg
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Inventory {
    constructor(items = [], maxSize = 10) {
        Object.defineProperty(this, "items", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: items
        });
        Object.defineProperty(this, "maxSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maxSize
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Stats {
    constructor(level = 1, experience = 0, strength = 10, dexterity = 10, constitution = 10, intelligence = 10) {
        Object.defineProperty(this, "level", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: level
        });
        Object.defineProperty(this, "experience", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: experience
        });
        Object.defineProperty(this, "strength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: strength
        });
        Object.defineProperty(this, "dexterity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: dexterity
        });
        Object.defineProperty(this, "constitution", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: constitution
        });
        Object.defineProperty(this, "intelligence", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: intelligence
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Equipment {
    constructor(weapon, armor, accessory) {
        Object.defineProperty(this, "weapon", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: weapon
        });
        Object.defineProperty(this, "armor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: armor
        });
        Object.defineProperty(this, "accessory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: accessory
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class AI {
    constructor(type, target, // entity id
    state = "idle") {
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: type
        });
        Object.defineProperty(this, "target", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: target
        });
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: state
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Vision {
    constructor(radius = 5) {
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
export class Movement {
    constructor(speed = 1, canMove = true) {
        Object.defineProperty(this, "speed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: speed
        });
        Object.defineProperty(this, "canMove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: canMove
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class DungeonLevel {
    constructor(level = 1, width = 80, height = 25) {
        Object.defineProperty(this, "level", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: level
        });
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: width
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: height
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class RoguelikeItem {
    constructor(name, type, value = 0, description = "") {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: type
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: value
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
// === Component Type Definitions ===
export const TileType = {
    name: "Tile",
    id: 20,
    storage: StorageType.Table,
    create: () => new Tile("floor"),
};
export const SpriteType = {
    name: "Sprite",
    id: 21,
    storage: StorageType.Table,
    create: () => new Sprite("@", "#ffffff", "#000000"),
};
export const StatsType = {
    name: "Stats",
    id: 23,
    storage: StorageType.SparseSet,
    create: () => new Stats(),
};
export const EquipmentType = {
    name: "Equipment",
    id: 24,
    storage: StorageType.SparseSet,
    create: () => new Equipment(),
};
export const ItemType = {
    name: "Item",
    id: 25,
    storage: StorageType.SparseSet,
    create: () => new RoguelikeItem("Unknown Item", "food"),
};
export const AIType = {
    name: "AI",
    id: 26,
    storage: StorageType.SparseSet,
    create: () => new AI("passive"),
};
export const VisionType = {
    name: "Vision",
    id: 27,
    storage: StorageType.SparseSet,
    create: () => new Vision(5),
};
export const MovementType = {
    name: "Movement",
    id: 28,
    storage: StorageType.SparseSet,
    create: () => new Movement(1),
};
export const DungeonLevelType = {
    name: "DungeonLevel",
    id: 29,
    storage: StorageType.SparseSet,
    create: () => new DungeonLevel(1),
};
// Add missing component types
export const InventoryType = {
    name: "Inventory",
    id: 30,
    storage: StorageType.SparseSet,
    create: () => new Inventory(),
};
export const RoguelikeItemType = {
    name: "RoguelikeItem",
    id: 31,
    storage: StorageType.SparseSet,
    create: () => new RoguelikeItem("Unknown Item", "food"),
};
