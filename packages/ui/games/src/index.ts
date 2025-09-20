// Main exports for reynard-games package

// Game components
export { CollisionGame } from "./collision";
export { UnionFindGame } from "./union-find";

// Rogue-like game
export { GeometryDemo } from "./geometry";
export { PerformanceDemo } from "./performance";
export { RoguelikeGameComponent } from "./roguelike";
export { SpatialHashDemo } from "./spatial-hash";

// ECS System
export * from "./ecs";

// ECS Examples
export * from "./ecs/examples";

// Types
export type {
  Ball,
  Collision,
  GameConfig,
  GameControls,
  GameState,
  GameStats,
  Measurement,
  Operation,
  QueryRect,
  Shape,
  SpatialObject,
} from "./types";
