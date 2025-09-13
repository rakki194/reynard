/**
 * 🌹 Rose Petal Types and Interfaces
 * Type definitions for the rose petal growth animation system
 */

export type PetalShape = 'inner' | 'middle' | 'outer';

export interface RosePetal {
  id: number;
  x: number;
  y: number;
  angle: number;
  radius: number;
  size: number;
  growthProgress: number;
  color: string;
  petalShape: PetalShape;
  age: number;
  maxAge: number;
  rotation: number;
  scale: number;
  opacity: number;
}

export interface RosePetalConfig {
  petalCount: number;
  goldenAngle: number;
  centerX: number;
  centerY: number;
  baseRadius: number;
  growthSpeed: number;
  maxPetalSize: number;
  colorVariation: number;
  petalLayers: number;
  animationSpeed: number;
}

export type GrowthPhase = 'bud' | 'blooming' | 'full' | 'wilting';