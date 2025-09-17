import { Resource, ResourceType } from "../ecs/types";
export declare class GameState implements Resource {
    state: "playing" | "paused" | "gameOver" | "victory";
    turn: number;
    message: string;
    readonly __resource = true;
    constructor(state?: "playing" | "paused" | "gameOver" | "victory", turn?: number, message?: string);
}
export declare class DungeonMap implements Resource {
    width: number;
    height: number;
    tiles: Array<Array<{
        type: string;
        explored: boolean;
        visible: boolean;
    }>>;
    rooms: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
    corridors: Array<{
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    }>;
    readonly __resource = true;
    constructor(width?: number, height?: number, tiles?: Array<Array<{
        type: string;
        explored: boolean;
        visible: boolean;
    }>>, rooms?: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>, corridors?: Array<{
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    }>);
}
export declare class PlayerInput implements Resource {
    keys: Set<string>;
    lastKey: string;
    mouseX: number;
    mouseY: number;
    mousePressed: boolean;
    readonly __resource = true;
    constructor(keys?: Set<string>, lastKey?: string, mouseX?: number, mouseY?: number, mousePressed?: boolean);
}
export declare class GameConfig implements Resource {
    tileSize: number;
    canvasWidth: number;
    canvasHeight: number;
    fontFamily: string;
    fontSize: number;
    showFPS: boolean;
    showDebug: boolean;
    readonly __resource = true;
    constructor(tileSize?: number, canvasWidth?: number, canvasHeight?: number, fontFamily?: string, fontSize?: number, showFPS?: boolean, showDebug?: boolean);
}
export declare class Camera implements Resource {
    x: number;
    y: number;
    zoom: number;
    followTarget?: number | undefined;
    readonly __resource = true;
    constructor(x?: number, y?: number, zoom?: number, followTarget?: number | undefined);
}
export declare class MessageLog implements Resource {
    messages: Array<{
        text: string;
        color: string;
        timestamp: number;
    }>;
    maxMessages: number;
    readonly __resource = true;
    constructor(messages?: Array<{
        text: string;
        color: string;
        timestamp: number;
    }>, maxMessages?: number);
}
export declare class GameTime implements Resource {
    deltaTime: number;
    totalTime: number;
    lastUpdate: number;
    readonly __resource = true;
    constructor(deltaTime?: number, totalTime?: number, lastUpdate?: number);
}
export declare const GameStateType: ResourceType<GameState>;
export declare const DungeonMapType: ResourceType<DungeonMap>;
export declare const PlayerInputType: ResourceType<PlayerInput>;
export declare const GameConfigType: ResourceType<GameConfig>;
export declare const CameraType: ResourceType<Camera>;
export declare const MessageLogType: ResourceType<MessageLog>;
export declare const GameTimeType: ResourceType<GameTime>;
