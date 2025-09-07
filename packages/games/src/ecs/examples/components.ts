// Example components for ECS games

import { Component, Resource } from '../types';

// Basic game components
export class Position implements Component {
  readonly __component = true;
  constructor(public x: number, public y: number) {}
}

export class Velocity implements Component {
  readonly __component = true;
  constructor(public x: number, public y: number) {}
}

export class Size implements Component {
  readonly __component = true;
  constructor(public width: number, public height: number) {}
}

export class Color implements Component {
  readonly __component = true;
  constructor(public r: number, public g: number, public b: number, public a: number = 1) {}
}

export class Health implements Component {
  readonly __component = true;
  constructor(public current: number, public max: number) {}
}

export class Damage implements Component {
  readonly __component = true;
  constructor(public amount: number) {}
}

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

export class Collider implements Component {
  readonly __component = true;
  constructor(public radius: number) {}
}

export class Renderable implements Component {
  readonly __component = true;
  constructor(public shape: 'circle' | 'rectangle' | 'triangle') {}
}

export class Lifetime implements Component {
  readonly __component = true;
  constructor(public remaining: number) {}
}

// Game resources
export class GameTime implements Resource {
  readonly __resource = true;
  constructor(public deltaTime: number, public totalTime: number) {}
}

export class GameState implements Resource {
  readonly __resource = true;
  constructor(public score: number, public level: number, public isGameOver: boolean = false) {}
}

export class InputState implements Resource {
  readonly __resource = true;
  constructor(
    public keys: Set<string> = new Set(),
    public mouseX: number = 0,
    public mouseY: number = 0,
    public mousePressed: boolean = false
  ) {}
}

export class Camera implements Resource {
  readonly __resource = true;
  constructor(
    public x: number = 0,
    public y: number = 0,
    public zoom: number = 1
  ) {}
}

// Marker components (zero-sized)
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
