import { Component, ComponentType } from "../../types";
export declare class Static implements Component {
    readonly __component = true;
}
export declare class Dynamic implements Component {
    readonly __component = true;
}
export declare class Destructible implements Component {
    readonly __component = true;
}
export declare class Collectible implements Component {
    readonly __component = true;
}
export declare const StaticType: ComponentType<Static>;
export declare const DynamicType: ComponentType<Dynamic>;
export declare const DestructibleType: ComponentType<Destructible>;
export declare const CollectibleType: ComponentType<Collectible>;
