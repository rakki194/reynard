import type { Vector3, Object3D, Camera, WebGLRenderer, Scene } from "three";

export interface MazeCell {
  x: number;
  z: number;
  walls: { north: boolean; south: boolean; east: boolean; west: boolean };
  visited: boolean;
}

export interface PlayerPosition {
  x: number;
  z: number;
}

export interface GameScene {
  scene: Scene;
  camera: Camera;
  renderer: WebGLRenderer;
  controls: any; // OrbitControls from three-stdlib
}

export interface GamePlayer extends Object3D {
  position: Vector3;
}

export interface GameControls {
  target: Vector3;
}

export interface MovementInput {
  deltaX: number;
  deltaZ: number;
}

export interface SceneSetupCallback {
  (): void;
}

export interface GameSceneSetupFunction {
  (
    scene: Scene,
    camera: Camera,
    renderer: WebGLRenderer,
    controls: GameControls,
    onSceneReady: SceneSetupCallback
  ): Promise<{ player: GamePlayer; THREE: any }>;
}

export interface ScoreUpdateCallback {
  (score: number): void;
}

export interface SceneReadyHandler {
  (scene: Scene, camera: Camera, renderer: WebGLRenderer, controls: GameControls): Promise<void>;
}

export interface MazeGameLogic {
  score: () => number;
  playerPosition: () => PlayerPosition;
  exitFound: () => boolean;
  mazeSize: number;
  handleSceneReady: SceneReadyHandler;
}

export interface SceneHandlerResult {
  handleSceneReady: SceneReadyHandler;
  player: () => GamePlayer | undefined;
  camera: () => Camera | undefined;
  controls: () => GameControls | undefined;
}

export interface MazeGameUIProps {
  score: () => number;
  playerPosition: () => PlayerPosition;
  exitFound: () => boolean;
  mazeSize: number;
  onSceneReady: SceneReadyHandler;
}
