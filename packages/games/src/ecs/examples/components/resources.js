// Game resources
export class GameTime {
    constructor(deltaTime, totalTime) {
        Object.defineProperty(this, "deltaTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: deltaTime
        });
        Object.defineProperty(this, "totalTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: totalTime
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class GameState {
    constructor(score, level, isGameOver = false) {
        Object.defineProperty(this, "score", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: score
        });
        Object.defineProperty(this, "level", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: level
        });
        Object.defineProperty(this, "isGameOver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: isGameOver
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class InputState {
    constructor(keys = new Set(), mouseX = 0, mouseY = 0, mousePressed = false) {
        Object.defineProperty(this, "keys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: keys
        });
        Object.defineProperty(this, "mouseX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: mouseX
        });
        Object.defineProperty(this, "mouseY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: mouseY
        });
        Object.defineProperty(this, "mousePressed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: mousePressed
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class Camera {
    constructor(x = 0, y = 0, zoom = 1) {
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
        Object.defineProperty(this, "zoom", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: zoom
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
// Resource Type Definitions
export const GameTimeType = {
    name: "GameTime",
    id: 0,
    create: () => new GameTime(0, 0),
};
export const GameStateType = {
    name: "GameState",
    id: 1,
    create: () => new GameState(0, 1, false),
};
export const InputStateType = {
    name: "InputState",
    id: 2,
    create: () => new InputState(),
};
export const CameraType = {
    name: "Camera",
    id: 3,
    create: () => new Camera(),
};
