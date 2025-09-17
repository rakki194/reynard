// Rogue-like game components for ECS

import { Component, ComponentType, StorageType } from "../ecs/types";

// Re-export basic components from ECS examples
export {
  Enemy,
  EnemyType,
  Health,
  HealthType,
  Player,
  PlayerType,
  Position,
  PositionType,
  Velocity,
  VelocityType,
} from "../ecs/examples/components";

// === Basic Rogue-like Components ===

export class Tile implements Component {
  readonly __component = true;
  constructor(
    public type: "floor" | "wall" | "door" | "stairs",
    public explored: boolean = false,
    public visible: boolean = false
  ) {}
}

export class Sprite implements Component {
  readonly __component = true;
  constructor(
    public char: string,
    public fg: string = "#ffffff",
    public bg: string = "#000000"
  ) {}
}

export class Inventory implements Component {
  readonly __component = true;
  constructor(
    public items: string[] = [],
    public maxSize: number = 10
  ) {}
}

export class Stats implements Component {
  readonly __component = true;
  constructor(
    public level: number = 1,
    public experience: number = 0,
    public strength: number = 10,
    public dexterity: number = 10,
    public constitution: number = 10,
    public intelligence: number = 10
  ) {}
}

export class Equipment implements Component {
  readonly __component = true;
  constructor(
    public weapon?: string,
    public armor?: string,
    public accessory?: string
  ) {}
}

export class AI implements Component {
  readonly __component = true;
  constructor(
    public type: "passive" | "aggressive" | "guard" | "wander",
    public target?: number, // entity id
    public state: "idle" | "hunting" | "fleeing" | "dead" = "idle"
  ) {}
}

export class Vision implements Component {
  readonly __component = true;
  constructor(public radius: number = 5) {}
}

export class Movement implements Component {
  readonly __component = true;
  constructor(
    public speed: number = 1,
    public canMove: boolean = true
  ) {}
}

export class DungeonLevel implements Component {
  readonly __component = true;
  constructor(
    public level: number = 1,
    public width: number = 80,
    public height: number = 25
  ) {}
}

export class RoguelikeItem implements Component {
  readonly __component = true;
  constructor(
    public name: string,
    public type: "weapon" | "armor" | "potion" | "scroll" | "food",
    public value: number = 0,
    public description: string = ""
  ) {}
}

// === Component Type Definitions ===

export const TileType: ComponentType<Tile> = {
  name: "Tile",
  id: 20,
  storage: StorageType.Table,
  create: () => new Tile("floor"),
};

export const SpriteType: ComponentType<Sprite> = {
  name: "Sprite",
  id: 21,
  storage: StorageType.Table,
  create: () => new Sprite("@", "#ffffff", "#000000"),
};

export const StatsType: ComponentType<Stats> = {
  name: "Stats",
  id: 23,
  storage: StorageType.SparseSet,
  create: () => new Stats(),
};

export const EquipmentType: ComponentType<Equipment> = {
  name: "Equipment",
  id: 24,
  storage: StorageType.SparseSet,
  create: () => new Equipment(),
};

export const ItemType: ComponentType<RoguelikeItem> = {
  name: "Item",
  id: 25,
  storage: StorageType.SparseSet,
  create: () => new RoguelikeItem("Unknown Item", "food"),
};

export const AIType: ComponentType<AI> = {
  name: "AI",
  id: 26,
  storage: StorageType.SparseSet,
  create: () => new AI("passive"),
};

export const VisionType: ComponentType<Vision> = {
  name: "Vision",
  id: 27,
  storage: StorageType.SparseSet,
  create: () => new Vision(5),
};

export const MovementType: ComponentType<Movement> = {
  name: "Movement",
  id: 28,
  storage: StorageType.SparseSet,
  create: () => new Movement(1),
};

export const DungeonLevelType: ComponentType<DungeonLevel> = {
  name: "DungeonLevel",
  id: 29,
  storage: StorageType.SparseSet,
  create: () => new DungeonLevel(1),
};

// Add missing component types
export const InventoryType: ComponentType<Inventory> = {
  name: "Inventory",
  id: 30,
  storage: StorageType.SparseSet,
  create: () => new Inventory(),
};

export const RoguelikeItemType: ComponentType<RoguelikeItem> = {
  name: "RoguelikeItem",
  id: 31,
  storage: StorageType.SparseSet,
  create: () => new RoguelikeItem("Unknown Item", "food"),
};
