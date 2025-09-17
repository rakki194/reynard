import { Resource, ResourceType } from "../../types";
export declare class GameTime implements Resource {
    deltaTime: number;
    totalTime: number;
    readonly __resource = true;
    constructor(deltaTime: number, totalTime: number);
}
export declare class GameState implements Resource {
    score: number;
    level: number;
    isGameOver: boolean;
    readonly __resource = true;
    constructor(score: number, level: number, isGameOver?: boolean);
}
export declare class InputState implements Resource {
    keys: Set<string>;
    mouseX: number;
    mouseY: number;
    mousePressed: boolean;
    readonly __resource = true;
    constructor(keys?: Set<string>, mouseX?: number, mouseY?: number, mousePressed?: boolean);
}
export declare class Camera implements Resource {
    x: number;
    y: number;
    zoom: number;
    readonly __resource = true;
    constructor(x?: number, y?: number, zoom?: number);
}
export declare const GameTimeType: ResourceType<GameTime>;
export declare const GameStateType: ResourceType<GameState>;
export declare const InputStateType: ResourceType<InputState>;
export declare const CameraType: ResourceType<Camera>;
