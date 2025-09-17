// Rogue-like game resources for ECS
// === Game State Resources ===
export class GameState {
    constructor(state = "playing", turn = 0, message = "") {
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: state
        });
        Object.defineProperty(this, "turn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: turn
        });
        Object.defineProperty(this, "message", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: message
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class DungeonMap {
    constructor(width = 80, height = 25, tiles = [], rooms = [], corridors = []) {
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
        Object.defineProperty(this, "tiles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: tiles
        });
        Object.defineProperty(this, "rooms", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: rooms
        });
        Object.defineProperty(this, "corridors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: corridors
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class PlayerInput {
    constructor(keys = new Set(), lastKey = "", mouseX = 0, mouseY = 0, mousePressed = false) {
        Object.defineProperty(this, "keys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: keys
        });
        Object.defineProperty(this, "lastKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: lastKey
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
export class GameConfig {
    constructor(tileSize = 16, canvasWidth = 1280, canvasHeight = 720, fontFamily = "monospace", fontSize = 16, showFPS = true, showDebug = false) {
        Object.defineProperty(this, "tileSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: tileSize
        });
        Object.defineProperty(this, "canvasWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: canvasWidth
        });
        Object.defineProperty(this, "canvasHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: canvasHeight
        });
        Object.defineProperty(this, "fontFamily", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: fontFamily
        });
        Object.defineProperty(this, "fontSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: fontSize
        });
        Object.defineProperty(this, "showFPS", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: showFPS
        });
        Object.defineProperty(this, "showDebug", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: showDebug
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
    constructor(x = 0, y = 0, zoom = 1, followTarget) {
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
        Object.defineProperty(this, "followTarget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: followTarget
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class MessageLog {
    constructor(messages = [], maxMessages = 100) {
        Object.defineProperty(this, "messages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: messages
        });
        Object.defineProperty(this, "maxMessages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maxMessages
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
export class GameTime {
    constructor(deltaTime = 0, totalTime = 0, lastUpdate = 0) {
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
        Object.defineProperty(this, "lastUpdate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: lastUpdate
        });
        Object.defineProperty(this, "__resource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
}
// === Resource Type Definitions ===
export const GameStateType = {
    name: "GameState",
    id: 0,
    create: () => new GameState(),
};
export const DungeonMapType = {
    name: "DungeonMap",
    id: 1,
    create: () => new DungeonMap(),
};
export const PlayerInputType = {
    name: "PlayerInput",
    id: 2,
    create: () => new PlayerInput(),
};
export const GameConfigType = {
    name: "GameConfig",
    id: 3,
    create: () => new GameConfig(),
};
export const CameraType = {
    name: "Camera",
    id: 4,
    create: () => new Camera(),
};
export const MessageLogType = {
    name: "MessageLog",
    id: 5,
    create: () => new MessageLog(),
};
export const GameTimeType = {
    name: "GameTime",
    id: 6,
    create: () => new GameTime(),
};
