// Common game types and interfaces

export interface GameStats {
  totalCollisions?: number;
  activeBalls?: number;
  averageSpeed?: number;
  score?: number;
  moves?: number;
  comboCount?: number;
}

export interface GameState {
  state: 'playing' | 'won' | 'lost' | 'game-over' | 'paused';
  isAnimating?: boolean;
}

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export interface Collision {
  ball1: number;
  ball2: number;
  timestamp: number;
}

export interface SpatialObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface QueryRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Shape {
  id: number;
  type: 'point' | 'line' | 'rectangle' | 'circle' | 'polygon';
  data: any;
  color: string;
}

export interface Operation {
  type: string;
  result: any;
  timestamp: number;
}

export interface Measurement {
  name: string;
  duration: number;
  memory: number;
  timestamp: number;
}

export interface GameConfig {
  gridSize?: number;
  targetConnections?: number;
  colors?: number[];
  canvasWidth?: number;
  canvasHeight?: number;
  ballCount?: number;
  objectCount?: number;
}

export interface GameControls {
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onNewGame?: () => void;
}
