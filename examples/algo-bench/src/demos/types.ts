import type { CollisionResult } from "reynard-algorithms";

export interface PhysicsObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  mass: number;
  color: string;
  colliding: boolean;
  isStatic: boolean;
}

export interface CollisionData {
  index1: number;
  index2: number;
  result: CollisionResult;
}

export interface DemoStats {
  collisionChecks: number;
  actualCollisions: number;
  fps: number;
  lastFrameTime: number;
  totalEnergy?: number;
}

export type PhysicsStats = DemoStats;

export interface AABBCollisionDemoProps {
  onStatsUpdate: (stats: () => DemoStats) => void;
}
