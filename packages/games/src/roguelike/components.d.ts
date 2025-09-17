import { Component, ComponentType } from "../ecs/types";
export { Enemy, EnemyType, Health, HealthType, Player, PlayerType, Position, PositionType, Velocity, VelocityType, } from "../ecs/examples/components";
export declare class Tile implements Component {
    type: "floor" | "wall" | "door" | "stairs";
    explored: boolean;
    visible: boolean;
    readonly __component = true;
    constructor(type: "floor" | "wall" | "door" | "stairs", explored?: boolean, visible?: boolean);
}
export declare class Sprite implements Component {
    char: string;
    fg: string;
    bg: string;
    readonly __component = true;
    constructor(char: string, fg?: string, bg?: string);
}
export declare class Inventory implements Component {
    items: string[];
    maxSize: number;
    readonly __component = true;
    constructor(items?: string[], maxSize?: number);
}
export declare class Stats implements Component {
    level: number;
    experience: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    readonly __component = true;
    constructor(level?: number, experience?: number, strength?: number, dexterity?: number, constitution?: number, intelligence?: number);
}
export declare class Equipment implements Component {
    weapon?: string | undefined;
    armor?: string | undefined;
    accessory?: string | undefined;
    readonly __component = true;
    constructor(weapon?: string | undefined, armor?: string | undefined, accessory?: string | undefined);
}
export declare class AI implements Component {
    type: "passive" | "aggressive" | "guard" | "wander";
    target?: number | undefined;
    state: "idle" | "hunting" | "fleeing" | "dead";
    readonly __component = true;
    constructor(type: "passive" | "aggressive" | "guard" | "wander", target?: number | undefined, // entity id
    state?: "idle" | "hunting" | "fleeing" | "dead");
}
export declare class Vision implements Component {
    radius: number;
    readonly __component = true;
    constructor(radius?: number);
}
export declare class Movement implements Component {
    speed: number;
    canMove: boolean;
    readonly __component = true;
    constructor(speed?: number, canMove?: boolean);
}
export declare class DungeonLevel implements Component {
    level: number;
    width: number;
    height: number;
    readonly __component = true;
    constructor(level?: number, width?: number, height?: number);
}
export declare class RoguelikeItem implements Component {
    name: string;
    type: "weapon" | "armor" | "potion" | "scroll" | "food";
    value: number;
    description: string;
    readonly __component = true;
    constructor(name: string, type: "weapon" | "armor" | "potion" | "scroll" | "food", value?: number, description?: string);
}
export declare const TileType: ComponentType<Tile>;
export declare const SpriteType: ComponentType<Sprite>;
export declare const StatsType: ComponentType<Stats>;
export declare const EquipmentType: ComponentType<Equipment>;
export declare const ItemType: ComponentType<RoguelikeItem>;
export declare const AIType: ComponentType<AI>;
export declare const VisionType: ComponentType<Vision>;
export declare const MovementType: ComponentType<Movement>;
export declare const DungeonLevelType: ComponentType<DungeonLevel>;
export declare const InventoryType: ComponentType<Inventory>;
export declare const RoguelikeItemType: ComponentType<RoguelikeItem>;
