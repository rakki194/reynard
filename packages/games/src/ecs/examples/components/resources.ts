// Game resources

import { Resource, ResourceType } from "../../types";

export class GameTime implements Resource {
  readonly __resource = true;
  constructor(
    public deltaTime: number,
    public totalTime: number,
  ) {}
}

export class GameState implements Resource {
  readonly __resource = true;
  constructor(
    public score: number,
    public level: number,
    public isGameOver: boolean = false,
  ) {}
}

export class InputState implements Resource {
  readonly __resource = true;
  constructor(
    public keys: Set<string> = new Set(),
    public mouseX: number = 0,
    public mouseY: number = 0,
    public mousePressed: boolean = false,
  ) {}
}

export class Camera implements Resource {
  readonly __resource = true;
  constructor(
    public x: number = 0,
    public y: number = 0,
    public zoom: number = 1,
  ) {}
}

// Resource Type Definitions
export const GameTimeType: ResourceType<GameTime> = {
  name: "GameTime",
  id: 0,
  create: () => new GameTime(0, 0),
};

export const GameStateType: ResourceType<GameState> = {
  name: "GameState",
  id: 1,
  create: () => new GameState(0, 1, false),
};

export const InputStateType: ResourceType<InputState> = {
  name: "InputState",
  id: 2,
  create: () => new InputState(),
};

export const CameraType: ResourceType<Camera> = {
  name: "Camera",
  id: 3,
  create: () => new Camera(),
};
