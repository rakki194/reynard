// Entity type components

import { Component, ComponentType, StorageType } from "../../types";

export class Player implements Component {
  readonly __component = true;
  constructor(public name: string) {}
}

export class Enemy implements Component {
  readonly __component = true;
  constructor(public type: string) {}
}

export class Bullet implements Component {
  readonly __component = true;
  constructor(public speed: number) {}
}

export class Renderable implements Component {
  readonly __component = true;
  constructor(public shape: "circle" | "rectangle" | "triangle") {}
}

// Component Type Definitions
export const PlayerType: ComponentType<Player> = {
  name: "Player",
  id: 8,
  storage: StorageType.SparseSet,
  create: () => new Player("Player"),
};

export const EnemyType: ComponentType<Enemy> = {
  name: "Enemy",
  id: 9,
  storage: StorageType.SparseSet,
  create: () => new Enemy("basic"),
};

export const BulletType: ComponentType<Bullet> = {
  name: "Bullet",
  id: 10,
  storage: StorageType.SparseSet,
  create: () => new Bullet(300),
};

export const RenderableType: ComponentType<Renderable> = {
  name: "Renderable",
  id: 12,
  storage: StorageType.Table,
  create: () => new Renderable("circle"),
};
