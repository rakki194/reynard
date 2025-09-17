// Combat and health components

import { Component, ComponentType, StorageType } from "../../types";

export class Health implements Component {
  readonly __component = true;
  constructor(
    public current: number,
    public max: number
  ) {}
}

export class Damage implements Component {
  readonly __component = true;
  constructor(public amount: number) {}
}

export class Collider implements Component {
  readonly __component = true;
  constructor(public radius: number) {}
}

export class Lifetime implements Component {
  readonly __component = true;
  constructor(public remaining: number) {}
}

// Component Type Definitions
export const HealthType: ComponentType<Health> = {
  name: "Health",
  id: 6,
  storage: StorageType.Table,
  create: () => new Health(100, 100),
};

export const DamageType: ComponentType<Damage> = {
  name: "Damage",
  id: 7,
  storage: StorageType.Table,
  create: () => new Damage(10),
};

export const ColliderType: ComponentType<Collider> = {
  name: "Collider",
  id: 11,
  storage: StorageType.Table,
  create: () => new Collider(10),
};

export const LifetimeType: ComponentType<Lifetime> = {
  name: "Lifetime",
  id: 13,
  storage: StorageType.Table,
  create: () => new Lifetime(1),
};
