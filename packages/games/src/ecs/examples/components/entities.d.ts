import { Component, ComponentType } from "../../types";
export declare class Player implements Component {
    name: string;
    readonly __component = true;
    constructor(name: string);
}
export declare class Enemy implements Component {
    type: string;
    readonly __component = true;
    constructor(type: string);
}
export declare class Bullet implements Component {
    speed: number;
    readonly __component = true;
    constructor(speed: number);
}
export declare class Renderable implements Component {
    shape: "circle" | "rectangle" | "triangle";
    readonly __component = true;
    constructor(shape: "circle" | "rectangle" | "triangle");
}
export declare const PlayerType: ComponentType<Player>;
export declare const EnemyType: ComponentType<Enemy>;
export declare const BulletType: ComponentType<Bullet>;
export declare const RenderableType: ComponentType<Renderable>;
