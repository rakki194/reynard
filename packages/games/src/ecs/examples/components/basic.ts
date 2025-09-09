// Basic game components

import { Component, ComponentType, StorageType } from "../../types";

export class Position implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
  ) {}
}

export class Velocity implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
  ) {}
}

export class Acceleration implements Component {
  readonly __component = true;
  constructor(
    public ax: number,
    public ay: number,
  ) {}
}

export class Mass implements Component {
  readonly __component = true;
  constructor(public mass: number) {}
}

export class Size implements Component {
  readonly __component = true;
  constructor(
    public width: number,
    public height: number,
  ) {}
}

export class Color implements Component {
  readonly __component = true;
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number = 1,
  ) {}
}

// Component Type Definitions
export const PositionType: ComponentType<Position> = {
  name: "Position",
  id: 0,
  storage: StorageType.Table,
  create: () => new Position(0, 0),
};

export const VelocityType: ComponentType<Velocity> = {
  name: "Velocity",
  id: 1,
  storage: StorageType.Table,
  create: () => new Velocity(0, 0),
};

export const AccelerationType: ComponentType<Acceleration> = {
  name: "Acceleration",
  id: 2,
  storage: StorageType.Table,
  create: () => new Acceleration(0, 0),
};

export const MassType: ComponentType<Mass> = {
  name: "Mass",
  id: 3,
  storage: StorageType.Table,
  create: () => new Mass(1),
};

export const SizeType: ComponentType<Size> = {
  name: "Size",
  id: 4,
  storage: StorageType.Table,
  create: () => new Size(10, 10),
};

export const ColorType: ComponentType<Color> = {
  name: "Color",
  id: 5,
  storage: StorageType.Table,
  create: () => new Color(1, 1, 1, 1),
};
