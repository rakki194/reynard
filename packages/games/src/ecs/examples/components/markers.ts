// Marker components (zero-sized)

import { Component, ComponentType, StorageType } from '../../types';

export class Static implements Component {
  readonly __component = true;
}

export class Dynamic implements Component {
  readonly __component = true;
}

export class Destructible implements Component {
  readonly __component = true;
}

export class Collectible implements Component {
  readonly __component = true;
}

// Component Type Definitions
export const StaticType: ComponentType<Static> = {
  name: 'Static',
  id: 14,
  storage: StorageType.SparseSet,
  create: () => new Static()
};

export const DynamicType: ComponentType<Dynamic> = {
  name: 'Dynamic',
  id: 15,
  storage: StorageType.SparseSet,
  create: () => new Dynamic()
};

export const DestructibleType: ComponentType<Destructible> = {
  name: 'Destructible',
  id: 16,
  storage: StorageType.SparseSet,
  create: () => new Destructible()
};

export const CollectibleType: ComponentType<Collectible> = {
  name: 'Collectible',
  id: 17,
  storage: StorageType.SparseSet,
  create: () => new Collectible()
};
