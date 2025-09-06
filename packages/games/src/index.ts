// Main exports for @reynard/games package

// Game components
export { UnionFindGame } from './union-find';
export { CollisionGame } from './collision';
export { SpatialHashDemo } from './spatial-hash';
export { GeometryDemo } from './geometry';
export { PerformanceDemo } from './performance';

// Types
export type {
  GameStats,
  GameState,
  Ball,
  Collision,
  SpatialObject,
  QueryRect,
  Shape,
  Operation,
  Measurement,
  GameConfig,
  GameControls,
} from './types';
