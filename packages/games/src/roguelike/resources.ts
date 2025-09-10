// Rogue-like game resources for ECS

import { Resource, ResourceType } from "../ecs/types";

// === Game State Resources ===

export class GameState implements Resource {
    readonly __resource = true;
    constructor(
        public state: "playing" | "paused" | "gameOver" | "victory" = "playing",
        public turn: number = 0,
        public message: string = "",
    ) { }
}

export class DungeonMap implements Resource {
    readonly __resource = true;
    constructor(
        public width: number = 80,
        public height: number = 25,
        public tiles: Array<Array<{ type: string; explored: boolean; visible: boolean }>> = [],
        public rooms: Array<{ x: number; y: number; width: number; height: number }> = [],
        public corridors: Array<{ x1: number; y1: number; x2: number; y2: number }> = [],
    ) { }
}

export class PlayerInput implements Resource {
    readonly __resource = true;
    constructor(
        public keys: Set<string> = new Set(),
        public lastKey: string = "",
        public mouseX: number = 0,
        public mouseY: number = 0,
        public mousePressed: boolean = false,
    ) { }
}

export class GameConfig implements Resource {
    readonly __resource = true;
    constructor(
        public tileSize: number = 16,
        public canvasWidth: number = 1280,
        public canvasHeight: number = 720,
        public fontFamily: string = "monospace",
        public fontSize: number = 16,
        public showFPS: boolean = true,
        public showDebug: boolean = false,
    ) { }
}

export class Camera implements Resource {
    readonly __resource = true;
    constructor(
        public x: number = 0,
        public y: number = 0,
        public zoom: number = 1,
        public followTarget?: number, // entity id
    ) { }
}

export class MessageLog implements Resource {
    readonly __resource = true;
    constructor(
        public messages: Array<{ text: string; color: string; timestamp: number }> = [],
        public maxMessages: number = 100,
    ) { }
}

export class GameTime implements Resource {
    readonly __resource = true;
    constructor(
        public deltaTime: number = 0,
        public totalTime: number = 0,
        public lastUpdate: number = 0,
    ) { }
}

// === Resource Type Definitions ===

export const GameStateType: ResourceType<GameState> = {
    name: "GameState",
    id: 0,
    create: () => new GameState(),
};

export const DungeonMapType: ResourceType<DungeonMap> = {
    name: "DungeonMap",
    id: 1,
    create: () => new DungeonMap(),
};

export const PlayerInputType: ResourceType<PlayerInput> = {
    name: "PlayerInput",
    id: 2,
    create: () => new PlayerInput(),
};

export const GameConfigType: ResourceType<GameConfig> = {
    name: "GameConfig",
    id: 3,
    create: () => new GameConfig(),
};

export const CameraType: ResourceType<Camera> = {
    name: "Camera",
    id: 4,
    create: () => new Camera(),
};

export const MessageLogType: ResourceType<MessageLog> = {
    name: "MessageLog",
    id: 5,
    create: () => new MessageLog(),
};

export const GameTimeType: ResourceType<GameTime> = {
    name: "GameTime",
    id: 6,
    create: () => new GameTime(),
};
