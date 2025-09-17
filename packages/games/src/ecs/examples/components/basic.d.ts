import { Component, ComponentType } from "../../types";
export declare class Position implements Component {
    x: number;
    y: number;
    readonly __component = true;
    constructor(x: number, y: number);
}
export declare class Velocity implements Component {
    x: number;
    y: number;
    readonly __component = true;
    constructor(x: number, y: number);
}
export declare class Acceleration implements Component {
    ax: number;
    ay: number;
    readonly __component = true;
    constructor(ax: number, ay: number);
}
export declare class Mass implements Component {
    mass: number;
    readonly __component = true;
    constructor(mass: number);
}
export declare class Size implements Component {
    width: number;
    height: number;
    readonly __component = true;
    constructor(width: number, height: number);
}
export declare class Color implements Component {
    r: number;
    g: number;
    b: number;
    a: number;
    readonly __component = true;
    constructor(r: number, g: number, b: number, a?: number);
}
export declare const PositionType: ComponentType<Position>;
export declare const VelocityType: ComponentType<Velocity>;
export declare const AccelerationType: ComponentType<Acceleration>;
export declare const MassType: ComponentType<Mass>;
export declare const SizeType: ComponentType<Size>;
export declare const ColorType: ComponentType<Color>;
