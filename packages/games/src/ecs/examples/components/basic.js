// Basic game components
import { StorageType } from "../../types";
export class Position {
    constructor(x, y) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Velocity {
    constructor(x, y) {
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: x
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: y
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Acceleration {
    constructor(ax, ay) {
        Object.defineProperty(this, "ax", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ax
        });
        Object.defineProperty(this, "ay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ay
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Mass {
    constructor(mass) {
        Object.defineProperty(this, "mass", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: mass
        });
        Object.defineProperty(this, "__component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Size {
    constructor(width, height) {
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
export class Color {
    constructor(r, g, b, a = 1) {
        Object.defineProperty(this, "r", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: r
        });
        Object.defineProperty(this, "g", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: g
        });
        Object.defineProperty(this, "b", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: b
        });
        Object.defineProperty(this, "a", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: a
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
export const PositionType = {
    name: "Position",
    id: 0,
    storage: StorageType.Table,
    create: () => new Position(0, 0),
};
export const VelocityType = {
    name: "Velocity",
    id: 1,
    storage: StorageType.Table,
    create: () => new Velocity(0, 0),
};
export const AccelerationType = {
    name: "Acceleration",
    id: 2,
    storage: StorageType.Table,
    create: () => new Acceleration(0, 0),
};
export const MassType = {
    name: "Mass",
    id: 3,
    storage: StorageType.Table,
    create: () => new Mass(1),
};
export const SizeType = {
    name: "Size",
    id: 4,
    storage: StorageType.Table,
    create: () => new Size(10, 10),
};
export const ColorType = {
    name: "Color",
    id: 5,
    storage: StorageType.Table,
    create: () => new Color(1, 1, 1, 1),
};
