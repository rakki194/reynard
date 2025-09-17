import { Component, ComponentType } from "../../types";
export declare class Health implements Component {
    current: number;
    max: number;
    readonly __component = true;
    constructor(current: number, max: number);
}
export declare class Damage implements Component {
    amount: number;
    readonly __component = true;
    constructor(amount: number);
}
export declare class Collider implements Component {
    radius: number;
    readonly __component = true;
    constructor(radius: number);
}
export declare class Lifetime implements Component {
    remaining: number;
    readonly __component = true;
    constructor(remaining: number);
}
export declare const HealthType: ComponentType<Health>;
export declare const DamageType: ComponentType<Damage>;
export declare const ColliderType: ComponentType<Collider>;
export declare const LifetimeType: ComponentType<Lifetime>;
