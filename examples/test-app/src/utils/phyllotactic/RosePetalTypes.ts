/**
 * 🌹 Rose Petal Types and Interfaces
 * Type definitions for the rose petal growth animation system
 */

export type PetalShape = 'inner' | 'middle' | 'outer' | 'bud';
export type GrowthMode = 'gaussian' | 'natural' | 'hybrid';
export type PetalUnfoldPhase = 'closed' | 'unfolding' | 'open' | 'mature';

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
  // Natural growth properties
  unfoldPhase: PetalUnfoldPhase;
  lobeSeparation: number; // 0-1, how much the two lobes are separated
  petalBundle: number; // Which 5-petal bundle this belongs to
  sepalVisible: boolean; // Whether the sepal is visible from above
  naturalGrowthProgress: number; // Separate from growthProgress for natural mode
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
  // Natural growth configuration
  growthMode: GrowthMode;
  unfoldSpeed: number; // Speed of petal unfolding (0.01-0.05)
  lobeSeparationSpeed: number; // Speed of lobe separation (0.005-0.02)
  bundleGrowthDelay: number; // Delay between petal bundles (0.1-0.5)
  sepalVisibility: boolean; // Whether to show sepals as green points
}

export type GrowthPhase = 'bud' | 'blooming' | 'full' | 'wilting';